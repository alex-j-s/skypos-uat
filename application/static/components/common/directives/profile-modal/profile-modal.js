angular.module('skyZoneApp')
	.directive('profileModal', ['$rootScope','OrderService','ProfileService','StorageService','LookupService', function($rootScope,OrderService,ProfileService,StorageService,LookupService){
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
				$scope.canEdit = StorageService.handleGet('role') === 'pos_mgr';
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

				$scope.startEditMode = function() {
					$scope.getCountryList();
					if ( $scope.profile.personmailingcountrycode ) {
						$scope.getStateList($scope.profile.personmailingcountrycode);
					}
					$scope.isEditMode = true;
				}



				$scope.cancelEditMode = function() {
					console.log('ROLE: ', $scope.role);
					$scope.isEditMode = false;
				}

				$scope.submitEdit = function() {
					$scope.isEditMode = false;
					$rootScope.$broadcast('szeShowLoading');
					ProfileService.updateCustomerInformation($scope.profile.id,$scope.editProfile).then(function(result) {
						console.log('update successful', result);
						OrderService.getOrder($rootScope.order.id).then(function(result) {
							$rootScope.$broadcast('szeHideLoading');
						}, function(err) {
							$rootScope.$broadcast('szeHideLoading');
							$rootScope.$broadcast('szeError', err);
						});
					}, function(err) {
						console.log('there was an error updating the profile: ', err);
						$rootScope.$broadcast('szeHideLoading');
						$rootScope.$broadcast('szeError', err);
					})
				}

				$scope.countryList = [];
				$scope.stateList = [];

				$scope.getCountryList = function() {
					LookupService.getCountryList().then(function(result) {
						console.log('countries: ', result);
						$scope.countryList = result.data;
					}, function(err) {
						console.log('error getting countries: ', err);
					})
				}

				$scope.getStateList = function(isoCode) {
					console.log('country code: ', isoCode ? isoCode : $scope.editProfile.personmailingcountrycode)
					LookupService.getStateList(isoCode ? isoCode : $scope.editProfile.personmailingcountrycode).then(function(result) {
						console.log('state list: ', result);
						$scope.stateList = result.data;
					}, function(err) {
						console.log('err state list: ', err);
					})
				}

			}
		}
	}]);