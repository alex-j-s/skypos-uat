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
		
		var command = "{F,1,A,R,E,1000,409,\"FMT-25\" | \
        C,415,305,0,16,3,2,O,L,0,3,\"Sky Zone Sacramento\",0 | \
        C,355,260,0,1,3,2,O,L,0,3,\"Tester, J\",0 | \
        C,400,205,0,1,5,4,O,L,0,3,\"530-\",0 | \
        C,255,205,0,1,5,4,O,L,0,3,\"630\",0 | \
        C,415,190,0,2,3,2,O,L,0,3,\"Product Name\",0 | \
        C,415,170,0,2,3,2,O,L,0,3,\"Adolescent\",0 | \
        C,415,150,0,2,3,2,O,L,0,3,\"Thur. Feb, 11 2015 \",0 | \
        C,455,125,0,2,3,2,O,L,0,3,\"Here's a line where marketing can say whatever \",0 | \
        B,1,12,F,85,100,1,2,40,5,L,0 | \
        T,2,18,V,50,50,1,1,1,1,B,L,0,0,1 | } \
        {B,1,N,1 | \
        2,\"\" | }"

  
	
    	HardwareService.socket.emit('usb-write', { connectionId: self.connectionId, command:command });
    }
	
	self.printTicket = function(parkName,startTime,endTime,productName,date,customerFirstInitial,customerLastName,customerAgeGroup,marketingText) {
		var command = "{F,1,A,R,E,1000,409,\"FMT-25\" |"
    command += "C,415,305,0,16,3,2,O,L,0,3,\"" + parkName + "\",0 | "
    command += "C,415,260,0,1,3,2,O,L,0,3,\"" + customerLastName + ", " + customerFirstInitial + "\",0 | "
    command += "C,415,220,0,3,2,1,O,L,0,3,\"" + startTime + " - " + endTime + "\",0 | "
    //command += "C,255,205,0,1,5,4,O,L,0,3,\"" + endTime + "\",0 | "
    command += "C,415,190,0,2,3,2,O,L,0,3,\"" + productName + "\",0 | "
    command += "C,415,170,0,2,3,2,O,L,0,3,\"" + customerAgeGroup + "\",0 | "
    command += "C,415,150,0,2,3,2,O,L,0,3,\"" + date + "\",0 | "
    command += "C,415,125,0,2,3,2,O,L,0,3,\"" + marketingText + "\",0 | "
    command += "B,1,12,F,85,100,1,2,40,5,L,0 | "
    command += "T,2,18,V,50,50,1,1,1,1,B,L,0,0,1 | } "
    command += "{B,1,N,1 | "
    command += "2,\"\" | }"
		
		HardwareService.socket.emit('usb-write', { connectionId: self.connectionId, command:command });
	}
        

  }]);