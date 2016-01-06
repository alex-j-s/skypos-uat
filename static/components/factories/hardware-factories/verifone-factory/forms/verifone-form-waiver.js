'use-strict'


angular.module('skyZoneApp')


.factory('VerifoneWaiverForm',['$filter','VerifoneCommandFactory', function($filter,VerifoneCommandFactory) {
		var fac = {}
	
		fac.waiver = {};
		fac.customer = {};
		
		fac.accepted = true;
		
		fac.acknowledgeResponse = function(response,acceptedResponse) {
			
			return new Promise(function(resolve,reject) {
				
				response = window.atob(response) 
				
				var r = VerifoneCommandFactory.stringToByteArray(response);
				console.log('[HWCOMM] - response: ', VerifoneCommandFactory.readableString(r));
				console.log('[HWCOMM] - accepted response: ', acceptedResponse);
				
				if ( VerifoneCommandFactory.arraysEqual(acceptedResponse, r) || VerifoneCommandFactory.arraysEqual([6],r) ) {
					resolve([6]);
				} else {
					reject('response rejected');
				}
			});
		};
		
		fac.displayTextResponder = function(response,acceptedResponse) {
			return new Promise(function(resolve,reject) {
				
				response = window.atob(response) 
				
				var r = VerifoneCommandFactory.stringToByteArray(response);
				console.log('[HWCOMM] - response: ', VerifoneCommandFactory.readableString(r));
				console.log('[HWCOMM] - accepted response: ', VerifoneCommandFactory.addToTextBoxResponseCommand());
				
				if ( VerifoneCommandFactory.arraysEqual(r.slice(2,6),VerifoneCommandFactory.addToTextBoxResponseCommand()) || VerifoneCommandFactory.arraysEqual([6],r) ) {
					if ( r[0] === 6 ) {
						resolve([6])
					} else if ( r[7] === 49 ) {
						resolve([6]); 
					} else  {
						reject('response rejected');
					}
				} else {
					reject('response rejected');
				}
				
			});
		};
		
		fac.nullResponder = function(response,acceptedResponse) {
			return new Promise(function(resolve,reject) {
				
				response = window.atob(response) 
				
				var r = VerifoneCommandFactory.stringToByteArray(response);
				console.log('[HWCOMM] - response: ', VerifoneCommandFactory.readableString(r));
				console.log('[HWCOMM] - accepted response: ', acceptedResponse);
				
				if ( VerifoneCommandFactory.arraysEqual(acceptedResponse, r) ) {
					resolve(null);
				} else {
					reject('response rejected');
				}
			});
		}
		
		fac.listenForUserResponse = function(response,acceptedResponse) {
			
			return new Promise(function(resolve,reject) {
												
				response = window.atob(response) 
				
				var r = VerifoneCommandFactory.stringToByteArray(response);
				console.log('[HWCOMM] - response: ', VerifoneCommandFactory.readableString(r));
				
				if ( VerifoneCommandFactory.arraysEqual(r.slice(1,5),VerifoneCommandFactory.userResponseCommand()) ) {
					if ( r[8] === 50 ) { // ascii 2
						console.log('[HWCOMM] - user declined');
						fac.accepted = false;
						resolve([6])
					} else if ( r[8] === 49 ) { // ascii 1
						console.log('[HWCOMM] - user accepted');
						resolve([6]);
					} else {
						console.log('[HWCOMM] - unknown user response');
						reject('response rejected');
						resolve([6]);
					}
				} else {
					reject('response rejected')
				}
				
				
			});
		}
		
		fac.sigCapResponder = function(response,acceptedResponse) {
			
			return new Promise(function(resolve,reject) {
				
				response = window.atob(response) 
				
				var r = VerifoneCommandFactory.stringToByteArray(response);
				console.log('[HWCOMM] - responseCAP: ', VerifoneCommandFactory.readableString(r));
				
				console.log('[HWCOMM] - COLLECTING SIG METADATA')
				if ( VerifoneCommandFactory.arraysEqual(r.slice(1,4),VerifoneCommandFactory.sigCapMetaCommand()) ) {
					console.log('[HWCOMM] - totally sig meta data, bro!');	
					
					var totalSize = parseInt(response.slice(4,9));
					console.log('[HWCOMM] - TOTAL SIG DATA SIZE : ', totalSize);
					var packetSize = parseInt(response.slice(9,13));
					console.log('[HWCOMM] - PACKET SIZE         : ', packetSize);
					var numOfPackets = Math.ceil((totalSize / packetSize));
					fac.numOfPackets = numOfPackets;
					console.log('[HWCOMM] - NUMBER OF PACKETS   : ', numOfPackets);

					if ( totalSize === 0 ) {
						fac.accepted = false;
					}
					
				} else {
					console.log('[HWCOM] - unfortunatly not sig meta, bro.')
					fac.accepted = false;
				}
				
				resolve([6]);
			});
		}
		
		fac.sigCapDataResponder = function(response,acceptedResponse) {
			
			return new Promise(function(resolve,reject) {
				var encodedResponse = response;
				response = window.atob(response)
				
				console.log("[HWCOMM] - base64 decoded response raw: ", response);
				console.log("[HWCOMM] - base64 decoded response data: ", response.slice(9,response.length - 2));
				fac.signatureData += response.slice(9,response.length - 2);
				
				// console.log("sliced decoded response: ", response.slice(9));
				// console.log("decoded string as byte array: ", VerifoneCommandFactory.stringToByteArray(response));
				
				var r = VerifoneCommandFactory.stringToByteArray(response);
				
				//console.log('ascii response: ', VerifoneCommandFactory.readableString(r));
				
				
				while ( r[0] != 2 ) {
					r.splice(0,1);
					response = response.slice(1);
				}
				
				//console.log('[HWCOMM] - response (byte array): ', r);
				
				var packetMetadata = r.slice(1,9);
				var packetData = r.slice(9,r.length - 2);
				
				console.log('[HWCOMM] - sigcap metadata: ', VerifoneCommandFactory.readableString(packetMetadata,false));
				//console.log('[HWCOMM] - sigcap data    : ', VerifoneCommandFactory.readableString(packetData,false));
				
				
				
				if ( r[4] == 78 ) {
					fac.signatureCaptured = true;
				}
				
				// if ( VerifoneCommandFactory.arraysEqual(r.slice(1,4), VerifoneCommandFactory.sigPacketCommand()) ) {
				// 	console.log('[HWCOM] - packet number', (fac.packetNumber + 1));
					
				// 	var lastPacketString = response.slice(4,5)
				// 	if ( lastPacketString == "N" ) {
				// 		fac.signatureCaptured = true
				// 	} 
				// 	console.log('[HWCOM] - LAST PACKET : ', fac.signatureCaptured);
				// 	var packetSize = parseInt(response.slice(5,10));
				// 	console.log('[HWCOM] - PACKET SIZE : ', packetSize)
					
				// 	console.log('decoded (data only): ', window.btoa(response));
					
				// 	fac.signatureData += response.slice(9)
					
				// 	fac.packetNumber += 1;
				// } else {
				// 	console.log('[HWCOM] - ERR: sig data command not regconized');
				// }
				
				resolve([6]);
			});
		}
	
		
		fac.currentIndex = 1;
		fac.minorIndex = 0;
		fac.legalPageIndex = 0;
		
		fac.signatureCaptured = false;
		fac.signatureData = [];
		fac.numOfPackets = 0;
		fac.packetNumber = 0;
		
		fac.returnData = {};
		
		fac.reset = function() {
			fac.returnData = {};
			fac.returnData.success = false;
			fac.currentIndex = 1;
			fac.minorIndex = 0;
			fac.legalPageIndex = 0;
			fac.accepted = true;
		
			
			fac.signatureCaptured = false;
			fac.signatureData = "";
			fac.numOfPackets = 0;
			fac.packetNumber = 0;
		}
		
		fac.runForm = function() {
			fac[currentIndex]
		};
		
		
		// Command Flow
		
		// ACCEPTED WAIVER -- END OF FORM
		fac.initAccept = {
			command: function() { return VerifoneCommandFactory.initForm.request('waiver-complete') },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.initForm.response(),
			next: function() { return fac.showWaiverAcceptForm; }
		};
		
		fac.showWaiverAcceptForm = {
			command: function() { return VerifoneCommandFactory.showForm.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.showForm.response(),
			next: function() { 
				fac.returnData.success = true;
				return null 
			}
		};
		
		// END ACCEPTED WAIVER -- END OF FORM
		
		// DECLINED WAIVER		
		fac.initDecline = {
			command: function() { return VerifoneCommandFactory.initForm.request('waiver-cancel') },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.initForm.response(),
			next: function() { 
				return fac.showWaiverDeclinedForm; 
			}
		};
		
		fac.showWaiverDeclinedForm = {
			command: function() { return VerifoneCommandFactory.showForm.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.showForm.response(),
			next: function() {
				fac.returnData.success = false; 
				return null 
			}
		};
		
		// END DECLINED WAIVER
		
		// SIGNATURE
		
		// fac.initSignature = {
		// 	command: function() { return VerifoneCommandFactory.initForm.request('waiver-title') },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.initForm.response(),
		// 	next: function() { return fac.setSigTextTitle }
		// }
		
		// fac.setSigTextTitle = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('10', "[TEST] Torrance Waiver") },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setSignText }
		// }
		
		// fac.setSignText = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('1', "Sign") },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setSignaturePage }
		// }
		
		// fac.setSignaturePage = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('11', "Page " + (fac.waiver.legalDocumentItems.length + 1) + " of " + (fac.waiver.legalDocumentItems.length + 1)) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.showSignatureForm }
		// }
		
		// fac.showSignatureForm = {
		// 	command: function() { return VerifoneCommandFactory.showForm.request() },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.showForm.response(),
		// 	next: function() { return fac.displaySignatureText }
		// }
		
		// fac.displaySignatureText = {
		// 	command: function() { return VerifoneCommandFactory.displayText.request(fac.waiver.legalDocumentItems[fac.waiver.legalDocumentItems.length - 1].content,'5','40','350','795','53249','16','Proxima-Nova-Regular|Proxima-Nova-Semibold|VeraMoIt|VeraMoBI','FFFFFF|FFFFFF|FFFFFF') },
		// 	responder: fac.displayTextResponder,
		// 	acceptedResponse: VerifoneCommandFactory.displayText.response(),
		// 	next: function() { return fac.listenForSignAcceptance }
		// }
		
		// fac.listenForSignAcceptance = {
		// 	command: function() { return null },
		// 	responder: fac.listenForUserResponse,
		// 	acceptedResponse: '',
		// 	listen: true,
		// 	next: function() { 
		// 		if ( !fac.accepted ) { return fac.initDecline; }
				
		// 		return fac.initSigForm;
		// 	}
		// }
		
		fac.initSigForm = {
			command: function() { return VerifoneCommandFactory.initForm.request('waiver-signature-page') },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.initForm.response(),
			next: function() { return fac.setSigTitle }
		}
		
		fac.setSigTitle = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('10', "[TEST] Torrance Waiver") },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setSignPageNumber }
		}
		
		fac.setSignPageNumber = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('11', "Page " + (fac.waiver.legalDocumentItems.length) + " of " + (fac.waiver.legalDocumentItems.length)) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setSignatureLocation }
		}
		
		fac.setSignatureLocation = {
			command: function() { return VerifoneCommandFactory.setupSignatureBox.request('005','250','790','350') },
			responder: fac.nullResponder,
			acceptedResponse: VerifoneCommandFactory.setupSignatureBox.response(),
			next: function() { return fac.showSigForm }
		}
		
		fac.showSigForm = {
			command: function() { return VerifoneCommandFactory.showForm.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.showForm.response(),
			next: function() { return fac.displaySignText }
		}
		
		// fac.displaySignText = {
		// 	command: function() { return VerifoneCommandFactory.displayText.request(fac.waiver.legalDocumentItems[fac.legalPageIndex].content,'5','40','350','795','53249','16','Proxima-Nova-Regular|Proxima-Nova-Semibold|VeraMoIt|VeraMoBI','FFFFFF|FFFFFF|FFFFFF') },
		// 	responder: fac.displayTextResponder,
		// 	acceptedResponse: VerifoneCommandFactory.displayText.response(),
		// 	next: function() { return fac.displaySignatureCapture }
		// }
		
		fac.displaySignText = {
			command: function() { return VerifoneCommandFactory.addTextBoxText.request('12',fac.waiver.legalDocumentItems[fac.legalPageIndex].content) },
			responder: fac.displayTextResponder,
			acceptedResponse: VerifoneCommandFactory.addTextBoxText.response(),
			next: function() { return fac.displaySignatureCapture }
		}
		
		
		fac.displaySignatureCapture = {
			command: function() { return VerifoneCommandFactory.captureSignatureData.request() },
			responder: fac.nullResponder,
			acceptedResponse: VerifoneCommandFactory.captureSignatureData.response(),
			next: function() { return fac.listenForSignatureCapture }
		}
		
		fac.listenForSignatureCapture = {
			command: function() { return null },
			responder: fac.sigCapResponder,
			acceptedResponse: '',
			listen: true,
			shouldRespond:true,
			next: function() { 

				if ( !fac.accepted ) {
					return fac.initDecline;
				}

				return fac.collectSignatureData 
			}
		}
		
		fac.collectSignatureData = {
			command: function() { return null },
			responder: fac.sigCapDataResponder,
			acceptedResponder: '',
			listen: false,
			shouldRespond:true,
			next: function() {
				if (fac.signatureCaptured) {
					//fac.signatureData = fac.signatureData.split(',').join('');
					console.log('SIG DATA: ', fac.signatureData);
					console.log('SIG DATA BASE 64', btoa(fac.signatureData));
					console.log('SIG DATA LENGTH: ', fac.signatureData.length);
					console.log('SIG BYTE ARRAY: ', VerifoneCommandFactory.stringToByteArray(fac.signatureData));
					// var link = document.createElement('a');
					// link.download = 'data.bmp';
					var signature = btoa(fac.signatureData);
					fac.returnData.signature = signature;
					// link.href = "data:image/bmp;base64," + btoa(fac.signatureData);
					// link.click();			
							
					return fac.initAccept;
				}
				return fac.collectSignatureData;
			}
		}
		
		// END SIGNATURE
		
		// LEGAL DOC
		
		fac.initLegalDocForm = {
			command: function() { return VerifoneCommandFactory.initForm.request('waiver-title') },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.initForm.response(),
			next: function() { return fac.setLegalDocTitle }	
		};
		
		fac.setLegalDocTitle = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('10', "[TEST] Torrance Waiver") },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setLegalDocPageNumber }
		};
		
		fac.setLegalDocPageNumber = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('11',"Page " + ( fac.legalPageIndex + 1 ) + " of " + (fac.waiver.legalDocumentItems.length)) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.displayLegalDocText }
		}
		
		// fac.displayLegalDocText = {
		// 	command: function() { return VerifoneCommandFactory.displayText.request(fac.waiver.legalDocumentItems[fac.legalPageIndex].content,'5','40','350','795','53249','16','Proxima-Nova-Regular|Proxima-Nova-Semibold|VeraMoIt|VeraMoBI','FFFFFF|FFFFFF|FFFFFF') },
		// 	responder: fac.displayTextResponder,
		// 	acceptedResponse: VerifoneCommandFactory.displayText.response(),
		// 	next: function() { return fac.showLegalDocForm }
		// }
		
		fac.displayLegalDocText = {
			command: function() { return VerifoneCommandFactory.addTextBoxText.request('12',fac.waiver.legalDocumentItems[fac.legalPageIndex].content) },
			responder: fac.displayTextResponder,
			acceptedResponse: VerifoneCommandFactory.addTextBoxText.response(),
			next: function() { return fac.showLegalDocForm }
		}
		
		fac.showLegalDocForm = {
			command: function() { return VerifoneCommandFactory.showForm.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.showForm.response(),
			next: function() { return fac.listenForLegalDocResonse }
		}
		
		
		
		fac.listenForLegalDocResonse = {
			command: function() { return null },
			responder: fac.listenForUserResponse,
			acceptedResponse: '',
			listen: true,
			next: function() { 
				if ( !fac.accepted ) { return fac.initDecline; }
				
				fac.legalPageIndex += 1;
				
			 	if ( fac.legalPageIndex > (fac.waiver.legalDocumentItems.length - 2) ) {
					 return fac.initSigForm;
				 } else {
					 return fac.initLegalDocForm;
				 }
			}
		}
		
		// END LEGAL DOC
		
		// MINOR CONFIRMATION
		
		fac.initMinorForm = {
			command: function() { return VerifoneCommandFactory.initForm.request('waiver-minor-info-conf') },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.initForm.response(),
			next: function() { return fac.setMinorName }
		};
		
		fac.setMinorName = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('10',fac.customer.minors[fac.minorIndex].firstName + " " + fac.customer.minors[fac.minorIndex].lastName) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setMinorBirthdate }
		};
		
		fac.setMinorBirthdate = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('12',$filter('date')(fac.customer.minors[fac.minorIndex].birthday,'mediumDate')) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setMinorPageNumber }
		};
		
		fac.setMinorPageNumber = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('16',"Minor " + ( fac.minorIndex + 1 ) + " of " + fac.customer.minors.length) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.showMinorForm }
		}
		
		fac.showMinorForm = {
			command: function() { return VerifoneCommandFactory.showForm.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.showForm.response(),
			next: function() { return fac.listenForMinorConfResponse }
		};
		
		fac.listenForMinorConfResponse = {
			command: function() { return null },
			responder: fac.listenForUserResponse,
			acceptedResponse: '',
			listen: true,
			next: function() { 
				if ( !fac.accepted ) { return fac.initDecline; }
				
				fac.minorIndex += 1;
				
			 	if ( fac.minorIndex > (fac.customer.minors.length - 1) ) {
					 return fac.initLegalDocForm;
				 } else {
					 return fac.initMinorForm;
				 }
			}
		};
		
		// END MINOR CONFIRMATION
		
		fac.listenForPersonalConfResponse = {
			command: function() { return null },
			responder: fac.listenForUserResponse,
			acceptedResponse: '',
			listen: true,
			next: function() { 
				if ( fac.accepted )  {
					if ( fac.customer.minors.length > 0 ) {
						return fac.initMinorForm
					} else {
						return fac.initLegalDocForm
					}
				} 
				return fac.initDecline;
			}	
		};
	
		
		fac.showForm = {
			command: function() { return VerifoneCommandFactory.showForm.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.showForm.response(),
			next: function() { return fac.listenForPersonalConfResponse }
		};
		
		
		// fac.setUserPhone = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('26',fac.customer.mobilePhoneNumber) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setUserEmail }
		// };
		
		// fac.setUserPostalCode = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('24',fac.customer.personmailingpostalcode) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setUserPhone }
		// };
		
		// fac.setUserState = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('22',fac.customer.personmailingstate) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setUserPostalCode }
		// };
		
		// fac.setUserCity = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('20',fac.customer.personmailingcity) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setUserState }
		// };
		
		// fac.setUserCountry = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('18',fac.customer.personmailingcountrycode) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setUserCity }
		// };
		
		// fac.setUserStreet2 = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('16',fac.customer.personmailingstreet2) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setUserCountry }
		// };
		
		// fac.setUserStreet1 = {
		// 	command: function() { return VerifoneCommandFactory.setFormParam.request('14',fac.customer.personmailingstreet) },
		// 	responder: fac.acknowledgeResponse,
		// 	acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
		// 	next: function() { return fac.setUserStreet2 }
		// };
		
		fac.setUserGender = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('16',fac.customer.gender) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.showForm }
		};
		
		fac.setUserEmail = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('14',fac.customer.email) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setUserGender }
		};
		
		fac.setUserBirthdate = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('12',$filter('date')(fac.customer.birthday,'mediumDate')) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setUserEmail }
		};
		
		fac.setUserName = {
			command: function() { return VerifoneCommandFactory.setFormParam.request('10',fac.customer.firstName + " " + fac.customer.lastName) },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.setFormParam.response(),
			next: function() { return fac.setUserBirthdate } 
		};
		
		
		fac.initPersonalInfoForm = { 
			command: function() { return VerifoneCommandFactory.initForm.request('waiver-personal-info-conf') },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.initForm.response(),
			next: function() { return fac.setUserName }
		};
		
		fac.init = {
			command: function() { return VerifoneCommandFactory.clearScreen.request() },
			responder: fac.acknowledgeResponse,
			acceptedResponse: VerifoneCommandFactory.clearScreen.response(),
			next: function() { return fac.setSignatureSettings }
		};
		
		fac.setSignatureSettings = {
			command: function() { return VerifoneCommandFactory.setSignatureSettings.request('045','008','1','000','06','0') },
			responder: fac.nullResponder,
			acceptedResponse: VerifoneCommandFactory.setSignatureSettings.response(),
			next: function() { return fac.initPersonalInfoForm }		
		}

	return fac;
}]);
