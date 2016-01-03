'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.parks:ParkService
 * @description
 * # ParkService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('ParkService', [ '$http', 'PromiseFactory', '$rootScope', 
      function($http, PromiseFactory, $rootScope) {
    var self = this;


    self.doesParkInfoExist = function() {
      return $rootScope.park && $rootScope.park.status;
    };

    self.getParkCurrencyCode = function() {
      return ($rootScope.park) ? $rootScope.park.currencyCode : '$';
    };

    self.getParkId = function() {
      var deferred = PromiseFactory.getInstance();

      self.getCurrentPark()
        .success(function(parkData) {
          deferred.resolve(parkData.id);
        })
        .error(function(error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };

    self.getCurrentPark = function() {
      var deferred = PromiseFactory.getInstance();

      if(!$rootScope.park || !$rootScope.park.status) {
          deferred.reject('No current park available');
      }else{
        console.log('found current park')
        deferred.resolve($rootScope.park);
      }

      return deferred.promise;
    };

    self.filterAddOnProductsForPark = function(park){
      var out = [];
      var ids = [];
      angular.forEach(park.product, function(prod, index){
        if(ids.indexOf(prod.id) === -1){
          ids.push(prod.id);
          out.push(prod);
        }
      });

      park.product = out;

      return park;
    };

    self.getParks = function(parkUrlSegment) {
      function removeHeaders(data, getHeaders){
        var headers = getHeaders();
        headers[ "Content-Type" ] = "text/plain";
        return data;
      }

      var url = '/api/parks';

      if(parkUrlSegment) {
        url += '?parkUrlSegment='+parkUrlSegment;
      }

      return $http.get(url,{transformRequest:removeHeaders});
    };

    self.setPark = function(park) {
      park = self.filterAddOnProductsForPark(park);
      console.log('setting park', park)
      $rootScope.park = park;
    };

  }]);
