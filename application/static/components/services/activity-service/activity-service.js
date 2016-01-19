'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.activities:ActivityService
 * @description
 * # ActivityService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
    .service('ActivityService', ['$http', 'ParkService', 'PromiseFactory', function($http, ParkService, PromiseFactory) {
        var self = this;

        self.currentActivity = [
            {   "id":5,
            "sfId":"a0C17000002ud26EAA",
            "name":"Default Open Jump Activity - Jump Zones",
            "startTime":"2015-10-15",
            "endTime":null,
            "activityType":"Open Jump",
            "parkSfId":"0011700000F7Y6QAAV",
            "parkId":2,
            "zoneId":null,
            "zoneSfId":null,
            "recordType":{"id":"28","name":"Default SZ Zone Activity"}
        },
            {   "id":4,
                "sfId":"a0C17000002ud21EAA",
                "name":"Default Open Activity - Event Zones",
                "startTime":"2015-10-15",
                "endTime":null,
                "activityType":"Open",
                "parkSfId":"0011700000F7Y6QAAV",
                "parkId":2,
                "zoneId":null,
                "zoneSfId":null,
                "recordType":{ "id":"28","name":"Default SZ Zone Activity"}
            }
           ];

        self.getActivity = function(){
            return self.currentActivity;
        };

        self.getActivityList = function() {
            var deferred = PromiseFactory.getInstance();

            ParkService.getParkId()
                .success(function(parkId) {

                    $http.get('/api/parks/'+parkId+'/activities')
                        .success(function(list) {
                            deferred.resolve(list);
                        })
                        .error(function(error) {
                            deferred.reject(error);
                        });
                })
                .error(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        };

        self.getActivityProductByPark = function(parkUrlSegment, activityName) {
            var deferred = PromiseFactory.getInstance();

            ParkService.getParkId()
                .success(function(parkId) {

                        $http.get('/api/parks/'+parkId+'/activites/products?activity='+activityName)
                            .success(function(duration) {
                                deferred.resolve(duration);
                            })
                            .error(function(error) {
                                deferred.reject(error);
                            });

                })
                .error(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        };


    }]);