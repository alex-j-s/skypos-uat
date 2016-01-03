'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:LookupService
 * @description
 * # LookupService
 * Service of the skyZoneApp
 */

angular.module('skyZoneApp')
  .service('LookupService', ['$http', function($http) {
    var self = this;

    self.getCountryList = function() {
      return $http.get('/api/reference/countries');
    };

    self.getStateList = function(countryCode) {
      return $http.get('/api/reference/states?countryIsoCode='+countryCode);
    };

  }]);