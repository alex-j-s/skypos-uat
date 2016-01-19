'use-strict'


angular.module('skyZoneApp')


.factory('VerifonePaymentCompleteForm',['VerifoneCommandFactory', function(VerifoneCommandFactory) {
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
	
	fac.text = "";
	fac.returnData = {
		'success':false
	}
	
	//FORM
	fac.init = {
		command: function() { return VerifoneCommandFactory.initForm.request('payment-processing') },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.initForm.response(),
		next: function() { return fac.setCompleteText }
	}

	fac.setCompleteText = {
		command: function() { return VerifoneCommandFactory.setFormParam.request('2', fac.text) },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		next: function() { return fac.showCompleteForm }
	}
	
	fac.showCompleteForm = {
		command: function() { return VerifoneCommandFactory.showForm.request(); },
		responder: fac.acknowledgeResponse,
		acceptedResponse: VerifoneCommandFactory.showForm.response(),
		next: function() { return fac.initIdle }
	}
	
	fac.initIdle = {
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
			
			fac.returnData.success = true;
			
			return null 
		}
	};
	
	return fac;

}]);
	