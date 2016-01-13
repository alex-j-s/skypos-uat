/**
 * Created by dharmendrarajpurohit on 13/10/15.
 */
'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:bigLoader
 * @description
 * # bigLoader3
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
    .directive('skyzoneOrderRow', ['$rootScope','OrderService', function($rootScope, OrderService) {

        return {
            restrict: 'EA',
            scope: true,
            templateUrl:'static/components/common/directives/orderrow/orderrow.html',
            link: function($scope, $element) {

                function logErrorStopLoading(err) {
                    $rootScope.$broadcast('szeHideLoading');
                    $rootScope.$broadcast('szeError', 'Failed to process order: ' + JSON.stringify(err));
                    $scope.showModal = false;
                }
                
                console.log('orderrow', $scope.$parent.$parent)

                $scope.removeOrderItem = function(item) {
                    if(!$scope.isPurchased()){
                        $rootScope.$broadcast('szeShowLoading');
                        OrderService.deleteOrderLineItem($scope.order.id,item.id).then(function(result) {
                            console.log('order updated.');
                        },function(err) {
                            $rootScope.$broadcast('szeHideLoading');
                            $rootScope.$broadcast('szeError', 'Failed to Remove Order Item: ', err);
                        });
                    }
                    else{
                        // $rootScope.$broadcast('szeHideLoading');
                        //     $rootScope.$broadcast('szeError', 'Coming soon!');
                        // return;
                        //do return call to create return order
                        OrderService.createReturn($scope.order.id, $scope.park.id).then(function(returnOrder){
                            console.log(returnOrder);
                            //attach orderItem to return order
                            OrderService.returnLineItem(returnOrder.id, OrderService.createLineItem(item.product.id, item.quantity))
                                .then(OrderService.updateReturnOrderStatus, function(err){
                                    $rootScope.$broadcast('szeHideLoading');
                                    $rootScope.$broadcast('szeError', 'Failed to Remove Order Item: ', err);
                                })
                                .then(function(retOrder){
                                    console.log('retOrder',retOrder)
                                    //print return receipt
                                    EpsonService.printReciept(retOrder,$scope.park,$scope.guest,"Sky Zone Copy","RETURN",false,true);
                                    EpsonService.printReciept(retOrder,$scope.park,$scope.guest,"Customer Copy","RETURN",false,false);
                                    $scope.createRefundForAmount(retOrder.orderAmount);
                                }, function(err){
                                    $rootScope.$broadcast('szeHideLoading');
                                    $rootScope.$broadcast('szeError', 'Failed to Remove Order Item: ', err);
                                })
                        }, function(err){
                            $rootScope.$broadcast('szeHideLoading');
                            $rootScope.$broadcast('szeError', 'Failed to Remove Order Item: ', err);
                        });
                    }
                }
                
                $scope.getPaymentForRefund = function(amt){
                    var out = {};
                    var biggest = null;
                    var foundIt = false;
                    angular.forEach($scope.existingPayments, function(pmt, ind){
                        if(foundIt){
                            return;
                        }
                        if(pmt.recordType.name === 'Credit Card'){
                            if(pmt.amount >= amt){
                                foundIt = true;
                                out = pmt;
                            }
                            else if(!biggest || biggest.amount < pmt.amount){
                                biggest = pmt;
                            }
                        }
                        
                    })  
                    if(foundIt){
                        return out;
                    }else{
                        angular.forEach($scope.existingPayments, function(pmt, ind){
                            if(foundIt){
                                return;
                            }
                            if(pmt.recordType.name === 'Cash'){
                                if(pmt.amount >= amt){
                                    foundIt = true;
                                    out = pmt;
                                }
                                else if(!biggest || biggest.amount < pmt.amount){
                                    biggest = pmt;
                                }
                            }
                        }) 
                        if(foundIt){
                            return out;
                        } 
                        else{
                            return biggest;
                        }
                    }
                };
                
                $scope.createRefundForAmount = function(amt){
                    
                    function getPaymentEndpoint(recTypeName){
                        if(recTypeName === 'Cash'){
                            return 'cash'
                        }
                        else if(recTypeName === 'Gift Card'){
                            return 'gift-card'
                        }
                        else if(recTypeName === 'Credit Card'){
                            return 'credit-card'
                        }
                        else if(recTypeName === 'Check'){
                            return 'check'
                        }
                        
                    }
                    
                    var payment = $scope.getPaymentForRefund(amt);
                    var paymentType = getPaymentEndpoint(payment.recordType.name);
                    console.log('refunding payment: ', payment)
                    OrderService.refundPayment($scope.order.id, payment, paymentType)
                            //.then(OrderService.updateOrderStatus, logErrorStopLoading)
                            .then(function(order) {
                                if(amt - payment.amount > 0){
                                    $scope.createRefundForAmount(amt-payment.amount);
                                }else{
                                    logErrorStopLoading('Refund created for returned item. Complete transaction to finalize and issue refund');
                                }
                                // $rootScope.$broadcast('szeHideLoading');
                                //todo pop drawer, print receipt w refund
                            }, logErrorStopLoading)
                };

                $scope.isPurchased = function(){
                    return $scope.$parent.$parent.orderPurchased();
                }

                $scope.buttonLabel = function(){
                    return (!$scope.isPurchased())? 'Remove':'Return';
                };

                $scope.updateOrderQuantity = function()
                {
                    console.log('scope', $scope);
                    var lineItem = $scope.order.orderItems[$scope.$index];
                    console.log('update order quantity: ', lineItem.quantity);
                    $rootScope.$broadcast('szeShowLoading');
                    if(!$scope.isPurchased()){
                        OrderService.updateOrderLineItem($scope.order.id, lineItem.id,OrderService.createLineItem(lineItem.product.id,lineItem.quantity,null)).then(function(result) {
                            console.log('order updated.');
                            $rootScope.$broadcast('szeHideLoading');
                        }, function(err) {
                            $rootScope.$broadcast('szeHideLoading');
                            $rootScope.$broadcast('szeError', 'Failed to Update Order Item: ', err);
                        });
                    }
                }
            }
        };
    }]);