'use strict';

angular.module('skyZoneApp')
    .controller('SPOffersController', ['$scope', '$q', '$rootScope', '$location', 'Catalog', 'Guest', 'Order', 'OrderService', 'ProductService', 'CatalogService', 'NavService', '$routeParams',
        function($scope, $q, $rootScope, $location, Catalog, Guest, Order, OrderService, ProductService, CatalogService, NavService, $routeParams) {
            

            function logErrorStopLoading(err) {
                $rootScope.$broadcast('szeHideLoading');
                $rootScope.$broadcast('szeError', err);
                $scope.showModal = false;
            }
            $scope.catalog = Catalog;
            console.log('catalog: ', $scope.catalog);
            $scope.order = Order;
            $scope.guest = Guest;
            
            $scope.viewCategory = {};

            $scope.parentCategory = {};

            $scope.childCategory = {};

            $scope.grandChildCategory = {};


            console.log($scope.catalog);

            $rootScope.$on('szeOrderUpdated', function(event,order) {
                console.log('order updated')
                $scope.order = order;
                $rootScope.$broadcast('szeHideLoading');
            });

            $scope.setParentCategory = function(c) {
                angular.forEach(c.products, function(product) {
                    product.viewQuantity = 0;
                    angular.forEach(product.attributes, function(attr) {
                        attr.viewSelect = "";
                    });
                });
                $scope.viewCategory = c;
                $scope.parentCategory = c;
                $scope.childCategory = {};
                $scope.grandChildCategory = {};
                console.log($scope.viewCategory);
            };

            $scope.setChildCategory = function(c) {
                angular.forEach(c.products, function(product) {
                    product.viewQuantity = 0;
                    angular.forEach(product.attributes, function(attr) {
                        attr.viewSelect = "";
                    });
                });
                $scope.viewCategory = c;
                $scope.childCategory = c;
                $scope.grandChildCategory = {};
                console.log($scope.viewCategory);
            }

            $scope.setGrandChildCategory = function(c) {
                angular.forEach(c.products, function(product) {
                    product.viewQuantity = 0;
                    angular.forEach(product.attributes, function(attr) {
                        attr.viewSelect = "";
                    });
                });
                $scope.viewCategory = c;
                $scope.grandChildCategory = c;
                console.log($scope.viewCategory);
            }

            $scope.enableChildren = function(c) {
                if ( c == undefined ) { return false; }
                if ( c.childCategories == undefined ) { return false; }

                return c.childCategories.length > 0
            }

            $scope.getCategoryName = function(c) {
                if ( c == undefined || c.name == undefined ) { 
                    return 'SELECT';
                } else {
                    return c.name;
                }

            };

            $scope.attSelected = function(p,attr) {
                console.log('attr selected: ',p,attr);
            };

            $scope.productFullySelected = function(p) {
                var selected = true;

                if ( p.viewQuantity > 0 ) {
                    angular.forEach(p.attributes, function(attr) {
                        if ( attr.viewSelect == "" || attr.viewSelect == attr.name ) { selected = false }
                    })
                } else {
                    return false;
                }

                return selected;
            };

            $scope.addproductToOrder = function(p) {
                $rootScope.$broadcast('szeShowLoading');
                if(!OrderService.productExistsOnOrder($scope.order, p)){
                    console.log('ADD TO ORDER');
                    OrderService.addLineItemToOrder($scope.order.id, OrderService.createLineItem(p.id, p.viewQuantity)).then(function(result) {
                        //$scope.order = result;
                        $rootScope.$broadcast('szeHideLoading');
                        console.log('order updated');
                    }, logErrorStopLoading)
                }
                else{
                    $scope.updateLineItem(p).then(function(){
                        $rootScope.$broadcast('szeHideLoading');

                    }, logErrorStopLoading)
                }
            };

            /* Note: these methods do not contain logic to determine the operation needed. 
                ie if you say update when none exist, err */
            $scope.removeLineItem = function(product) {

                var def = $q.defer();

                var oi = OrderService.getLineItemByProductId($scope.order, product.id);
                OrderService.deleteOrderLineItem($scope.order.id, oi.id)
                    .then(function(order) {
                        $scope.order = order;
                        def.resolve($scope.order);
                    }, function(err) {
                        logErrorStopLoading(err)
                        def.reject(err);
                    })

                return def.promise;
            };
            $scope.addLineItem = function(product) {

                var def = $q.defer();

                OrderService.addLineItemToOrder($scope.order.id,
                        OrderService.createLineItem(product.id, product.viewQuantity))
                    .then(function(order) {
                        $scope.order = order;
                        def.resolve($scope.order);
                    }, function(err) {
                        logErrorStopLoading(err)
                        def.reject(err);
                    })

                return def.promise;
            };
            $scope.updateLineItem = function(product) {
                var def = $q.defer();

                $scope.removeLineItem(product).then(function() {
                    $scope.addLineItem(product).then(function(order) {
                        def.resolve(order);
                    }, function(err) {
                        logErrorStopLoading(err)
                        def.reject(err);
                    })
                }, function(err) {
                        logErrorStopLoading(err)
                    def.reject(err);
                })

                return def.promise;

            };

            $scope.decrementViewQuantity = function(p) {
                p.viewQuantity = (p.viewQuantity && p.viewQuantity > 0) ? p.viewQuantity - 1 : 0;
                //console.log(p.viewQuantity)
            };
            $scope.incrementViewQuantity = function(p) {
                p.viewQuantity = p.viewQuantity + 1;
                //console.log(p.viewQuantity)
            };

            $scope.goToPaymentScreen = function(){
                if($scope.guest){
                    NavService.goToRoute('payment', {
                        'parkUrlSegment':$routeParams.parkUrlSegment,
                        'orderId':$scope.order.id,
                        'guestId':$scope.guest.id
                    });
                }else{
                    NavService.goToRoute('payment', {
                        'parkUrlSegment':$routeParams.parkUrlSegment,
                        'orderId':$scope.order.id
                    });
                }
            };
            $scope.goToJumpersScreen = function(){
                NavService.goToRoute('jumpers', {
                    'parkUrlSegment':$routeParams.parkUrlSegment,
                    'orderId':$scope.order.id,
                    'guestId':$scope.guest.id
                });
            };
        }
    ]);
