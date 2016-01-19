'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:AlertService
 * @description
 * # AlertService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('AlertService', [ function() {
    var self = this;

    var TYPE_SUCCESS = 'success';
    var TYPE_ALERT = 'danger';

    var getAlert = function(type, msg) {
      return {
        type: type,
        msg: msg
      };
    };

    var genericError = getAlert(TYPE_ALERT, 'An error has occurred. Please try again.');

    var genericSuccess = getAlert(TYPE_SUCCESS, 'Your submission was processed successfully.');

    self.getError = function(msg) {
      return (!msg) ? genericError : getAlert(TYPE_ALERT, msg);
    };

    self.getSuccess = function(msg) {
      return (!msg) ? genericSuccess : getAlert(TYPE_SUCCESS, msg);
    };

  }]);