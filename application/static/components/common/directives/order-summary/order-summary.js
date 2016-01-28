'use strict';

angular.module('skyZoneApp')
    .directive('skyposOrderSummary', ['$rootScope', '$location', '$routeParams', 'OrderService', 'UserService', '$filter','EpsonService', function($rootScope, $location, $routeParams, OrderService, UserService, $filter,EpsonService) {
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {
                'order': '=',
                'park': '='
            }, // {} = isolate, true = child, false/undefined = no change
            controller: function($scope, $element, $attrs, $transclude) {},
            // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            // template: '',
            templateUrl: 'static/components/common/directives/order-summary/order-summary.html',
            // replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function($scope, iElm, iAttrs, controller) {

                function logErrorStopLoading(err) {
                    $rootScope.$broadcast('szeHideLoading');
                    $rootScope.$broadcast('szeError', 'Failed to process order: ' + JSON.stringify(err));
                    $scope.showModal = false;
                }

                function logSuccessStopLoading(msg) {
                    $rootScope.$broadcast('szeHideLoading');
                    $rootScope.$broadcast('szeSuccess', msg);
                    $scope.showModal = false;
                }

                $rootScope.$on('szeOrderUpdated', function(event, order) {
                    $scope.populateExistingPayments(order.payments);
                });

                // order status
                $scope.orderInProgress = function(e) {
                    return $scope.order.status == 'In Progress' || $scope.order.status == 'Reserved';
                };

                $scope.orderCancelled = function(e) {
                    return $scope.order.status == 'Cancelled';
                }

                $scope.refundOrder = function(order) {

                    $scope.refundInProgress = undefined;

                    console.log('refund order')
                        // return logErrorStopLoading('Coming soon!');

                    if ( $scope.refundInProgress ) { 
                        console.log('REFUND ALREADY IN PROGRESS');
                        return; 
                    }
                    $scope.refundInProgress = true;


                    function getPaymentEndpoint(recTypeName) {
                        if (recTypeName === 'Cash') {
                            return 'cash'
                        } else if (recTypeName === 'Gift Card') {
                            return 'gift-card'
                        } else if (recTypeName === 'Credit Card') {
                            return 'credit-card'
                        } else if (recTypeName === 'Check') {
                            return 'check'
                        }

                    }





                    $rootScope.$broadcast('szeShowLoading');
                    $scope.populateExistingPayments(order.payments);
                    for (var i in $scope.existingPayments) {
                        var payment = $scope.existingPayments[i];
                        console.log('refunding payment: ', payment);

                        var paymentType = getPaymentEndpoint(payment.recordType.name);


                        OrderService.refundPayment($scope.order.id, payment, paymentType)
                            .then(OrderService.updateOrderStatus, logErrorStopLoading)
                            .then(function(order) {
                                if (order.paymentStatus != 'Unpaid' && $scope.refundInProgress == undefined) {
                                    console.log('ORDER UNPAID -- REFUNDING');
                                    $scope.refundOrder(order);
                                } else {
                                    OrderService.processOrder(order, 'Refunded')
                                        .then(function(order) {
                                            console.log('order updated order refund')
                                            logSuccessStopLoading('Order successfully refunded. Complete transaction to issue payment.');
                                            $scope.order = order;
                                            var msg = (order.totalAmountDue) ? 'Change Due: ' + $filter('currency')($scope.getOrderCashPaymentTotalForRefund(order)) : 'No Change Due.';

                                            $rootScope.$broadcast('szeConfirm', {
                                                title: msg,
                                                message: '',
                                                confirm: {
                                                    label: 'Return to Start',
                                                    action: function($clickEvent) {
                                                        //go to start
                                                        $location.path('/skypos/start/' + $scope.park.parkUrlSegment);
                                                    }
                                                },
                                                // cancel: {
                                                //     label: 'Activate Gift Card',
                                                //     action: function($clickEvent) {
                                                //         var gcModal = $modal.open({
                                                //             animation: true,
                                                //             size:'md',
                                                //             templateUrl: 'static/components/skypos-payment/gift-card-issuance.html',
                                                //             link: function(scope, elem, attr){
                                                //                 elem.find('#cardNumber').focus();
                                                //             },
                                                //             controller: function($scope, $modalInstance){
                                                //                 $scope.giftCard = {};
                                                //                 $scope.activateGiftCard = function(gc){
                                                //                     $rootScope.$broadcast('szeShowLoading');
                                                //                     GiftCardsService.issueCard(GiftCardsService.createIssueGiftCard(gc.cardNumber, gc.amount, $scope.order.id))
                                                //                         .success(function(result){
                                                //                             alert(result.resultText)
                                                //                             if(!result.isFailure){
                                                //                                 $modalInstance.close(result);
                                                //                             }
                                                //                             console.log('giftcard issued: ',result);
                                                //                             $rootScope.$broadcast('szeHideLoading');
                                                //                         })
                                                //                         .error(logErrorStopLoading)
                                                //                 };
                                                //             }
                                                //         })

                                                //         gcModal.result.then( function (giftCardResult) {
                                                //             $rootScope.$broadcast('szeShowLoading');
                                                //             $scope.goToStartScreen(order);
                                                //         }, function(reason){

                                                //         })
                                                //     }
                                                // }
                                            })
                                            console.log($scope.order);
                                        }, logErrorStopLoading)
                                        .then(function(order) {
                                            EpsonService.printReturnReciept($scope.order,$scope.park,$scope.$parent.$parent.guest,'Sky Zone Copy','Refund',true);
                                            EpsonService.printReturnReciept($scope.order,$scope.park,$scope.$parent.$parent.guest,'Customer Copy','Refund',false);
                                        }, logErrorStopLoading)
                                        .then(function(order) {
                                            $scope.refundInProgress = false;
                                        }, function(err) {
                                            logErrorStopLoading(err);
                                            $scope.refundInProgress = false;
                                        });
                                }
                                //todo pop drawer, print receipt w refund
                            }, logErrorStopLoading)
                    }

                }



                //////////////Manager auth/////
                $scope.managerApprovel = function() {
                    $scope.modelType = 'manager-auth';


                    $scope.showModal = true;

                };
                $scope.auth = {
                    'managerId': '',
                    'managerPin': ''
                };

                $scope.selectedAuthField = 'managerId';
                $scope.checkFieldFocused = function(field) {
                    $scope.selectedAuthField = field
                };

                $scope.authManager = function() {
                    $scope.auth = {
                        'managerId': '',
                        'managerPin': ''
                    };
                    $scope.selectedAuthField = 'managerId';


                };


                $scope.verifyManagerPin = function() {
                    $rootScope.$broadcast('szeShowLoading');

                    var credentials = {
                        'username': $scope.auth.managerId,
                        'password': $scope.auth.managerPin
                    };


                    UserService.managerAuth($scope.auth.managerId, $scope.auth.managerPin)
                        .success(function(data) {
                            $rootScope.$broadcast('szeHideLoading');


                            if (data.role === 'pos_mgr') {
                                //TODO:open the till

                                $scope.refundOrder($scope.order);


                            } else {
                                $rootScope.$broadcast('szeError', 'Authentication fail,You are not authorized to approve no-sale.');
                            }

                        })
                        .error(function(error) {
                            $rootScope.$broadcast('szeHideLoading');
                            $rootScope.$broadcast('szeError', error.message);
                        });


                };

                ////////////////////////////////////

                $scope.cancelOrder = function() {

                    $rootScope.$broadcast('szeConfirm', {
                        title: 'Cancel Transaction?',
                        message: 'Cancelling this transaction will release any pending reservations and navigate back to the Start screen. Continue?',
                        confirm: {
                            label: 'Continue',
                            action: function($clickEvent) {

                                $rootScope.$broadcast('szeShowLoading');
                                if ($scope.order.orderItems && $scope.order.orderItems.length > 0) {
                                    var foundRes = false;
                                    angular.forEach($scope.order.orderItems, function(item) {
                                        if (item.reservation) {
                                            foundRes = true;
                                            OrderService.deleteOrderLineItem($scope.order.id, item.id).then(function(result) {
                                                OrderService.deleteLocalOrder();
                                                $rootScope.$broadcast('szeHideLoading');
                                                $location.path('/skypos/start/' + $routeParams.parkUrlSegment);
                                                return;
                                            }, logErrorStopLoading);
                                        }
                                    });
                                    if (!foundRes) {
                                        OrderService.deleteLocalOrder();
                                        $rootScope.$broadcast('szeHideLoading');
                                        $location.path('/skypos/start/' + $routeParams.parkUrlSegment);
                                    }
                                } else {
                                    OrderService.deleteLocalOrder();
                                    $rootScope.$broadcast('szeHideLoading');
                                    $location.path('/skypos/start/' + $routeParams.parkUrlSegment);

                                }
                            }
                        },
                        cancel: {
                            label: 'Close',
                            action: function($clickEvent) {
                                return;

                            }
                        }
                    })

                }

                $scope.orderPurchased = function(e) {
                    return $scope.order.status == 'Purchased';
                }

                $scope.removePayment = function(orderId, paymentId) {
                    console.log('removing payment: ', orderId, paymentId);
                    $rootScope.$broadcast('szeShowLoading');
                    OrderService.deleteOrderPayment(orderId, paymentId).then(OrderService.updateOrderStatus, logErrorStopLoading)
                        .then(function(order) {

                        }, logErrorStopLoading)
                }


                $scope.populateExistingPayments = function(payments) {
                    $scope.existingPayments = [];

                    var voids = [];
                    var auths = [];
                    var caps = [];
                    var sales = [];
                    var voided = false;

                    angular.forEach(payments, function(payment, index) {
                        if (payment.transactionType === 'Authorize') {
                            payment.isCancellable = true;
                            auths.push(payment);
                        }
                        if (payment.transactionType === 'Capture') {
                            caps.push(payment);
                        }
                        if (payment.transactionType === 'Void') {
                            voids.push(payment);
                        }
                        if (payment.transactionType === 'Sale') {
                            sales.push(payment);
                        }
                    });

                    angular.forEach(voids, function(voidPayment, indexA) {

                        voided = false;
                        angular.forEach(auths, function(authPayment, voidIndex) {
                            if (authPayment.id === voidPayment.transactionId || authPayment.transactionId === voidPayment.transactionId) {
                                voided = voidIndex;
                                authPayment.isCancellable = false;
                            }
                        });
                        if (voided !== false) {
                            auths.splice(voided, 1);
                        }

                        voided = false;
                        angular.forEach(sales, function(salePayment, saleIndex) {
                            if (salePayment.id === voidPayment.transactionId || salePayment.transactionId === voidPayment.transactionId) {
                                voided = saleIndex
                                salePayment.isCancellable = false;
                            }
                        });
                        if (voided !== false) {
                            sales.splice(voided, 1);
                        }

                    });

                    // angular.forEach(caps, function(capPayment, indexC){
                    //     angular.forEach(auths, function(authPayment, index){
                    //         if(authPayment.id === capPayment.transactionId){
                    //             authPayment.isCancellable = false;

                    //         }
                    //     });

                    // });

                    if (caps.length > 0) {
                        $scope.existingPayments = caps.concat(sales);
                    } else {
                        $scope.existingPayments = auths.concat(sales);
                    }
                }

                $scope.populateExistingPayments($scope.order.payments);


                $scope.getOrderCashPaymentTotalForRefund = function(order) {
                    var total = 0;
                    angular.forEach(order.payments, function(payment) {
                        if ( payment.paymentType == 'Refund' && payment.recordType.name == 'Cash' ) {
                            total += payment.amount;
                        }
                    })
                    return total;
                }
            }
        };
    }]);
