'use strict';

angular.module('skyZoneApp')
    .directive('skyposOrderSummary', ['$rootScope', 'OrderService', function($rootScope, OrderService) {
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {
                'order': '='
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

                $scope.refundOrder = function() {

                    console.log('refund order')

                    $rootScope.$broadcast('szeShowLoading');

                    for (var i in $scope.order.payments) {
                        var payment = $scope.order.payments[i];
                        console.log('refunding payment: ', payment);

                        var paymentType = "";


                        OrderService.refundPayment($scope.order.id, payment, 'credit-card')
                            .then(OrderService.updateOrderStatus, logErrorStopLoading)
                            .then(function(order) {
                                console.log('order updated order refund')
                                $rootScope.$broadcast('szeHideLoading');
                            }, logErrorStopLoading)
                    }

                }

                $scope.cancelOrder = function() {
                    //TODO: need specs on what to call -- update status does not work
                    console.log('todo, cancel order');

                    //$scope.order.status = 'Cancelled';
                    //$rootScope.$broadcast('szeShowLoading');
                    // OrderService.updateOrder($scope.order.id, $scope.order).then(function(result) {
                    // 	$rootScope.$broadcast('szeHideLoading');
                    // 	console.log('cancelled?: ', result);
                    // },function(err) {
                    // 	$rootScope.$broadcast('szeHideLoading');
                    // 	$rootScope.$broadcast('szeError', 'Failed to cancel order: ', err);
                    // });

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
                            if (authPayment.id === voidPayment.transactionId) {
                                voided = voidIndex;
                                authPayment.isCancellable = false;
                            }
                        });
                        if (voided !== false) {
                            auths.splice(voided, 1);
                        }
                           
                        voided = false; 
                        angular.forEach(sales, function(salePayment, saleIndex) {
                            if (salePayment.id === voidPayment.transactionId) {
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
            }
        };
    }]);
