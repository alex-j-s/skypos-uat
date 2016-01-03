'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services.storage-service:StorageService
 * @description
 * # StorageService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('StorageService', [ '$window', function($window) {
    var self = this;

    var authStorageKey = 'authToken';
    var parkStorageKey = 'parkUrlSegment';
    var orderIdStorageKey = 'orderId';

    var storage = $window.localStorage;

    // store unverified token in memory. if refreshed, will be wiped out
    var unverifiedToken;

    self.getAuthToken = function() {
      return storage[authStorageKey];
    };

    self.setAuthToken = function(value, isVerified) {
      if(isVerified) {
        self.handleSet(authStorageKey, value);
        unverifiedToken = null;
      }else{
        unverifiedToken = value;
      }
    };

    self.getUnverifiedToken = function() {
      return unverifiedToken;
    };

    self.getParkUrlSegment = function() {
      return storage[parkStorageKey];
    };

    self.setParkUrlSegment = function(value) {
      self.handleSet(parkStorageKey, value);
    };

    self.getOrderId = function() {
      return storage[orderIdStorageKey];
    };

    self.setOrderId = function(value) {
      self.handleSet(orderIdStorageKey, value);
    };

    self.handleSet = function(key, value) {
      if(value) {
        storage[key] = value;
      }else{
        delete storage[key];
      }
    };

    self.handleGet = function(key){
        return storage[key];
    };

  }]);
