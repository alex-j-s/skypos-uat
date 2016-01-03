angular.module('skyZoneApp')
	.controller('SPLoginController', function ($scope, $rootScope, $location, Park, AccessManager, UserCredentials) {

		$scope.doLogin = function(num, pin){
			AccessManager.authenticate(num, pin).then(function(result){
				$location.path('/skypos/start/'+Park.parkUrlSegment);
			}, function(err){
				$rootScope.$broadcast('szeHideLoading');
			})
		}

		// if(UserCredentials){
		// 	$rootScope.$broadcast('szeShowLoading');
		// 	$scope.doLogin(UserCredentials.employeeNumber, UserCredentials.employeePin);
		// }
	});
	