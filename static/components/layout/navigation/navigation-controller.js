/**
 * Created by dharmendrarajpurohit on 13/10/15.
 */
'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:bigLoader
 * @description
 * # bigLoader
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
	.service('NavService', ['$rootScope', '$location', '$routeParams', function($rootScope, $location, $routeParams){
		var self = this;

		self.navRoutes = [{
            		'key':'activity',
            		'label':'Activity',
            		'icon':'time.png',
            		'route':'/skypos/activity/{parkUrlSegment}',
            		'canAccess': 'hasPark',
            		'errorMsg': 'The Activity screen requires a park to be selected. Please refresh and try again.',
                    'next':'guest',
                    'prev':'start'
            	}, {
            		'key':'guest',
            		'label':'Guest',
            		'icon':'guest-dis.png',
            		'route':'/skypos/guest/{parkUrlSegment}/{reservationId}/{productId}/{quantity}',
            		'canAccess': 'hasPark',
            		'errorMsg': 'The Guest screen requires a park to be selected. Please refresh and try again.',
                    'next':'jumpers',
                    'prev':'activity'
            	}, {
                    'key':'guestWOrder',
                    'label':'Guest',
                    'icon':'guest-dis.png',
                    'route':'/skypos/guest/{parkUrlSegment}/{orderId}',
                    'canAccess': 'hasGuestAndOrder',
                    'errorMsg': 'Please refresh and try again.',
                    'next':'jumpers',
                    'prev':'activity'
                }, {
            		'key':'jumpers',
            		'label':'Jumpers',
            		'icon':'jumper-dis.png',
            		'route':'/skypos/jumpers/{parkUrlSegment}/{guestId}/{orderId}',
            		'canAccess': 'hasOrderAndGuest',
            		'errorMsg': 'The Jumpers screen requires a customer and activity to be selected.',
                    'next':'offers',
                    'prev':'guest'
            	}, {
            		'key':'offers',
            		'label':'Offers',
            		'icon':'merch-dis.png',
            		'route':'/skypos/offers/{parkUrlSegment}/{guestId}/{orderId}',
            		'canAccess': 'hasOrderAndGuest',
            		'errorMsg': 'The Offers screen requires a customer and activity to be selected.',
                    'next':'payment',
                    'prev':'jumpers'
            	}, {
            		'key':'payment',
            		'label':'Payment',
            		'icon':'payment-dis.png',
            		'route':'/skypos/payment/{parkUrlSegment}/{guestId}/{orderId}',
            		'canAccess': 'hasOrderAndGuest',
            		'errorMsg': 'The Payment screen requires a customer and activity to be selected.',
                    'next':null,
                    'prev':'offers'
            	}]


            	self.routeParamKeys = ['parkUrlSegment','guestId','orderId','reservationId', 'quantity', 'productId'];

            	self.getRoutes = function(){
            		var out = [];
            		var t = {};
            		angular.forEach(self.navRoutes, function(route){
                        if(route.key=='guestWOrder'){
                            return
                        }
            			if($rootScope.SelectedPOSType!=null && $rootScope.SelectedPOSType.id===2)
						{
							if(route.key=='activity'||route.key=='guest'||route.key=='jumpers')
							 return;

						}
						t = angular.copy(route);
            			t.route = self.buildRoute(t, $routeParams);

            			out.push(t);
            		})
            		return out;
            	}

                self.buildRoute = function(rte, params){
                	var out = angular.copy(rte.route);
                	angular.forEach(self.routeParamKeys, function(param, index){
                		if(out.indexOf('{'+param+'}')){
	                		out = out.replace('{'+param+'}', params[param]);
                		}
                	})
                	return out;
                };

                self.getParkUrlSegment = function(){
                	if(!$rootScope.park){
                		return false;
                	}

                	return $rootScope.park.parkUrlSegment;
                };
                self.getCustomerId = function(){
                	if(!$rootScope.guest){
                		return false;
                	}

                	return $rootScope.guest.id;
                };
                self.getOrderId = function(){
                	if(!$rootScope.order){
                		return false;
                	}

                	return $rootScope.order.id;
                };


                self.hasPark = function(){
                	console.log('hasPark', $rootScope.park)
                	return self.getParkUrlSegment();
                };

                self.hasOrderAndGuest = function(){
                    return (self.hasPark() && self.getCustomerId() && self.getOrderId());
                };

                self.hasOrderAndPark = function(){
                    return (self.hasPark() && self.getOrderId());
                };

                self.isAccessible = function(route){
                	return self[route.canAccess]();
                };

                self.goToRoute = function(slug, params){

                	angular.forEach(self.navRoutes, function (route){
                		if(route.key === slug){
		                	$location.path(self.buildRoute(angular.copy(route), params));
                		}
                	});

                };
	}])
    .directive('szeNavigation', ['$location', '$rootScope', 'NavService', 'AlertService', '$modal', 
        function($location, $rootScope, NavService, AlertService, $modal){
    	return {
    		// name: '',
            // priority: 1,
            // terminal: true,
            // scope: {}, // {} = isolate, true = child, false/undefined = no change
            controller: function($scope, $element, $attrs, $transclude) {},
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            // template: '',
            templateUrl: 'static/components/layout/navigation/navigation.html',
            // replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function($scope, iElm, iAttrs, ngModal) {
				
				$scope.isLoading = false;

                $scope.hardwareModal = function(){
                    var hwm = $modal.open({
                                animation: true,
                                size:'xl',
                                templateUrl: 'static/components/skypos-hardware/hardware-config-layout.html',
                                controller: 'SPHardwareConfigController'
                            });
                        hwm.result.then(handleHardwareModalResult, function(reason){

                        }); 
                };

                function handleHardwareModalResult(result){
                    console.log(result);
                }


                $scope.isActive = function(rte){
                	return $location.path().indexOf(rte.key) > -1;
                };

                $scope.goToRoute = function(rte){
                	if($scope.isActive(rte)){
                		return;
                	}
                	else if(NavService.isAccessible(rte)){
                		$location.path(rte.route)
                	}else{
                		$scope.alert = AlertService.getError('Screen unavailable: ' + rte.errorMsg);
                	}
                };

                $scope.close = function(){
                	$scope.alert = null;
                };

				$rootScope.$on('posChange', function(){
					$scope.alert = null;
					$scope.isLoading = false;
					$scope.routes = NavService.getRoutes();
				})
                $rootScope.$on('szeError', function(evt, error){
                	$scope.alert = AlertService.getError((error && error.message)?error.message:error);
                })
                $rootScope.$on('szeSuccess', function(evt, error){
                	$scope.alert = AlertService.getError((error && error.message)?error.message:error);
                    $scope.alert.type = 'success';
                })

                $rootScope.$on('szeDismissError', function(evt, error){
                	$scope.alert = null;
                })

                $rootScope.$on('$routeChangeStart', function(evt, next, current){
                	$scope.isLoading = true;
                })

                $rootScope.$on('$routeChangeSuccess', function(evt, current, prev){
                	$scope.alert = null;
                	$scope.isLoading = false;
	            	$scope.routes = NavService.getRoutes();
                })

                $rootScope.$on('$routeChangeError', function(evt, current, prev, rejection){
                	console.error(rejection);
                	$scope.isLoading = false;
                	$scope.alert = AlertService.getError(rejection);
                })

                $rootScope.$on('szeShowLoading', function(evt, data){
                	$scope.isLoading = true;
                })

                $rootScope.$on('szeHideLoading', function(evt, data){
                	$scope.isLoading = false;
                })

            }
    	};
    }])