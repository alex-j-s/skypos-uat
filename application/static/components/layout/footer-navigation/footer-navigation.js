'use strict';

angular.module('skyZoneApp')
    .directive('szeFooterNavigation', ['$location', '$rootScope', '$modal', '$routeParams', 'OrderService', 'NavService', 'WaiverStatus',
        function($location, $rootScope, $modal, $routeParams, OrderService, NavService, WaiverStatus) {
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {
                order: '=',
                next: '=',
                prev: '=',
                current: '=',
                nextLabel: '@',
                prevLabel: '@'
            }, // {} = isolate, true = child, false/undefined = no change
            controller: function($scope, $element, $attrs, $transclude) {

                    var numUnsigned = 0;
                    var numPending = 0;
                function logErrorHideLoading(err) {
                    $rootScope.$broadcast('szeHideLoading');
                    $rootScope.$broadcast('szeError', err);
                }
                $scope.getOrderAmount = function(order) {
                    if (!order || !order.orderAmount) {
                        return 0;
                    }
                    return order.orderAmount;
                }
                $scope.showNotesButton = function(){
                    return $scope.hasOrder();
                };

                $scope.numPending = function() {
                    return WaiverStatus.numPending();
                };
                $scope.numUnsigned = function() {
                    return WaiverStatus.numUnsigned();
                };

                $scope.hasOrder = function(){
                    return ($scope.order && $scope.order.id)
                };
                
                $scope.getCompleteStyle = function(){
                  return ($rootScope.hasReturn)?'background-color: #43AC6A;border-color: #3a945b;':'';  
                };
                
                $scope.showOrderNotes = function() {
                    if(!$scope.hasOrder()){
                        return;
                    }

                    var orderNotesModal = $modal.open({
                        animation: true,
                        templateUrl: 'static/components/common/directives/notes-modal/notes-modal.html',
                        size: 'lg',
                        resolve: {
                            'Order': function() {
                                return $scope.order;
                            }
                        },
                        controller: 'SPNotesModal'
                    });

                    orderNotesModal.result.then($scope.updateOrder, function(reason) {
                        console.log(reason);
                    });
                };

                var slugs = ['activity', 'guest', 'jumpers', 'offers', 'payment'];
                $scope.progressPercentage = function(){

                    return ''+(((slugs.indexOf($scope.current)+1)/5)*100)+'%'
                };

                $scope.getStatusClass = function(){
                    return ($scope.numUnsigned() > 0)?'btn-alert':($scope.numPending() > 0)?'btn-warning':'btn-success';
                };

                $scope.goToJumpersScreen = function(){
                    if(!$scope.hasOrder()){
                        return;
                    }
                    NavService.goToRoute('jumpers', {
                        'parkUrlSegment':$routeParams.parkUrlSegment,
                        'orderId':$scope.order.id,
                        'guestId':$routeParams.guestId
                    })
                };

                $scope.updateOrder = function(order) {
                    console.log('order after notes result: ', order)
                    $scope.order = order;
                    $rootScope.$broadcast('szeShowLoading');
                    OrderService.updateOrder(order.id, order).then(handleUpdateSuccess, logErrorHideLoading);
                };

                function handleUpdateSuccess(orderResult) {
                    console.log(orderResult);
                    $rootScope.$broadcast('szeHideLoading');
                }
                //   $rootScope.$on('szeShowLoading', function(evt, data){
                //      $scope.isLoading = true;
                //   })

                //   $rootScope.$on('szeHideLoading', function(evt, data){
                //      $scope.isLoading = false;
                //   })
            },
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            // template: '',
            templateUrl: 'static/components/layout/footer-navigation/footer-layout.html',
            // replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function($scope, iElm, iAttrs, ngModal) {

            }
        };
    }])
