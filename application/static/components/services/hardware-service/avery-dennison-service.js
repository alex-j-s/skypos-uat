'use strict';
angular.module('skyZoneApp')
  .service('AveryDennisonService', ['$rootScope',
                               '$http', 
                               '$compile', 
                               '$timeout',
                               'HardwareService',
                               function($rootScope, $http, $compile, $timeout, HardwareService) {
   
   var self = this;
   
   self.connectionId = 'averyDennison';
   self.pId = 0x1042;
   self.vId = 0x12EE;
   
   self.connect = function() {
      HardwareService.socket.emit('usb-connection', { connectionId: self.connectionId, productId: self.pId, vendorId: self.vId });
   }
   
   self.disconnect = function() {
       HardwareService.socket.emit('usb-disconnect', { connectionId: self.connectionId });
   } 
    
    self.testPrint = function() {
        HardwareService.appendConsoleOutputArray('[HWCOMM] -- Sending Avery Dennison  test print command.');

		console.log('hello from avery test print');
		
		var command = "{F,25,A,R,E,200,200,\"FMT-25\" | \
		C,140,40,0,1,2,1,W,C,0,0,\"SAMPLE FORMAT\",0 | \
		B,1,12,F,85,40,1,2,40,5,L,0 | \
		T,2,18,V,50,50,1,1,1,1,B,L,0,0,1 | } \
		{B,25,N,1 | \
		1,\"02802811111\" | \
		2,\"TEXT FIELD\" | }"
	
    	HardwareService.socket.emit('usb-write', { connectionId: self.connectionId, command:command });
    }
	
	self.printTicket = function(parkName,startTime,endTime,productName,date) {
		var command = "";
		
		HardwareService.socket.emit('usb-write', { connectionId: self.connectionId, command:command });
	}
        

  }]);