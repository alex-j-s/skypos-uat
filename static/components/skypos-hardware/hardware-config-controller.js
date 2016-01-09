'use strict';

angular.module('skyZoneApp')
    .controller('SPHardwareConfigController',['$scope','HardwareService','VerifoneService','EpsonService','BocaService','RFIDReaderService','$modalInstance',
    	function($scope,HardwareService,VerifoneService,EpsonService,BocaService,RFIDReaderService,$modalInstance){
			
			$scope.devices = [
				{
					name: 'Verifone MX-925',	
					status: null,
					actions: [{
						title:'Reset & Show Idle',
						action: function () {
							console.log('clear screen');
							VerifoneService.clearAndShowIdle()
						}
					},
					{
						title:'Reboot',
						action: function() {
							// TODO: 
							console.log('reboot')
						}
					}]
				},
				{
					name: 'Epson Reciept Printer',
					status: null,
					actions: [{
						title: 'Test Print',
						action: function() {
							console.log('epson test print');
							EpsonService.testPrint();
						}
					}]
				},
				{
					name: 'Boca Ticket Sticker Printer',
					status: null,
					actions: [{
						title: 'Test Print',
						action: function() {
							console.log('Boca Test Print');
							BocaService.testPrint();
						}  
					}]
				},
				{
					name: 'RFID Reader',
					status: null,
					actions: [{
						title: 'Read RFID',
						action: function() {
							console.log('RFID Test Read');
							RFIDReaderService.readTag();
						}
					}]
				}
			];

			$scope.console = '';

			var updateConsole = function() {
				console.log('updating console');
				angular.forEach(HardwareService.consoleOutputArray,function(msg) {
					$scope.console += msg + '\n---------------\n';
				});
				if (!$scope.$$phase) { $scope.$apply(); }
				
				//$('#console').scrollTop = $('#console').scrollHeight;
			}

			updateConsole();
			HardwareService.registerConsoleOutputCallback(updateConsole);

			$scope.saveConsole = function() {
				// $scope.toJSON = '';
				// $scope.toJSON = angular.toJson($scope.console);
				var blob = new Blob([$scope.console], { type:"application/text;charset=utf-8;" });			
				var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href',window.URL.createObjectURL(blob));
                downloadLink.attr('download', 'console-output-' + new Date().getTime() + '.txt');
				downloadLink[0].click();
			};
			
			// $modalInstance.close(result);
			// $modalInstance.dismiss('reason');

			// HardwareService.socket.on('status',function(data) {
			// 	console.log('data: ', data);
			// 	var deviceNames = $scope.devices.map(function(obj) { return obj.name });
			// 	for (var di in data ) {
			// 		var deviceIndex = deviceNames.indexOf(data[di].name)
			// 		if ( deviceIndex > -1 ) {
			// 			$scope.devices[deviceIndex].status = data[di].status;
			// 		} else {
			// 			//console.log('new device', deviceName);
			// 			data[di].actions = [];
			// 			$scope.devices.push(data[di]);
			// 		}
			// 	}
			// 	//$scope.devices = data;
			// 	$scope.$apply();
			// });
			
			// HardwareService.socket.emit('status');
			
			
		}])


angular.module('skyZoneApp').directive('showTail', function () {
    return function (scope, elem, attr) {
        scope.$watch(function () {
            return elem[0].value;
        },
        function (e) {
            elem[0].scrollTop = elem[0].scrollHeight;
        });
    }

});