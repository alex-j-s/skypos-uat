angular.module('skyZoneApp')
	.controller('IdleCtrl', function ($scope, $rootScope, $location, $interval, Park, GetStartedPath) {
	
	var intervalKeeper = [];
	
	$scope.adIndex = 0;
	
	$scope.park = Park;

	$scope.ads = parseAds($scope.park.parkAdvertisements)

	$scope.GetStartedPath = GetStartedPath;

	function nextAd(){
		console.log('changing ads')
		$scope.adIndex++;
		if($scope.adIndex === $scope.ads.length){
			$scope.adIndex = 0;
		}
	}

	function startInterval(intervalSeconds){
		intervalKeeper.push($interval(function(){
			nextAd();
		}, intervalSeconds * 1000))
	}

	function interrupt(){		
		$interval.cancel(intervalKeeper.pop())
	}

	function parseAds(rawAdList){
		var cleanAds = [];
		angular.forEach(rawAdList, function(ad){
			cleanAds.push({
				name:ad.name,
				campaignDescription:ad.campaignDescription,
				actionItemName:ad.actionItemName,
				actionItemUrl:ad.actionItemUrl,
				imageUrl:ad.imageUrl
			})
		})
		return cleanAds;
	}

	$scope.getParkAdImgUrl = function(){
		return $scope.ads[$scope.adIndex].imageUrl;
	};

	$scope.getParkAdName = function(){
		return $scope.ads[$scope.adIndex].name;
	};

	$scope.getParkAdDesc = function(){
		return $scope.ads[$scope.adIndex].campaignDescription;
	};

	$scope.$on('$destroy', function(){
		interrupt();
	});

	startInterval(5);

});