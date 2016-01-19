'use strict';

angular.module('skyZoneApp')
    .service('AddOnStatus', function() {

        var addOnStatus = {};

        return {
            setAddons: function(products) {
                angular.forEach(products, function(prod, index) {
                    if (prod.isJumpTimeAddOn) {
                        addOnStatus['_' + prod.id + '_'] = {};
                        addOnStatus['_' + prod.id + '_'].prod = prod;
                        addOnStatus['_' + prod.id + '_'].jumpers = {};
                    }
                })
            },
            removeJumper: function(jumperId){
                angular.forEach(addOnStatus, function(addon){
                    angular.forEach(addon.jumpers, function(jumper, key) {
                        if(key === '_'+jumperId+'_'){
                            addon.jumpers[key] = false;
                        }
                    })
                })  
            },
            setStatus: function(productId, jumperId, status) {
                addOnStatus['_' + productId + '_'].jumpers['_' + jumperId + '_'] = status;
            },
            getStatus: function(productId, jumperId) {
                if (productId && jumperId) {
                    return addOnStatus['_' + productId + '_'].jumpers['_' + jumperId + '_'];
                } else if (productId) {
                    return addOnStatus['_' + productId + '_'];
                } else {
                    return addOnStatus;
                }
            },
            purchasedAll: function() {
                angular.forEach(addOnStatus, function(addon, adKey) {
                    angular.forEach(addon.jumpers, function(jumper, key) {
                        addon.jumpers[key] = false;
                    })
                })
            }
        }
    })
    .controller('SPJumpersController', ['$scope', '$routeParams', '$modal', '$rootScope', '$q', '$location', 'Park', 'Guest', 'Order', 'Waiver', 'OrderService', 'ProfileService', 'UserService', 'NavService', 'WaiverService', 'AddOnStatus',
        function($scope, $routeParams, $modal, $rootScope, $q, $location, Park, Guest, Order, Waiver, OrderService, ProfileService, UserService, NavService, WaiverService, AddOnStatus) {

            function logErrorStopLoading(err) {
                $rootScope.$broadcast('szeHideLoading');
                $rootScope.$broadcast('szeError', err);
                $scope.showModal = false;
            }


            $scope.order = Order;
            $scope.guest = Guest;
            $scope.park = Park;
            $scope.waiver = Waiver;
            console.log($scope.guest, $scope.park, $scope.order);

            function init() {
                AddOnStatus.setAddons($scope.park.product);
                var tempStatus = null;
                angular.forEach($scope.order.participants, function(participant) {
                    angular.forEach(AddOnStatus.getStatus(), function(addon) {
                        tempStatus = AddOnStatus.setStatus(addon.prod.id, participant.id);
                        AddOnStatus.setStatus(addon.prod.id, participant.id, (tempStatus != null) ? tempStatus : true)
                    })
                });
            }
            
            

            $scope.getAddOns = function() {
                return AddOnStatus.getStatus();
            };

            $scope.showModal = false;
            $scope.modalType = '';

            $scope.getModalType = function() {
                return $scope.modalType;
            };

            $scope.toggleModal = function(type) {
                $scope.modalType = type
                $scope.showModal = !$scope.showModal;
            };
            $scope.selectedJumper = {}
            $scope.toggleProfileModal = function(profile) {
                $rootScope.$broadcast('szeShowLoading');
                ProfileService.getProfile(profile.id).then(function(result) {
                    $rootScope.$broadcast('szeHideLoading');
                    console.log('profile updated: ', result);
                    $scope.selectedJumper = result.data;
                    $scope.modalType = 'Jumper Profile'
                    $scope.showModal = !$scope.showModal;

                }, function(err) {
                    $rootScope.$broadcast('szeHideLoading');
                    $rootScope.$broadcast('szeError', err);
                });
            }

            $scope.newJumper = function(jumper) {
                console.log('jumper: ', jumper)
                if ($scope.getAge(jumper.birthday) >= 18) {
                    UserService.createAccount(jumper).then(function(customer) {
                        $scope.addJumper(customer);
                    }, logErrorStopLoading)
                } else {
                    UserService.createMinorForGuest($scope.guest.id, jumper).then(function(guest) {
                        $scope.addJumper(getMinor(guest, jumper));
                    }, logErrorStopLoading)
                }
            };



            $scope.getAge = function(birthday) {
                var ageDifMs = Date.now() - new Date(birthday).getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            };



            $scope.doGuestSearch = function(crit) {
                $scope.showModal = false;
                var gsModal = $modal.open({
                    animation: true,
                    templateUrl: 'static/components/guest-search/guest-search.html',
                    size: 'lg',
                    resolve: {
                        'Criteria': function() {
                            return {
                                email: crit
                            };
                        }
                    },
                    controller: 'GuestSearchCtrl'
                });

                gsModal.result.then($scope.addJumper, logErrorStopLoading);
            };

            function getMinor(guest, minorInfo) {
                var out = {};
                console.log(guest, minorInfo)
                if (guest.data) guest = guest.data;
                angular.forEach(guest.minors, function(minor) {
                    if (minor.firstName === minorInfo.firstName && minor.lastName === minorInfo.lastName) {
                        out = minor
                    }
                })
                return out;
            }

            $scope.addJumper = function(jumper) {
                $scope.showModal = false;

                console.log(jumper)

                var def = $q.defer();

                $rootScope.$broadcast('szeShowLoading')

                if (jumper.id) { //existing jumper

                    // Order.numberOfJumpers = Order.participants.length+1;
                    // Order.numberOfGuests = (Order.numberOfGuests)?Order.numberOfGuests+1:Order.numberOfJumpers;
                    
                    angular.forEach(AddOnStatus.getStatus(), function(addon) {
                        AddOnStatus.setStatus(addon.prod.id, jumper.id, true)
                    })
                    
                    def.resolve(OrderService.addOrderParticipant(Order.id, OrderService.createOrderParticipant(jumper))
                            .then($scope.refreshJumpers, logErrorStopLoading));

                    // def.resolve(OrderService.updateOrder(Order.id, Order).then(function(result){
                    //     OrderService.addOrderParticipant(Order.id, OrderService.createOrderParticipant(jumper))
                    //         .then($scope.refreshJumpers, logErrorStopLoading)
                    // }, logErrorStopLoading));

                } else if (jumper.data.id) { //new jumper


                    // Order.numberOfJumpers = Order.participants.length+1;
                    // Order.numberOfGuests = (Order.numberOfGuests)?Order.numberOfGuests+1:Order.numberOfJumpers;

                    angular.forEach(AddOnStatus.getStatus(), function(addon) {
                        AddOnStatus.setStatus(addon.prod.id, jumper.data.id, true)
                    })

                    // def.resolve(OrderService.updateOrder(Order.id, Order).then(function(result){
                    //     OrderService.addOrderParticipant(Order.id, OrderService.createOrderParticipant(jumper.data))
                    //         .then($scope.refreshJumpers, logErrorStopLoading)
                    // }, logErrorStopLoading));

                    def.resolve(OrderService.addOrderParticipant(Order.id, OrderService.createOrderParticipant(jumper.data))
                        .then($scope.refreshJumpers, logErrorStopLoading));

                } else { //no jumper
                    logErrorStopLoading('Unable to find guest');
                    def.reject('Unable to find guest.');
                }


                return def.promise;

            };


            $scope.refreshJumpers = function(order) {
                console.log(order)
                $scope.order = order;
                $scope.showModal = false;
                $rootScope.$broadcast('szeHideLoading')


            };

            $scope.numNeeded = function(jumpersObj) {
                var total = 0;
                angular.forEach(jumpersObj, function(needs) {
                    if (needs)
                        total++
                })
                return total;
            };

            $scope.addLineItem = function(productId, quantity) {

                var def = $q.defer();

                OrderService.addLineItemToOrder($scope.order.id,
                        OrderService.createAddOnLineItem(productId, quantity))
                    .then(function(order) {
                        // $scope.order = order;
                        def.resolve($scope.order);
                    }, function(err) {
                        logErrorStopLoading(err);
                        def.reject(err);
                    })

                return def.promise;
            };
            $scope.updateLineItem = function(productId, quantity) {
                var def = $q.defer();

                $scope.removeLineItem(productId).then(function() {
                    $scope.addLineItem(productId, quantity).then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    })
                }, function(err) {
                    logErrorStopLoading(err);
                    def.reject(err);
                })

                return def.promise;

            };
            $scope.removeLineItem = function(productId) {

                var def = $q.defer();

                var oi = OrderService.getLineItemByProductId($scope.order, productId);
                OrderService.deleteOrderLineItem($scope.order.id, oi.id)
                    .then(function(order) {
                        // $scope.order = order;
                        def.resolve($scope.order);
                    }, function(err) {
                        console.log(err)
                        logErrorStopLoading(err);
                        def.reject(err);
                    })

                return def.promise;
            };

            $scope.addons = [];
            $rootScope.ignoreUpdates = false;
            $scope.aggregateAndAddLineItems = function() {
                // $rootScope.$broadcast('szeShowLoading')

                var df = $q.defer();

                $scope.addons = [];
                $rootScope.ignoreUpdates = true;

                angular.forEach($scope.getAddOns(), function(addon, key) {
                    addon.qty = $scope.numNeeded(addon.jumpers);
                    $scope.addons.push(addon);
                });

                $scope.handleAddOn($scope.addons.pop()).then($scope.handleAddOn, function(err) {
                    console.log('rejected from handleAddOn')
                    df.reject(true)
                })

                return df.promise;
            };

            $scope.handleAddOn = function(addon) {

                var def = $q.defer();
                console.log('addon', typeof addon);
                if (typeof addon === 'undefined') {
                    def.reject(true)
                    return def.promise;
                }

                //check if product exists on order
                if (OrderService.productExistsOnOrder($scope.order, addon.prod)) {
                    //if 0 remove
                    if (addon.qty === 0) {
                        console.log('qty is 0')
                        $scope.removeLineItem(addon.prod.id).then(function(order) {
                            console.log('qty is 0 remove success')
                            if ($scope.addons.length > 0) {
                                def.resolve($scope.addons.pop());
                            } else {
                                console.log('out of add ons')
                                AddOnStatus.purchasedAll();
                                NavService.goToRoute('offers', {
                                        'parkUrlSegment': Park.parkUrlSegment,
                                        'orderId': $scope.order.id,
                                        'guestId': $scope.guest.id
                                    })
                                    // def.reject(true);
                            }
                        }, function(err) {
                            console.log('qty is 0 remove fail')
                                // logErrorStopLoading(err);
                            def.reject(err);
                        });
                    } else {
                        console.log('existing product ')
                        $scope.updateLineItem(addon.prod.id, addon.qty).then(function(order) {
                            console.log('existing product success')
                            if ($scope.addons.length > 0) {
                                def.resolve($scope.addons.pop());
                            } else {
                                console.log('out of add ons')
                                AddOnStatus.purchasedAll();
                                NavService.goToRoute('offers', {
                                        'parkUrlSegment': Park.parkUrlSegment,
                                        'orderId': $scope.order.id,
                                        'guestId': $scope.guest.id
                                    })
                                    // def.reject(true);
                            }
                        }, function(err) {
                            console.log('existing product reject')
                                // logErrorStopLoading(err);
                            def.reject(err);
                        });
                    }
                }
                //if so remove
                else {
                    //if not add product w quantity
                    console.log('add item')
                    $scope.addLineItem(addon.prod.id, addon.qty).then(function(order) {
                        console.log('add item success')
                        if ($scope.addons.length > 0) {
                            def.resolve($scope.addons.pop());
                        } else {
                            console.log('out of add ons')
                            AddOnStatus.purchasedAll();
                            NavService.goToRoute('offers', {
                                    'parkUrlSegment': Park.parkUrlSegment,
                                    'orderId': $scope.order.id,
                                    'guestId': $scope.guest.id
                                })
                                // def.reject(true);
                        }
                    }, function(err) {
                        console.log('add item fail')
                            // logErrorStopLoading(err);
                        def.reject(err);
                    });
                }

                return def.promise;
            };


            $scope.goToOffersScreen = function() {
                $rootScope.$broadcast('szeShowLoading')
                if($scope.order.status === 'In Progress' || $scope.order.status === 'Reserved'){
                    $scope.aggregateAndAddLineItems().then(function(success) {

                        AddOnStatus.purchasedAll();
                        NavService.goToRoute('offers', {
                            'parkUrlSegment': Park.parkUrlSegment,
                            'orderId': $scope.order.id,
                            'guestId': $scope.guest.id
                        });
                    }, function(success) {
                        AddOnStatus.purchasedAll();
                        NavService.goToRoute('offers', {
                            'parkUrlSegment': Park.parkUrlSegment,
                            'orderId': $scope.order.id,
                            'guestId': $scope.guest.id
                        });
                    })
                }
                else{
                        AddOnStatus.purchasedAll();
                        NavService.goToRoute('offers', {
                            'parkUrlSegment': Park.parkUrlSegment,
                            'orderId': $scope.order.id,
                            'guestId': $scope.guest.id
                        });
                }
            };
            $scope.goToGuestScreen = function() {
                if($scope.order.status === 'In Progress' || $scope.order.status === 'Reserved'){
                $rootScope.$broadcast('szeConfirm', {
                    title: 'Cancel Order?',
                    message: 'Going back will release the current reservation and cancel the order. Continue?',
                    confirm: {
                        label: 'Continue',
                        action: function($clickEvent) {
                            //OrderService.cancelOrder();
                            OrderService.clearLocal();
                            NavService.goToRoute('activity', {
                                'parkUrlSegment': Park.parkUrlSegment
                            });
                        }
                    },
                    cancel: {
                        label: 'Stay Here',
                        action: function($clickEvent) {
                            return;

                        }
                    }
                })
            }
            else{
                            NavService.goToRoute('start', {
                                'parkUrlSegment': Park.parkUrlSegment
                            });
            }

            };

            $rootScope.$on('szeOrderUpdated', function(evt, order) {
                    $scope.refreshJumpers(order)
            });

            $rootScope.$on('participantsUpdated', function(evt, result) {
                $scope.order.participants = result.data;
            });

            init();
        }
    ]);