'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services.print-service:print-service
 * @description
 * # PrintService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('HardwareService', ['$rootScope', '$http', '$compile', '$timeout', '$window','$location', function($rootScope, $http, $compile, $timeout, $window, $location) {
    var self = this;
    
    self.server = 'http://localhost'
    self.port = $location.port();
    self.namespace = '/skyPOS'
    
    self.url = self.server + ':' + self.port + self.namespace
    
    self.socket = io.connect(self.url);
    
    // HANDLE SOCKET RESPONSES
    self.socket.on('connect', function() {
      console.log('[HWCOMM] -- Connected');
      self.appendConsoleOutputArray('[HWCOMM] -- Connected');
    });
    
    self.socket.on('response', function(data) { 
      console.log('[HWCOMM] -- Response: ', data.message);
      self.appendConsoleOutputArray('[HWCOMM] -- Response: ' + data.message); 
    });
    
    self.socket.on('error', function(data) {
      console.log('[HWCOMM] - ERROR: ', data.message);
      self.appendConsoleOutputArray('[HWCOMM] - ERROR: ' + data.message);
      
      // TODO: handle errors
    });
    
    $window.addEventListener("beforeunload", function (event) {
      self.socket.emit('disconnect-request')
    });
    // METHODS
    self.isEpsonOnline = function() {
      
    };

    self.consoleOutputArray = [];
    self.consoleOutputObserverCallbacks = [];
    self.registerConsoleOutputCallback = function(callback) {
        self.consoleOutputObserverCallbacks.push(callback);
    }
    self.notifyConsoleOutputObservers = function() {
        angular.forEach(self.consoleOutputObserverCallbacks, function(callback) {
            callback();
        })
    }

    //self.consoleOutputString = 'something';
    self.appendConsoleOutputArray = function(msg) {
        
        if (self.consoleOutputArray.length > 1000) {
            self.consoleOutputArray.shift();
        }

        self.consoleOutputArray.push(msg);

        self.notifyConsoleOutputObservers();
    }
    // this.epsonConnect = function() {

    //   this.socket.emit('usb-connection', { vendorId:EpsonFactory.vendorId, productId:EpsonFactory.productId });
    // };
    
    // this.epsonPrint = function() {
    //   this.socket.emit('usb-write', { command:EpsonFactory.sampleCommand });
    // };
    
    // this.connectBoca = function() {
      
    // };
    
    // this.connectVerifone = function() {
      
    // };
    
}]);