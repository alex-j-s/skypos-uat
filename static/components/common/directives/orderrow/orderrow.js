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



                $scope.removeOrderItem = function() {
                    $rootScope.$broadcast('szeShowLoading');
                    OrderService.deleteOrderLineItem($scope.order.id,$scope.order.orderItems[$scope.$index].id).then(function(result) {
                        console.log('order updated.');
                    },function(err) {
                        $rootScope.$broadcast('szeHideLoading');
                        $rootScope.$broadcast('szeError', 'Failed to Remove Order Item: ', err);
                    });
                }

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