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

 		self.url = '/tripos/';
 		//self.laneId = 1;
 		self.laneId = 9999;

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
 		
		self.swipeCard = function(amount){
			var def = PromiseFactory.getInstance();
			self.swipeUrl = '/tripos/sale';
			var request = {};
			request.laneId = self.laneId;
			request.transactionAmount = amount;
			request = JSON.stringify(request);
			var config = {
					'url'   : self.swipeUrl,
					'method': 'POST',
					data    : request
			}
			
			$http(config)
				.success(function(result) {
				console.log('RESULT FROM TRIPOS: '+result);
					def.resolve(result);
				})
				.error(function(err) {
					console.log('ERROR FROM TRIPOS: '+err);
					def.reject(err);
				});
			return def.promise;
				
		}

		self.voidTransaction = function(transactionId) {
			var def = PromiseFactory.getInstance();
			var voidUrl = '/tripos/void/' + transactionId;
			var request = {};
			request.laneId = self.laneId;
			request = JSON.stringify(request);
			var config = {
				'url': voidUrl,
				'method': 'POST',
				'data': request
			};

			$http(config)
				.success(function(result) {
					console.log('Response from TriPOS Void: ', result);
					def.resolve(result);
				})
				.error(function(err) {
					console.log('Error Response from TriPOS Void: ', err);
					def.reject(err);
				});
			return def.promise();

		}

		self.refund = function(amount) {
			var def = PromoseFactory.getInstance();
			var refundUrl = '/tripos/refund'
			var request = {};
			request.laneId = self.laneId;
			request.amount = amount;
			var config = {
				'url': refundUrl,
				'method': 'POST',
				'data': request
			};
		}
 	}]);