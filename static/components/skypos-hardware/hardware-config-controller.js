'use strict';

angular.module('skyZoneApp')
    .controller('SPHardwareConfigController',['$scope','HardwareService','VerifoneService','$modalInstance',
    	function($scope,HardwareService,VerifoneService,$modalInstance){
		
			console.log('hardware config controller');
			
			
			$scope.devices = [
				{
					name: 'verifone',	
					status: VerifoneService.isOnline,
					actions: [{
						title:'Clear Screen',
						action: function () {
							console.log('clear screen');
						}
					}]
				}
			];
			
			// $modalInstance.close(result);
			// $modalInstance.dismiss('reason');

			HardwareService.socket.on('status',function(data) {
				console.log('data: ', data);
				var deviceNames = $scope.devices.map(function(obj) { return obj.name });
				for (var di in data ) {
					var deviceIndex = deviceNames.indexOf(data[di].name)
					if ( deviceIndex > -1 ) {
						$scope.devices[deviceIndex].status = data[di].status;
					} else {
						//console.log('new device', deviceName);
						data[di].actions = [];
						$scope.devices.push(data[di]);
					}
				}
				//$scope.devices = data;
				$scope.$apply();
			});
			
			HardwareService.socket.emit('status');
			
			
		}])