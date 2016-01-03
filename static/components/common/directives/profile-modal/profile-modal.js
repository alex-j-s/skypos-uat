angular.module('skyZoneApp')
	.directive('profileModal', ['$rootScope','OrderService', function($rootScope,OrderService){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			scope: {
				'profile':'='
			}, // {} = isolate, true = child, false/undefined = no change
			controller: function($scope, $element, $attrs, $transclude) {
			},
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
			// template: '',
			templateUrl: 'static/components/common/directives/profile-modal/profile-modal.html',
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function($scope, iElm, iAttrs, controller) {

				$scope.editProfile = angular.copy($scope.profile);
				$scope.isEditMode = false;
				$scope.loadingOrders = false;
				$scope.orders = {};
				$scope.getOrders = function() {
					$scope.activeTab = 'orderHistory'
					//if ( Object.keys($scope.orders).length != 0 ) { return; }
					$scope.loadingOrders = true;
					OrderService.getOrders($scope.profile.id).then(function(result) {
						$scope.loadingOrders = false;
						console.log('loaded orders: ', result);
						$scope.orders = result.data;
					},function(err) {
						$scope.loadingOrders = false;
						console.log('err: ', err);
					})
				};

				$scope.loadingMinors = false;
				$scope.minors = [];
				$scope.getMinors = function() {
					$scope.loadingMinors = false;
					$scope.activeTab = 'minors';
				};

				$scope.getWaiverStatus = function(waiver) {
					var dateSplit = waiver.expirationDate.split('-');
					var expirationDate = new Date(dateSplit[0],dateSplit[1],dateSplit[2]);
					var now = new Date();

					if ( expirationDate < now ) {
						return 'Expired';
					} else if ( waiver.approved ) {
						return 'Approved'; 
					} else {
						return 'pending';
					}
				}

			}
		}
	}]);