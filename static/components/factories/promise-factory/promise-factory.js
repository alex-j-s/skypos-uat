'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.factories:PromiseFactory
 * @description
 * # PromiseFactory
 * Factory of the skyZoneApp
 */


angular.module('skyZoneApp')
  .factory('PromiseFactory', ['$q', function($q) {

    return {
      getInstance: function() {
        var deferred = $q.defer();

        deferred.promise.success = function(fn) {
          deferred.promise.then(fn);
          return deferred.promise;
        };
        deferred.promise.error = function(fn) {
          deferred.promise.then(null, fn);
          return deferred.promise;
        };

        return deferred;
      }
    };

  }]);
