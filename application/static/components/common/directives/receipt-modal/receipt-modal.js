'use strict';

angular.module('skyZoneApp')
    .controller('SPReceiptModal', ['$scope', '$rootScope', '$modalInstance', function($scope, $rootScope, $modalInstance){

    	var orderTemplate = 'SZO-0000000000';
		$scope.scannerInput = '';
    	$scope.orderNumber;
		
		//$scope.input = "";

    	// $scope.handleScannerInput = function(input){
		// 	console.log('input received: '+input)
		// 	console.log(new Date().getTime());
		// 	if(angular.isDefined(input) && input.length > 0 && angular.isNumber(parseInt(input))){
    	// 		var stringInput = ''+input+'';
    	// 		//$scope.orderNumber = orderTemplate.substring(0, orderTemplate.length - stringInput.length) + stringInput;
		// 		$scope.orderNumber = stringInput;
    	// 		//$scope.closeModal($scope.orderNumber);
    	// 	};
    	// };
		
    	$scope.closeModal = function(input) {
            $rootScope.$broadcast('szeShowLoading')
    		console.log('Order Number: '+input)
    		$modalInstance.close(input);
    	};

    }]);