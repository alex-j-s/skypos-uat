'use strict';
angular.module('skyZoneApp')
  .service('RFIDReaderService', ['$rootScope',
                                 '$http', 
                                 '$compile', 
                                 '$timeout',
                                 '$filter',
                                 'HardwareService',
                                 function($rootScope, $http, $compile, $timeout, $filter, HardwareService) {
								   
		var self = this;
    
    self.latestRead = ''
    self.callback = null;
    self.errorCallback = null;				   
   
    HardwareService.socket.on('rfid-response', function(data) {
     
      if (data.success) {
        console.log('[HWCOMM] -- RFID Response: ', data.message);
        HardwareService.appendConsoleOutputArray('[HWCOMM] -- RFID Response: ' + data.message);
        if ( self.callback != null ) { 
          self.callback(data.message); 
        }
        self.callback = null;
      } else {
        console.log('[HWCOMM] -- No RFID Tag in Range.');
        HardwareService.appendConsoleOutputArray('[HWCOMM] -- No RFID Tag in Range');
        if ( self.errorCallback != null ) { self.errorCallback("No Tag in Range"); }
        self.errorCallback = null;
      }
    });
    
    self.readTag = function(callback,errorCallback) {
      self.callback = callback;
      console.log('[HWCOMM] -- 1 rfid callback: ', self.callback);
      self.errorCallback = errorCallback;
      HardwareService.appendConsoleOutputArray('[HWCOMM] -- Sending read command to RFID reader');
      HardwareService.socket.emit('rfid-read');
    }
}]);