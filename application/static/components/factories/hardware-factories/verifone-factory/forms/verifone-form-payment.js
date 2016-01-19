'use-strict'


angular.module('skyZoneApp')


.factory('VerifonePaymentForm',['VerifoneCommandFactory', function(VerifoneCommandFactory) {
	var fac = {}
	
	// RESPONDERS
	
	fac.acknowledgeResponse = function(response,acceptedResponse) {
			
		return new Promise(function(resolve,reject) {
				
			response = window.atob(response) 
			
			var r = VerifoneCommandFactory.stringToByteArray(response);
			console.log('[HWCOMM] - response:          ', VerifoneCommandFactory.readableString(r));
			console.log('[HWCOMM] - accepted response: ', acceptedResponse);
					
			if ( VerifoneCommandFactory.arraysEqual(acceptedResponse, r) ) {
				resolve([6]);
			} else {
				reject('response rejected');
			}
		});
	};
	
	fac.cardDataResponder = function(response,acceptedResponse) {
			
		return new Promise(function(resolve,reject) {
				
			response = window.atob(response);
			//console.log('atob response: ', response);
			var r = VerifoneCommandFactory.stringToByteArray(response);
			console.log('byte array response: ', r);
			console.log('[HWCOMM] - response:          ', VerifoneCommandFactory.readableString(r));
			console.log('[HWCOMM] - accepted response: ', acceptedResponse);
			
			var rawData = VerifoneCommandFactory.readableString(VerifoneCommandFactory.stripByteArray(r),false);
			if ( rawData.substring(0,3) == "81." ) {
				rawData = rawData.substring(3);
				var tracks = rawData.split('<FS>');
				console.log('[HWCOMM] TEMP - rawData: ', rawData);
				console.log('[HWCOMM] TEMP - track data array', tracks);
				fac.track1Data = tracks[0];
				fac.track2Data = tracks[1];
				console.log("[HWCOMM] - Card Magnetic Data Read");
				resolve([6]);
				return;
			}
			
			console.log('[HWCOMM] -- Error reading card data');
			reject('error reading card data'); 
			
		});
	};
	
	fac.paymendMethodResponder = function(response,acceptedResponse) {
		
		return new Promise(function(resolve,reject) {
			response = atob(response);
			
			var r = VerifoneCommandFactory.stringToByteArray(response);
			console.log('[HWCOMM] - response:          ', VerifoneCommandFactory.readableString(r));
			console.log('[HWCOMM] - accepted response: ', acceptedResponse);
			
			var rawData = VerifoneCommandFactory.readableString(VerifoneCommandFactory.stripByteArray(r),false);
			var dataArray = rawData.split('<FS>');
			if ( dataArray[0] = "XEVT" ) {
				var userResponse = dataArray[2];
				
				if ( userResponse == "3" ) {
					console.log('[HWCOMM] - user selected credit');
					fac.credit = true;
				} else if ( userResponse == "5" ) {
					console.log('[HWCOMM] - user selected debit');
					fac.debit = true;
				} else if ( userResponse == "7" ) {
					console.log('[HWCOMM] - user selected gift');
					fac.gift = true;
				} else { 
					console.log('[HWCOMM] - unknown user response');
					reject('unknown user response');
				}
				
				resolve([6]);
				return
			}
			
			reject('response not accepted');
		})
	} 
	
	fac.pinResponder = function(response,acceptedResponse) {
		
		return new Promise(function(resolve,reject) {
			response = atob(response);
			
			var r = VerifoneCommandFactory.stringToByteArray(response);
			console.log('[HWCOMM] - response:          ', VerifoneCommandFactory.readableString(r));
			console.log('[HWCOMM] - accepted response: ', acceptedResponse);
			
			var rawData = VerifoneCommandFactory.readableString(VerifoneCommandFactory.stripByteArray(r),false);
			if ( rawData.substring(0,3) == "73." ) {
				var data = rawData.substring(3);
				
				if ( data == "" || data == "<EOT>" ) {
					console.log('user rejected pin entry')
					fac.declined = true;
					resolve([6]);
				}
				
				fac.pinData = data;
				
				resolve([6]);
				return;
			}
			
			reject('response not accepted');
		});
	}
	
	fac.processPayment = function(response,acceptedResponse) {
		
		return new Promise(function(resolve,reject) {
			response = window.atob(response) 
			
			var r = VerifoneCommandFactory.stringToByteArray(response);
			console.log('[HWCOMM] - response:          ', VerifoneCommandFactory.readableString(r));
			console.log('[HWCOMM] - accepted response: ', acceptedResponse);
					
			if ( VerifoneCommandFactory.arraysEqual(acceptedResponse, r) ) {
				setTimeout(function() { resolve([6]) }, 5000);
			} else {
				reject('response rejected');
			}
		});
	}
	
	fac.orderTotal = "$101.99";
	
	fac.cardDataCollected = false;
	fac.track1Data = "";
	fac.track2Data = "";
	fac.pinData = "";
	fac.credit = false;
	fac.debit = false;
	fac.gift = false;
	
	fac.returnData = {}
	
	fac.reset = function() {
		fac.cardDataCollected = false;
		fac.track1Data = "";
		fac.track2Data = "";
		fac.pinData = "";
		fac.credit = false;
		fac.debit = false;
		fac.gift = false;
	
		fac.returnData = {}
	}
	
	fac.declined = false;
		
	 fac.process = function() {
		 return true
	 }
	
	// EVENTS
	
	fac.init = {
		command: function() { return VerifoneCommandFactory.initForm.request('payment-swipe-prompt'); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.initForm.response(),
		next: function() { return fac.updateTotal }
	}
	
	fac.updateTotal = {
		command: function() { return VerifoneCommandFactory.setFormParam.request('4', fac.orderTotal) },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		next: function() { return fac.showPaymentSwipeForm }
	}
	
	fac.showPaymentSwipeForm = {
		command: function() { return VerifoneCommandFactory.showForm.request(); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.showForm.response(),
		next: function() { return fac.requestCardData }
	}
	
	fac.requestCardData = {
			command: function() { return VerifoneCommandFactory.getCardData.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.getCardData.response(),
			next: function() { return fac.listenForCardData }
	};
	
	fac.listenForCardData = {
		command: function() { return null },
		responder: fac.cardDataResponder,
		acceptedResponse: '',
		listen: true,
		next: function() { return fac.initSelectionForm	}
	};
	
	fac.initSelectionForm = {
		command: function() { return VerifoneCommandFactory.initForm.request('payment-method-selection'); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.initForm.response(),
		next: function() { return fac.showSelectionForm }
	}
	
	fac.showSelectionForm = {
		command: function() { return VerifoneCommandFactory.showForm.request(); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.showForm.response(),
		next: function() { return fac.listenForUserPaymentMethodSelection }
	}
	
	fac.listenForUserPaymentMethodSelection = {
		command: function() { return null },
		responder: fac.paymendMethodResponder,
		acceptedResponse: '',
		listen: true,
		next: function() { 
			if ( fac.credit ) {
				return fac.initProcessingForm;
			} else if ( fac.debit ) {
				return fac.initPinCaptureForm;
			} else if ( fac.gift ) {
				return fac.initProcessingForm;
			} else {
				return fac.initCancelled;
			}
		}  
	}
	
	fac.initPinCaptureForm = {
		command: function() { 
			var cardNumber = fac.track2Data.split("=")[0];
			console.log('CARD NUMBER: ', cardNumber);
			return VerifoneCommandFactory.requestDebitPin.request(cardNumber); 
		},
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.requestDebitPin.response(),
		next: function() { return fac.listenForPin }
	}
	
	fac.listenForPin = {
		command: function() { return null },
		responder: fac.pinResponder,
		acceptedResponse: '',
		listen: true,
		next: function() { 
			if ( fac.declined ) {
				return fac.initCancelled;
			} else {
				return fac.initProcessingForm;
			}
		}
	}
	
	fac.initProcessingForm = {
		command: function() { return VerifoneCommandFactory.initForm.request('payment-processing') },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.initForm.response(),
		next: function() { return fac.setProcessingText }
	}
	
	fac.setProcessingText = {
		command: function() { return VerifoneCommandFactory.setFormParam.request('2', "Processing Payment...") },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		next: function() { return fac.showProcessingForm }
	}
	
	fac.showProcessingForm = {
		command: function() { return VerifoneCommandFactory.showForm.request(); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.showForm.response(),
		next: function() { 
			var paymentType = ''
			if ( fac.credit ) { paymentType = "Credit Card"; }
			else if ( fac.debit ) { paymentType = "Debit Card"; }
			else if ( fac.gift ) { paymentType = "Gift Card"; }
			else { 
				fac.returnData.success = false;
				return null 
			}
			 
			fac.returnData = {
				'track1Data':fac.track1Data,
				'track2Data':fac.track2Data,
				'pinData':fac.pinData,
				'paymentType':paymentType,
				'success':true
			}
			return null
		 }
	}
	
	
	// declined
	fac.initDeclined = {
		command: function() { return VerifoneCommandFactory.initForm.request('payment-processing') },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.initForm.response(),
		next: function() { 
			fac.returnData.success = false;
			return fac.setDeclinedText 
		}
	}
	
	fac.setDeclinedText = {
		command: function() { return VerifoneCommandFactory.setFormParam.request('2', "Payment Declined") },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		next: function() { return fac.showDeclinedForm }
	}
	
	fac.showDeclinedForm = {
		command: function() { return VerifoneCommandFactory.showForm.request(); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.showForm.response(),
		next: function() { 
			return fac.initIdle;
		 }
	}
	
	// cancel
	fac.initCancelled = {
		command: function() { return VerifoneCommandFactory.initForm.request('payment-processing') },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.initForm.response(),
		next: function() { return fac.setCancelText }
	}
	
	fac.setCancelText = {
		command: function() { return VerifoneCommandFactory.setFormParam.request('2', "Transaction Cancelled") },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		next: function() { return fac.showCancelledForm }
	}
	
	fac.showCancelledForm = {
		command: function() { return VerifoneCommandFactory.showForm.request(); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.showForm.response(),
		next: function() { 
			fac.returnData.success = false;
			return fac.initIdle;
		}
	}
	
	return fac;
}]);