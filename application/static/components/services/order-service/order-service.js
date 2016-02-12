'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:OrderService
 * @description
 * # OrderService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
    .service('OrderService', ['UserService', '$rootScope', '$filter', '$location', '$http', '$q', 'StorageService', 'PromiseFactory', 'ParkService', 'ProductService', 'ProfileService',
        function(UserService, $rootScope, $filter, $location, $http, $q, StorageService, PromiseFactory, ParkService, ProductService, ProfileService) {
            var self = this;

            var currentOrder;
            var eventPackage;
            var jumpers = {};
            var nonJumpers = {};
            var jumperCount = 0;
            var nonJumperCount = 0;
            var isUpdatingOrder = false;

            var nextSignature = {};

            function Order(input) {
                console.log(input);

                function isEvent(ord) {
                    return (ord.eventName != null || ord.eventType != null || ord.eventZoneStartTime != null || ord.eventZoneEndTime != null);
                }

                function getStartDate(ord) {
                    return (ord.start) ? $filter('date')(input.start.toISOString(), 'yyyy-MM-dd') : ord.startDate;
                }

                function getEZStartTime(ord) {
                    return (ord.start) ? $filter('date')(input.start.toISOString(), 'hh:mm a') : ord.eventZoneStartTime;
                }

                function getEZEndTime(ord) {
                    return (ord.end) ? $filter('date')(input.end.toISOString(), 'hh:mm a') : ord.eventZoneEndTime;
                }

                function getJmpStartTime(ord) {
                    return (ord.start) ? $filter('date')(input.start.toISOString(), 'hh:mm a') : ord.jumpStartTime;
                }

                function getJmpEndTime(ord) {
                    return (ord.end) ? $filter('date')(input.end.toISOString(), 'hh:mm a') : ord.jumpEndTime;
                }

                var out = {
                    "parkId": input.parkId,
                    "orderId": input.orderId,
                    "accountId": input.accountId,
                    "orderType": "Other",
                    "eventStartDate": getStartDate(input),
                    // "jumpStartTime": getJmpStartTime(input),
                    // "jumpEndTime": getJmpEndTime(input),
                    "jumpDurationMinutes": input.duration,
                    "numberOfJumpers": input.numberOfJumpers,
                    "numberOfGuests": input.numberOfGuests,
                    "notes": input.notes
                };

                if (isEvent(input)) {
                    out.eventZoneStartTime = getEZStartTime(input);
                    out.eventZoneEndTime = getEZEndTime(input);
                    out.birthdayMessage = input.birthdayMessage;
                }

                return out;
            }

            var updateOrderHandler = function(method, url, data) {

                var def = PromiseFactory.getInstance();

                if (isUpdatingOrder) {
                    def.reject('Order Update Rejected: Order Update In Progress')
                } else {
                    isUpdatingOrder = true;
                }

                var config = {
                    'url': url,
                    'method': method,
                    'data': angular.copy(data)
                };

                if (data && data.orderId && nextSignature['_' + data.orderId + '_']) {
                    config.headers = {
                        'X-Order-Signature': nextSignature['_' + data.orderId + '_']
                    };
                    if (config.data && config.data.orderId) {
                        delete config.data.orderId
                    }
                } else if (data && nextSignature['_' + data.id + '_']) {
                    config.headers = {
                        'X-Order-Signature': nextSignature['_' + data.id + '_']
                    };
                    if (config.data && config.data.id) {
                        delete config.data.id
                    }
                }

                if (method === 'DELETE') {
                    delete config.data;
                }



                $http(config)
                    .success(function(rslt) {
                        isUpdatingOrder = false;
                        if (rslt.signature) {
                            nextSignature['_' + rslt.id + '_'] = rslt.signature;
                            delete rslt.signature;
                        }

                        console.log('Successful Order Update. Response: ', rslt.id);

                        if (angular.isUndefined($rootScope.order) || (rslt.id && rslt.id == $rootScope.order.id)) {
                            $rootScope.order = rslt;
                            $rootScope.$broadcast('szeOrderUpdated', $rootScope.order);
                            def.resolve($rootScope.order)
                        } else if($rootScope.isReturn){
                            $rootScope.isReturn = false;
                            def.resolve(rslt);
                        } else {
                            def.resolve(self.getOrder($rootScope.order.id));
                        }

                    })
                    .error(function(err) {
                        isUpdatingOrder = false;
                        def.reject(err);
                    });

                return def.promise
            };

            var updateLocalOrder = function(order) {
                // storeCurrentOrderId(order);
                currentOrder = order;

                var reservationItemOnOrder;

                if (order && order.orderItems) {
                    order.orderItems.some(function(item) {
                        if (item.reservation && item.reservation.id) {
                            reservationItemOnOrder = item;
                            return true;
                        }
                    });
                    $rootScope.order = angular.copy(order);
                }

                $rootScope.$broadcast('orderReservationCheck', reservationItemOnOrder);
            };

            self.createOrder = function(orderInfo) {
                var deferred = PromiseFactory.getInstance();

                updateOrderHandler('POST', '/api/orders', new Order(orderInfo))
                    .success(function(order) {
                        $rootScope.order = order;
                        deferred.resolve(order);
                    })
                    .error(function(error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            self.createReturn = function(orderId, parkId) {
                var deferred = PromiseFactory.getInstance();
                $rootScope.isReturn = true;
                updateOrderHandler('POST', '/api/orders/'+orderId+'/return', {'orderId':orderId, 'parkId':parkId})
                    .success(function(order) {
                        // $rootScope.order = order;
                        deferred.resolve(order);
                    })
                    .error(function(error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            self.updateOrder = function(oid, order) {
                console.log(order)
                var deferred = PromiseFactory.getInstance();
                order.orderId = oid;
                updateOrderHandler('PUT', '/api/orders/' + oid, new Order(order))
                    .success(function(order) {
                        deferred.resolve(order);
                    })
                    .error(function(error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            var getCurrentOrderId = function() {
                if (!$rootScope.order) {
                    return undefined;
                }
                return $rootScope.order.id;
            };

            var storeCurrentOrderId = function(order) {
                var orderId = (order) ? order.id : undefined;
                // StorageService.handleSet('order', order);
            };

            self.getLocalOrder = function() {
                return currentOrder;
            };

            self.deleteLocalOrder = function() {
                $rootScope.order = undefined;
                updateLocalOrder(null);
            };

            self.orderSearch = function(kvps) {

                var qs = '?';

                angular.forEach(kvps, function(value, key) {
                    if (value != null) {
                        qs += key + '=' + value + '&';
                    }

                })
                console.log('Order Search Query String: ' + qs)
                return $http.get('/api/orders' + qs.substr(0, qs.length - 1));
            }

            self.orderSearchNew = function(park) {
                return $http.get('/api/orders/api/orders?parkId=' + park + '&customerId=204');
            };

            self.getOrders = function(customerId, includeOrders, includeEvents, orderStatus) {
                var url = '/api/orders?customerId=' + customerId;

                if (!(includeOrders && includeEvents)) {
                    var type = (includeOrders) ? 'order' : 'Event';
                    url += '&type=' + type;
                }

                if (orderStatus && orderStatus.length > 0) {
                    url += '&status=' + orderStatus;
                }
                console.log(url);
                return $http.get(url);
            };

            self.getOrder = function(orderId, skipCurrentOrder) {

                var def = PromiseFactory.getInstance();

                console.log('Requesting Order Id: ' + orderId);

                $http.get('/api/orders/' + orderId).then(function(order) {
                    nextSignature['_' + orderId + '_'] = order.data.signature;
                    console.log(nextSignature, order);
                    delete order.data.signature;
                    if (!skipCurrentOrder) {
                        //cache id for signature recovery
                        $rootScope.order = angular.copy(order.data);
                        self.getOrderParticipantsProfiles($rootScope.order).then(function(participants) {
                            console.log('participants: ', participants)
                            $rootScope.order.participants = participants;
                            currentOrder = $rootScope.order;
                            $rootScope.$broadcast('szeOrderUpdated', $rootScope.order);
                            def.resolve($rootScope.order);

                        }, function(err) {
                            console.log(err);
                            currentOrder = $rootScope.order;
                            $rootScope.$broadcast('szeOrderUpdated', $rootScope.order);
                            def.resolve($rootScope.order);
                        })
                    }
                }, function(err) {
                    def.reject(err);
                });

                return def.promise;
            };

            self.getOrderParticipantsProfiles = function(order) {

                if (order.participants.length === 0) {
                    return $q.when([]);
                }

                var def = $q.defer();
                var participantMap = {};
                var defMap = {};
                var promArray = [];


                angular.forEach(order.participants, function(participant) {
                    if (!defMap['_' + participant.participantId + '_']) {
                        defMap['_' + participant.participantId + '_'] = $q.defer();
                        promArray.push(defMap['_' + participant.participantId + '_'].promise)
                    }
                });


                angular.forEach(order.participants, function(participant) {
                    ProfileService.getProfile(participant.id).then(function(profile) {
                        if (profile.data) profile = profile.data;
                        profile.participantId = participant.participantId;
                        profile.reservationItemId = participant.reservationItemId;
                        profile.guestOfHonor = participant.guestOfHonor;
                        participantMap['_' + participant.participantId + '_'] = profile;
                        defMap['_' + participant.participantId + '_'].resolve(participantMap['_' + participant.participantId + '_']);
                    }, function(err) {
                        defMap['_' + participant.participantId + '_'].resolve({})
                    })
                })

                $q.all(promArray).then(function(participants) {
                    def.resolve(participants);
                }, function(err) {
                    def.reject('Something went wrong: Unable to locate guest profiles');
                })

                return def.promise;
            }

            self.clearLocal = function() {
                nextSignature = {};
                currentOrder = undefined;
                $rootScope.order = undefined;
            }

            self.getCurrentOrder = function() {
                var deferred = PromiseFactory.getInstance();
                var orderId = getCurrentOrderId();

                if (orderId) {
                    self.getOrder(orderId)
                        .success(function(order) {
                            updateLocalOrder(order);
                            deferred.resolve(order);
                        })
                        .error(function(error) {
                            self.deleteLocalOrder();
                            deferred.reject(error);
                        });
                } else {
                    self.deleteLocalOrder();
                    deferred.resolve(null);
                }

                return deferred.promise;
            };

            self.getOrderLineItems = function() {
                var deferred = PromiseFactory.getInstance();
                var orderId = getCurrentOrderId();

                if (orderId) {
                    $http.get('/api/orders/' + orderId + '/line-items')
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(error) {
                            deferred.reject(error);
                        });
                } else {
                    deferred.resolve(null);
                }

                return deferred.promise;
            };

            self.addLineItemToOrder = function(oid, lineItem) {
                var deferred = PromiseFactory.getInstance();
                var orderId = (oid) ? oid : getCurrentOrderId();
                if (!orderId) {
                    self.createOrder()
                        .success(function(newOrder) {
                            lineItem.orderId = newOrder.id;

                            updateOrderHandler('POST', '/api/orders/' + newOrder.id + '/line-items', lineItem)
                                .success(function(order) {
                                    console.log(order);
                                    deferred.resolve(order);
                                })
                                .error(function(error) {
                                    deferred.reject(error);
                                });

                        })
                        .error(function(error) {
                            deferred.reject(error);
                        });
                } else {
                    lineItem.orderId = orderId;
                    updateOrderHandler('POST', '/api/orders/' + orderId + '/line-items', lineItem)
                        .success(function(order) {
                            console.log(order);
                            deferred.resolve(order);
                        })
                        .error(function(error) {
                            deferred.reject(error);
                        });
                }

                return deferred.promise;
            };

            self.returnLineItem = function(orderId, lineItem){
                var deferred = PromiseFactory.getInstance();
                lineItem.orderId = orderId;
                $rootScope.isReturn = true;
                updateOrderHandler('POST', '/api/orders/' + orderId + '/return/line-items', lineItem)
                    .success(function(order) {
                        console.log(order);
                        deferred.resolve(order);
                    })
                    .error(function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };

            self.updateOrderLineItem = function(orderId, lineItemId, lineItem) {
                lineItem.orderId = orderId;
                return updateOrderHandler('PUT', '/api/orders/' + orderId + '/line-items/' + lineItemId, lineItem);
            };

            self.getOrderLineItem = function(lineItemId) {
                var orderId = getCurrentOrderId();
                return $http.get('/api/orders/' + orderId + '/line-items/' + lineItemId);
            };

            self.deleteOrderLineItem = function(orderId, lineItemId) {
                return updateOrderHandler('DELETE', '/api/orders/' + orderId + '/line-items/' + lineItemId, {
                    orderId: orderId
                });
            };

            self.addGiftCardPayment = function(orderId, payment) {
                payment.orderId = orderId;
                var def = $q.defer();

                updateOrderHandler('POST', '/api/orders/' + orderId + '/payments/gift-card', payment)
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    })

                return def.promise;
            };

            self.addCreditCardPayment = function(orderId, payment) {
                payment.orderId = orderId;
                var def = $q.defer();

                updateOrderHandler('POST', '/api/orders/' + orderId + '/payments/credit-card', payment)
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    })


                return def.promise;
            };

            self.addCashPayment = function(orderId, payment) {
                payment.orderId = orderId;
                var def = $q.defer();

                updateOrderHandler('POST', '/api/orders/' + orderId + '/payments/cash', payment)
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    })

                return def.promise;
            }

            self.addManagerDiscount = function(orderId, discount){
                discount.orderId = orderId;
                var def = $q.defer();

                updateOrderHandler('POST', '/api/orders/' + orderId + '/addmanagerdiscount', discount)
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    });

                return def.promise;
            };

            self.addCheckPayment = function(orderId, payment) {
                payment.orderId = orderId;
                var def = $q.defer();

                updateOrderHandler('POST', '/api/orders/' + orderId + '/payments/check', payment)
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    });

                return def.promise;
            }

            self.refundPayment = function(orderId, payment, paymentType) {
                var def = $q.defer();

                var payload = {
                    'amount':payment.amount,
                    'transactionId': payment.transactionId,
                    'paymentType': 'Refund',
                    'amountType': 'Standard Deposit',
                    'orderId': orderId
                }

                if ( paymentType == 'gift-card' ) {
                    payload.giftCardNumber = payment.giftCardNumber;
                }

                updateOrderHandler('POST', '/api/orders/' + orderId + '/payments/' + paymentType, payload)
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    });

                return def.promise;
            };

            //self.returnItem = function()

            self.deleteOrderPayment = function(orderId, paymentId) {

                var def = $q.defer();

                updateOrderHandler('DELETE', '/api/orders/' + orderId + '/payments/' + paymentId, {
                        orderId: orderId
                    })
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    })

                return def.promise;
            };

            self.addOrderPromoCode = function(orderId, promoCode) {
                var promoCodeObj = {
                    'discountCode': promoCode,
                    'orderId': orderId
                };

                return updateOrderHandler('POST', '/api/orders/' + orderId + '/promo-codes', promoCodeObj);
            };

            self.deleteOrderPromoCode = function(orderId, promoCode) {
                return updateOrderHandler('DELETE', '/api/orders/' + orderId + '/promo-codes/' + promoCode, {
                    orderId: orderId
                });
            };

            self.addGratuity = function(orderId, gratuity) {
                gratuity.orderId = orderId;

                var def = $q.defer();

                updateOrderHandler('POST', '/api/orders/' + orderId + '/gratuity/', gratuity)
                    .then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        def.reject(err);
                    })

                return def.promise;
            };

            // self.updateOrderStatus = function(order) {
            //     console.log('updateOrderStatus: ', order);
            //     if (order.totalPayments >= order.totalOrderAmount || order.totalAmountDue === 0) {
            //         return self.processOrder(order, true);
            //     } else {
            //         return self.processOrder(order, false);
            //     }

            // };

            // self.processOrder = function(order, isFullyPaid) {
            //     //includeGratuityUpdate = false;
            //     var orderStatus = {
            //         'status': (isFullyPaid) ? 'Fully Paid' : 'Deposit Paid',
            //         'orderId': order.id
            //     };

            //     if ( order.totalOrderAmount == order.TotalAmountDue ) {
            //         orderStatus.status = "Unpaid"; 
            //     }

            //     var def = $q.defer();
            //     updateOrderHandler('PATCH', '/api/orders/' + order.id, orderStatus)
            //         .then(function(order) {
            //             def.resolve(order);
            //         }, function(err) {
            //             def.reject(err);
            //         })

            //     return def.promise;
            // };
            
            self.updateReturnOrderStatus = function(retOrder){
                $rootScope.isReturn = true;
                return self.processOrder(retOrder, 'Refunded')  
            };

            self.updateOrderStatus = function(order) {
                console.log('updateOrderStatus: ', order);
                if (order.totalPayments === 0) {
                    return self.processOrder(order, 'Unpaid');
                } else if (order.totalPayments >= order.totalAmount || order.totalAmountDue === 0) {
                    return self.processOrder(order, 'Fully Paid');
                } else {
                    return self.processOrder(order, 'Deposit Paid');
                }

            };

            self.processOrder = function(order, paymentStatus) {
                //includeGratuityUpdate = false;
                var orderStatus = {
                    'status': paymentStatus,
                    'orderId': order.id
                };
                var def = $q.defer();
                updateOrderHandler('PATCH', '/api/orders/' + order.id, orderStatus)
                    .then(function(order) {
                        //includeGratuityUpdate = true;
                        def.resolve(order);
                    }, function(err) {
                        //includeGratuityUpdate = true;
                        def.reject(err);
                    })

                return def.promise;
            };

            self.isCartEmpty = function(order) {
                return (!order || (order && order.orderItems && order.orderItems.length === 0));
            };

            self.getOrderParticipants = function(oid) {
                return $http.get('/api/orders/' + orderId + '/participants');
            };

            self.deleteOrderParticipant = function(oid, participantId) {
                return updateOrderHandler('DELETE', '/api/orders/' + oid + '/participants/' + participantId, {
                    orderId: oid
                });
            };

            self.addOrderParticipant = function(oid, participant, isJumper) {
                participant.orderId = oid
                return updateOrderHandler('POST', '/api/orders/' + oid + '/participants', participant);
            };


            self.productExistsOnOrder = function(order, product) {
                var out = false;

                angular.forEach(order.orderItems, function(orderItem, index) {
                    if (orderItem.product && orderItem.product.id === product.id) {
                        out = true;
                    }
                });

                return out;
            };

            self.getLineItemByProductId = function(order, productId) {

                var out = {};

                angular.forEach(order.orderItems, function(orderItem, index) {
                    if (orderItem.product && orderItem.product.id === productId) {
                        out = orderItem;
                    }
                });

                return out;
            };

            self.swipeCreditORDebitCardPayment = function(swipeResponse){
            	  return {
            		  'transactionId': swipeResponse.transactionId,
                      'amount': swipeResponse.approvedAmount,
                      'approvalNumber': swipeResponse.approvalNumber,
                      'binValue': swipeResponse.binValue,
                      'statusCode': swipeResponse.statusCode,
                      'isApproved': swipeResponse.isApproved,
                     // 'transactionDateTime': swipeResponse.transactionDateTime!=null?swipeResponse.transactionDateTime.split(".")[0]:"",
                     // 'signature': swipeResponse.signature!=null?swipeResponse.signature.data:"",
                      'entryMode': 'swiped',
                      'cashBackAmount': swipeResponse.cashbackAmount,
                      'debitSurchargeAmount': swipeResponse.debitSurchargeAmount,
                      'pinVerified': swipeResponse.pinVerified,
                      'currencyCode': (currentOrder) ? currentOrder.currencyCode : 'USD',
                      'paymentType': 'Deposit',
                      'amountType': 'Standard Deposit'
                  };
            }

            self.createCreditCardPayment = function(paymentInfo, amount) {
                return {
                    'amount': amount,
                    'currencyCode': (currentOrder) ? currentOrder.currencyCode : 'USD',
                    'creditCardNumber': paymentInfo.ccn,
                    'creditCardExpMonth': paymentInfo.expM,
                    'creditCardExpYear': paymentInfo.expY,
                    'creditCardVerificationNumber': paymentInfo.cvv,
                    'ccOwnerAdrsPostalcode': paymentInfo.zip,
                    'trackData': paymentInfo.trackData,
                    'ksn': paymentInfo.ksn,
                    'pinBlock': paymentInfo.pinBlock,
                    'paymentType': 'Deposit',
                    'amountType': 'Standard Deposit'
                };
            };

            self.createGiftCardPayment = function(gcNumber, amount) {
                return {
                    'giftCardNumber': gcNumber,
                    'amount': amount,
                    'currencyCode': (currentOrder) ? currentOrder.currencyCode : 'USD',
                    'paymentType': 'Deposit',
                    'amountType': 'Standard Deposit'
                };
            };

            self.createCashPayment = function(amount) {
                return {
                    'amount': amount,
                    'currencyCode': (currentOrder) ? currentOrder.currencyCode : 'USD',
                    'paymentType': 'Deposit',
                    'amountType': 'Standard Deposit'
                }
            }

            self.createCheckPayment = function(amount, checkNumber, checkDate) {
                return {
                    'amount': amount,
                    'currencyCode': (currentOrder) ? currentOrder.currencyCode : 'USD',
                    'paymentType': 'Deposit',
                    'amountType': 'Standard Deposit',
                    'checkNumber': checkNumber,
                    'checkDate': checkDate
                };
            };

            self.createOrderSearch = function(crit) {
                return {
                    'parkId': crit.parkId,
                    'customerId': crit.customerId,
                    'orderNumber': crit.orderNumber,
                    'primaryGuestEmail': crit.primaryGuestEmail
                };
            };

            self.createLineItem = function(variantId, quantity, reservationId) {
                return {
                    'variantId': variantId,
                    'quantity': quantity,
                    'reservationId': reservationId
                };
            };

            self.createAddOnLineItem = function(variantId, quantity, reservationId) {
                return {
                    'variantId': variantId,
                    'quantity': quantity,
                    'isAddOnItem': true,
                    'reservationId': reservationId
                };
            };


            self.createOrderParticipant = function(guest) {
                return {
                    'reservationItemId':guest.reservationItemId,
                    'customerId': guest.id,
                    'guestOfHonor': angular.isUndefined(guest.guestOfHonor) ? false : guest.guestOfHonor
                };
            };

            self.createGratuity = function(gratuity) {
                return {
                    'employeeId': gratuity.employeeId,
                    'total': gratuity.total
                };
            };

            self.createManagerDiscount = function(disco){
                return {
                    'managerNumber':disco.managerNumber,
                    'managerPin':disco.managerPin,
                    'managerDiscountValue':disco.managerDiscountValue,
                    'managerDiscountReason':disco.managerDiscountReason,
                    'valueInPercent':disco.valueInPercent
                };
            };

            self.calculateStandardGratuity = function(order) {

                if (!order.orderAmount) {
                    return 0;
                }

                return order.orderAmount * 0.15;
            };

            self.calculateAndAddGratuity = function(orderResponse) {

                var def = $q.defer();

                console.log('calculating gratuity')

                var localOrder = orderResponse;

                var gratuityTotal = self.calculateStandardGratuity(localOrder);

                var gratuityInfo = {
                    'total': gratuityTotal
                };

                if (gratuityTotal === 0) {
                    def.resolve(localOrder);
                } else {
                    UserService.getCurrentUserId()
                        .then(function(userId) {

                            gratuityInfo.employeeId = userId;
                            self.addGratuity(localOrder.id, self.createGratuity(gratuityInfo))
                                .then(function(order) {
                                    def.resolve(order);
                                }, function(err) {
                                    def.reject(err)
                                });

                        }, function(err) {
                            def.reject(err);
                        });
                }

                return def.promise;
            };

            

            self.productExistsOnOrder = function(order, product){
                var out = false;

                angular.forEach(order.orderItems, function(orderItem, index){
                    if(orderItem.product && orderItem.product.id === product.id){
                        out = true;
                    }
                });

                return out;
            };

            self.getTotalJumpSlots = function() {};

            /* JUMPER / EVENT MANAGEMENT */

            self.incrementJumperCount = function() {
                jumperCount++;
            };

            self.decrementJumperCount = function() {
                jumperCount--;
            };

            self.incrementNonJumperCount = function() {
                nonJumperCount++;
            };

            self.decrementNonJumperCount = function() {
                nonJumperCount--;
            };

            self.setEventPackage = function(ep) {
                eventPackage = ep;
            };

            self.getEventPackage = function() {
                return eventPackage;
            };

            self.includedJumpSlotAvailable = function() {
                if (!eventPackage) {
                    return false;
                }

                return numberOfJumpers < eventPackage.requiredJumpCapacity;

            };

            self.addOnJumpSlotsOffered = function() {
                return ParkService.addOnJumpTimeOffered();
            };

            self.Order = Order;

            self.getCurrentOrder();
        }
    ]);
