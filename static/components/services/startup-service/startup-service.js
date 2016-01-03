'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services.startup-service:StartupService
 * @description
 * # StartupService
 * Service of the skyZoneApp
 */

angular.module('skyZoneApp')
  .service('StartupService', ['$location', 'ParkService', function($location, ParkService) {
    var self = this;

    self.startup = function() {
      ParkService.getCurrentPark()
        .success(function(park) {
          if(park.status.toLowerCase() === 'inactive' || park.haltOnlineSales === true) {
            $location.path('/store-offline');
          }
        });
    };
  }]);
