'use-strict'


angular.module('skyZoneApp')


.factory('VerifoneIdleForm',['VerifoneCommandFactory', function(VerifoneCommandFactory) {
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
	
	// BATCHES
	
	fac.initAndShowIdleBatch = {
		request: function() {
			
		},
		response: function() {
			
		}
	}

	
	// EVENTS
	
	fac.init = {
		command: function() { return VerifoneCommandFactory.clearScreen.request() },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.clearScreen.response(),
		next: function() { return fac.clearScreen }
	}
	
	fac.clearScreen = {
		command: function() { return VerifoneCommandFactory.clearScreen.request() },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.clearScreen.response(),
		next: function() { return fac.initIdleForm }
	}
	
	fac.initIdleForm = {
		command: function() { return VerifoneCommandFactory.initForm.request('idle') },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.initForm.response(),
		next: function() { return fac.showIdle }
	}
	
	fac.showIdle = {
		command: function() { return VerifoneCommandFactory.showForm.request(); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.showForm.response(),
		next: function() { 
			return null;
		}
	}
	
	return fac;
}]);