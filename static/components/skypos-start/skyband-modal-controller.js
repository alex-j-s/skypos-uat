'use strict';

angular.module('skyZoneApp')
    .controller('SPSkybandModal', ['$scope', '$rootScope', '$modalInstance', 'RFIDReaderService', function($scope, $rootScope, $modalInstance, RFIDReaderService){

    	$scope.closeModal = function(input) {
    		console.log('RFID: '+input)
    		$modalInstance.close(input);
    	};

        $scope.dismissModal = function(reason){
            console.log('Modal dismissed: ', reason);
            $modalInstance.dismiss(reason);
        };

        RFIDReaderService.readTag($scope.closeModal, $scope.dismissModal);

    }]);