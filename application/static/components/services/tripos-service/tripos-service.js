'use strict'

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:TriPOSService
 * @description
 * # TriPOSService
 * Service of the skyZoneApp
 */

 angular.module('skyZoneApp')
 	.service('TriPOSService',['$http', '$q', 'PromiseFactory', function($http, $q, PromiseFactory) {
 		var self = this;

 		self.url = '/tripos/'

 		self.getAPI = function() {
 			var def = PromiseFactory.getInstance();

 			var config = {
 				'url':self.url,
 				'method':'GET'
 			}

 			$http(config)
 				.success(function(result) {
 					console.log('RESULT FROM TRIPOS: ', result);
 					def.resolve(result);
 				})
 				.error(function(err) {
 					console.log('ERROR FROM TRIPOS: ', err);
 					def.reject(err);
 				});

 			return def.promise;
 		}
 	}]);