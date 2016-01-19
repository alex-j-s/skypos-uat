'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.catalog:CatalogService
 * @description
 * # CatalogService
 * Service of the skyZoneApp
 */

angular.module('skyZoneApp')
  .service('CatalogService', ['$http', 'PromiseFactory', 'ParkService', '$route', function($http, PromiseFactory, ParkService, $route) {
    var self = this;

    self.catalogInfoMap = {
      'tickets-classes': {
        url: '#/parks/'+$route.current.params.parkUrlSegment+'/tickets/tickets-classes'
      },
      'events': {
        url: '#/parks/'+$route.current.params.parkUrlSegment+'/event'
      }
    };

    self.getDefaultProductFlowUrl = function(categoryType) {
      return '#/parks/'+$route.current.params.parkUrlSegment+'/catalog/'+categoryType+'/list';
    };

    self.getCategoryByKey = function(categoryKey) {
      var deferred = PromiseFactory.getInstance();
      var category;

      var categoryInfo = self.catalogInfoMap[categoryKey];
      if(!categoryInfo || !categoryInfo.id) {
        self.getCatalogList()
          .success(function() {
            category = self.catalogInfoMap[categoryKey];
            deferred.resolve(category);
          })
          .error(function(error) {
            deferred.reject(error);
          });
      }else{
        category = categoryInfo;
        deferred.resolve(category);
      }

      return deferred.promise;
    };

    self.applyCategoryUrlAndSaveInfo = function(categories) {
      categories.forEach(function(category) {
        var catalogInfo = self.catalogInfoMap[category.type];

        if(catalogInfo) {
          category.targetUrl = self.catalogInfoMap[category.type].url;
        }else{
          category.targetUrl = self.getDefaultProductFlowUrl(category.type);
          self.catalogInfoMap[category.type] = {'url': self.getDefaultProductFlowUrl(category.type)};
        }
        self.catalogInfoMap[category.type].id = category.id;
        self.catalogInfoMap[category.type].name = category.name;
      });
    };

    self.getCatalog = function(parkId) {
      var deferred = PromiseFactory.getInstance();

      $http.get('/api/parks/'+parkId+'/catalog')
          .success( function(data) {
            self.applyCategoryUrlAndSaveInfo(data.categories);

            deferred.resolve(data);
          })
          .error(function(error){
            deferred.reject(error);
          });

      return deferred.promise;
    };
    
    self.getActivities = function(parkId){
      var deferred = PromiseFactory.getInstance();
      ParkService.getParkId()
        .success(function(parkId) {
          $http.get('/api/parks/'+parkId+'/activities')
            .success( function(data) {
              deferred.resolve(data);

            })
            .error(function(error){
              deferred.reject(error);
            });
        })
        .error(function(error){
          deferred.reject(error);
        });
        return deferred.promise;
    };

    self.getCatalogList = function() {
      var deferred = PromiseFactory.getInstance();

      ParkService.getParkId() // will get from config at a later date
        .success(function(parkId) {

          $http.get('/api/parks/'+parkId+'/catalog/categories')
            .success( function(data) {
              self.applyCategoryUrlAndSaveInfo(data);

              deferred.resolve(data);
            })
            .error(function(error){
              deferred.reject(error);
            });
        })
        .error(function(error){
          deferred.reject(error);
        });

      return deferred.promise;
    };

  }]);
