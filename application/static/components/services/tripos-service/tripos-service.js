'use strict'

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:TriPOSService
 * @description
 * # TriPOSService
 * Service of the skyZoneApp
 */

 angular.module('skyZoneApp')
 	.service('TriPOSService',['$http', '$q', 'PromiseFactory','HardwareService', function($http, $q, PromiseFactory,HardwareService) {
 		var self = this;

 		self.url = '/tripos/';
 		self.laneId = 1;
 		//self.laneId = 9999;

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
			request.cardHolderPresentCode = 'Present';
			request = JSON.stringify(request);
			var config = {
					'url'   : self.swipeUrl,
					'method': 'POST',
					data    : request
			}
			
			$http(config)
				.success(function(result) {
					if ( result.hasErrors ) {
						def.reject(result) 
					} else {
						def.resolve(result);
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- swipeCard ' + self.laneId);
					}
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
					if ( result.hasErrors ) {
						def.reject(result) 
					} else {
						def.resolve(result);
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- voidTransaction: ' + self.laneId);
					}
				})
				.error(function(err) {
					console.log('Error Response from TriPOS Void: ', err);
					def.reject(err);
				});
			return def.promise;

		}

		self.refund = function(amount) {
			var def = PromiseFactory.getInstance();
			var refundUrl = '/tripos/refund'
			var request = {};
			request.laneId = self.laneId;
			request.amount = amount;
			var config = {
				'url': refundUrl,
				'method': 'POST',
				'data': request
			};
			
			$http(config)
			.success(function(result) {
				if ( result.hasErrors ) {
					def.reject(result) 
				} else {
					def.resolve(result);
					HardwareService.appendConsoleOutputArray('[TRIPOS] -- Refund processed ');
				}
			})
			.error(function(err) {
				console.log('Error Response from TriPOS refund: ', err);
				def.reject(err);
			});
		return def.promise;
		}

		self.showIdle = function() {
			var def = PromiseFactory.getInstance();

			var idleUrl = '/tripos/idle';
			var request = {
				'laneId': self.laneId
			};
			var config = {
				'url':idleUrl,
				'method':'POST',
				'data':request
			};

			$http(config)
				.success(function(result) {
					if ( result.hasErrors ) {
						def.reject(result) 
					} else {
						def.resolve(result);
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- Idle screen shown on lane: ' + self.laneId);
					}
				})
				.error(function(err) {
					def.reject(err);
				});
			return def.promise;
		}

		self.getStatus = function() {
			var def = PromiseFactory.getInstance();

			var statusUrl = '/tripos/status/triPOS/hello';

			var config = {
				'url': statusUrl,
				'method': 'GET',
			}

			$http(config)
				.success(function(result) {
					if ( result.echo === 'hello' ) {
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- TriPOS Connected');
						def.resolve(result);
					} else {
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- ERROR: TriPOS Not Functioning');
						def.reject(result);
					}
				})
				.error(function(err) {
					HardwareService.appendConsoleOutputArray('[TRIPOS] -- ERROR connecting to triPOS: ' + err);
					def.reject(err);
				});
			return def.promise;

		}

		self.getLaneStatus = function() {
			var def = PromiseFactory.getInstance();

			var statusUrl = '/tripos/status/lane/' + self.laneId;

			var request = {
				'laneId':self.laneId
			}

			var config = {
				'url':statusUrl,
				'method':'GET',
				'data':request
			}

			$http(config)
				.success(function(result) {
					if ( result.hasError ) {
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- ERROR Communicating to Payment Device');
						def.reject(result);
					} else {
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- Connected to Payment Device with Status: ' + result.laneStatus);
						def.resolve(result)
					}
				})
				.error(function(err) {
					HardwareService.appendConsoleOutputArray('[TRIPOS] -- ERROR Communicating to Payment Device: ', err);
					def.reject(err);
				});
			return def.promise;
		}
 	}]);