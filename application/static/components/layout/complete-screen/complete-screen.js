angular.module('skyZoneApp')
	.controller('CompleteCtrl', function ($scope, $timeout, $location, Park) {
	
	$scope.park = Park;
	$timeout(function(){
		$location.path('/find-guest')
	}, 5000)
});