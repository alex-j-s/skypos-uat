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
    .directive('skyzoneOrderRow', ['$rootScope','OrderService','EpsonService', function($rootScope, OrderService, EpsonService) {

        return {
            restrict: 'EA',
            scope: true,
            templateUrl:'static/components/common/directives/orderrow/orderrow.html',
            link: function($scope, $element) {

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
                                    EpsonService.printReturnReciept(retOrder,$scope.park,$scope.guest,"Sky Zone Copy","RETURN",false,true);
                                    EpsonService.printReturnReciept(retOrder,$scope.park,$scope.guest,"Customer Copy","RETURN",false,false);
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

                $scope.isPurchased = function(){
                    return $scope.$parent.$parent.orderPurchased();
                }

                $scope.buttonLabel = function(){
                    return (!$scope.isPurchased())? 'Remove':'Return';
                };

                $scope.returnItem = function() {
                    // TODO:
                    console.log('TODO: return item')
                }

                $scope.updateOrderQuantity = function()
                {
                    console.log('scope', $scope);
                    var lineItem = $scope.order.orderItems[$scope.$index];
                    console.log('update order quantity: ', lineItem.quantity);
                    $rootScope.$broadcast('szeShowLoading');
                    OrderService.updateOrderLineItem($scope.order.id, lineItem.id,OrderService.createLineItem(lineItem.product.id,lineItem.quantity,null)).then(function(result) {
                        console.log('order updated.');
                        $rootScope.$broadcast('szeHideLoading');
                    }, function(err) {
                        $rootScope.$broadcast('szeHideLoading');
                        $rootScope.$broadcast('szeError', 'Failed to Update Order Item: ', err);
                    });
                }
            }
        };
    }]);