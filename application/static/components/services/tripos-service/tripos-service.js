'use strict'

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:TriPOSService
 * @description
 * # TriPOSService
 * Service of the skyZoneApp
 */

 angular.module('skyZoneApp')
 	.service('TriPOSService',['$rootScope', '$http', '$q', 'PromiseFactory','HardwareService', function($rootScope, $http, $q, PromiseFactory,HardwareService) {
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

 		
 	   function logErrorForPaymentReturn(err) {
           $rootScope.$broadcast('szeError', 'Payment return issue '+JSON.stringify(err));
           $scope.showModal = false;
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
					if ( result._hasErrors ) {
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
		
		self.reversalFlow = function(amount,transactionId,paymentType){
			var def = PromiseFactory.getInstance();
			self.reversal(amount,transactionId,paymentType).success(function(result) {
				result.endpoint = 'reversal';
				def.resolve(result);
			})
			.error(function(err) {
<<<<<<< HEAD
				//logErrorForPaymentReturn(err);
				self.voidTransaction(transactionId).success(function(result) {
					def.resolve(result);
				})
				.error(function(err) {
					//logErrorForPaymentReturn(err);
					if (paymentType == 'Debit') {
						self.refund(amount,transactionId,paymentType).success(function(result) {
							def.resolve(result);
						})
						.error(function(err) {
							def.reject(err);
						})
					} else {
						self.return(amount,transactionId,paymentType).success(function(result) {
							def.resolve(result);
						})
						.error(function(err) {
							//logErrorForPaymentReturn(err);
							def.reject(result) 
						});
					}
=======
				logErrorForPaymentReturn(err);
				self.voidTransaction(amount,transactionId,paymentType).success(function(result) {
					result.endpoint = 'void';
					def.resolve(result);
				})
				.error(function(err) {
					logErrorForPaymentReturn(err);
					self.return(amount,transactionId,paymentType).success(function(result) {
						result.endpoint = 'return';
						def.resolve(result);
					})
					.error(function(err) {
						logErrorForPaymentReturn(err);
						def.reject(result) 
					});
>>>>>>> c1561d8e5bce25fe41e64f2313649b6c3b3d5c5a
				});
			});
			return def.promise;
		}

		self.voidTransaction = function(transactionId) {
			var def = PromiseFactory.getInstance();
			var voidUrl = '/tripos/void/' + transactionId;
			var request = {};
			request.laneId = self.laneId;
			request.cardHolderPresentCode = 'Present';
			request = JSON.stringify(request);
			var config = {
				'url': voidUrl,
				'method': 'POST',
				'data': request
			};

			$http(config)
				.success(function(result) {
					if ( result._hasErrors || result.statusCode === 'Failed' || !result.isApproved) {
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
		
		self.reversal = function(amount,transactionId,paymentType) {
			var def = PromiseFactory.getInstance();
			var returnUrl = '/tripos/reversal/' + transactionId + '/' + paymentType;
			var request = {
				'laneId':self.laneId,
				'transactionAmount':amount,
				'cardHolderPresentCode':'Present'
			};
			var config = {
				'url':returnUrl,
				'method':'POST',
				'data':request
			};

			$http(config)
				.success(function(result) {
					if ( result._hasErrors || !result.isApproved) {
						def.reject(result) 
					} else {
						def.resolve(result);
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- voidTransaction: ' + self.laneId);
					}
				})
				.error(function(err) {
					def.reject(err);
				});
			return def.promise;
		}
 
		self.return = function(amount,transactionId,paymentType) {
			var def = PromiseFactory.getInstance();
			var returnUrl = '/tripos/return/' + transactionId + '/' + paymentType;
			var request = {
				'laneId':self.laneId,
				'transactionAmount':amount,
				'cardHolderPresentCode':'Present'
			};
			var config = {
				'url':returnUrl,
				'method':'POST',
				'data':request
			};

			$http(config)
				.success(function(result) {
					if ( result._hasErrors || !result.isApproved) {
						def.reject(result) 
					} else {
						def.resolve(result);
						HardwareService.appendConsoleOutputArray('[TRIPOS] -- voidTransaction: ' + self.laneId);
					}
				})
				.error(function(err) {
					def.reject(err);
				});
			return def.promise;
		}

		self.refund = function(amount) {
			var def = PromiseFactory.getInstance();
			var refundUrl = '/tripos/refund'
			var request = {};
			request.laneId = self.laneId;
			request.transactionAmount = amount;
			request.cardHolderPresentCode = 'Present';
			var config = {
				'url': refundUrl,
				'method': 'POST',
				'data': request
			};
			
			$http(config)
			.success(function(result) {
				if ( result._hasErrors ) {
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
					if ( result._hasErrors ) {
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
					if ( result._hasErrors ) {
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