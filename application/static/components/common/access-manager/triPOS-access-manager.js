'use strict'

angular.module('skyZoneApp')
	.constant('TRIPOS_ENDPOINTS', {
		'dev':'http://localhost:8080'
	})
	.constant('TRIPOS_DEV_TOKENS', {
		'DEV-KEY-1':'1ea5d25f-e334-44f7-aea3-f4e180a9bff2',
		'DEV-KEY-2':'16b6148c-e19e-4f4a-9f31-27f93e535c9c',
		'DEV-SECRET-1':'31d58d53-9968-4ee9-9ca5-6ce420256129',
		'DEV-SECRET-2':'ac131ecb-b7d8-4a36-b8be-8614f0bd0d8b'
	})
	.constant('TRIPOS_HEADERS', {
		'tp-application-name':'SKYPOS',
		'tp-application-version':'1.0.0',
		'tp-application-id':'6383',
		'tp-return-logs':false,
		'Accept':'application/json'
	})
	.factory('triPOSAuthInterceptor', ['$q', 'HmacService', 'ENV', 'TRIPOS_HEADERS', 'TRIPOS_DEV_TOKENS', 'TRIPOS_ENDPOINTS', 
		function($q, HmacService, ENV, TRIPOS_HEADERS, TRIPOS_DEV_TOKENS, TRIPOS_ENDPOINTS) {
			
			return {
				request: function(config) {
					if ( config.url.indexOf('/tripos/') !== -1 ) {
						console.log('in tri pos acess manager');
						config.url = config.url.replace('/tripos/','/api/v1/');
						config.url = TRIPOS_ENDPOINTS[ENV] + config.url;
						config.headers = config.headers || {};

						// header constants
						config.headers['tp-application-name']    = TRIPOS_HEADERS['tp-application-name'];
						config.headers['tp-application-version'] = TRIPOS_HEADERS['tp-application-version'];
						config.headers['tp-application-id']      = TRIPOS_HEADERS['tp-application-id'];
						config.headers['tp-return-logs']         = TRIPOS_HEADERS['tp-return-logs'];
						config.headers['Content-Type']           = 'application/json';
						config.headers['Accept']                 = 'application/json';

						// tp-authorization ( following triPOS documentation steps )

						// 1.) select a HMAC algorithim
						var hmacAlgorithm = 'TP-HMAC-SHA256'; // sha256

						// 2.) Collect the request method & url
						var method = config.method;
						var url = config.url.replace(TRIPOS_ENDPOINTS[ENV], '');

						// 3.) calculate request body hash
						var requestBodyHash;
						if ( config.body ) {
							requestBodyHash = HmacService.getTriPOSHmac(config.body);
						}

						// 4.) generate the canonical signed headers
						var canonicalHeadersArray = [];
						angular.forEach(Object.keys(config.headers), function(header) {
							if ( header.indexOf('tp-') === -1 ) {
								canonicalHeadersArray.push(header);
							}
						});

						var signedHeaders = '';
						canonicalHeadersArray = canonicalHeadersArray.sort();
						angular.forEach(canonicalHeadersArray, function(header) {
							signedHeaders = signedHeaders + ';' + header; 
						});
						signedHeaders = signedHeaders.slice(1); // remove preceeding semi-colon

						// 5.) generate the caonical headers
						var canonicalHeadersStr = '';
						angular.forEach(canonicalHeadersArray, function(header) {
							canonicalHeadersStr = canonicalHeadersArray + header + ':' + config.headers[header] + '\n'
						});

						// 6.) Generate the canonical URI
						var canonicalURI = config.url.split('?')[0].replace(TRIPOS_ENDPOINTS[ENV], '');

						// 7.) Generate the canonical query string
						var canonicalQueryStr = config.url.split('?')[1];

						// 8.) Generate the canonical request
						var canonicalRequest = method + '\n';
						canonicalRequest += canonicalURI + '\n';
						canonicalRequest += canonicalQueryStr + '\n';
						canonicalRequest += canonicalHeadersStr + '\n';
						canonicalRequest += signedHeaders + '\n';
						if ( requestBodyHash ) { canonicalRequest += requestBodyHash; }
						

						// 9.) Generate the canonical request hash
						var requestHash = HmacService.getTriPOSHmac(canonicalRequest);

						// 10.) Generate the key signature hash
						var timestamp = new Date().toISOString();
						var signatureHash = HmacService.getTriPOSHmac(requestHash+TRIPOS_DEV_TOKENS['DEV-SECRET-1'],timestamp);

						// 11.) Generate the un-hashed signature
						var unhashedSignature = hmacAlgorithm + '\n';
						unhashedSignature += timestamp + '\n';
						unhashedSignature += TRIPOS_DEV_TOKENS['DEV-KEY-1'] + '\n';
						unhashedSignature += requestHash;

						// 12.) Generate the signature
						var signature = HmacService.getTriPOSHmac(unhashedSignature,signatureHash);

						// 13.) Generate the authorization signature header
						var tpAuthHeader = 'Version=1.0, ';
						tpAuthHeader += 'Algorithm=' + hmacAlgorithm + ', ';
						tpAuthHeader += 'Credential=' + TRIPOS_DEV_TOKENS['DEV-KEY-1'] + ', ';
						tpAuthHeader += 'SignedHeaders=' + signedHeaders + ', ';
						tpAuthHeader += 'Nonce=' + requestHash + ', ';
						tpAuthHeader += 'RequestDate=' + timestamp + ', ';
						tpAuthHeader += 'Signature=' + signature;
						//config.headers['tp-authorization'] = tpAuthHeader;
						console.log('tp-authorization: ', config.headers['tp-authorization']);
						config.headers['tp-authorization'] = 'Version=1.0, Credential=1ea5d25f-e334-44f7-aea3-f4e180a9bff2';

						config.headers['tp-request-id'] = HmacService.generateUUID();

						console.log('CONFIG FROM TRIPOS: ', config);
					}
					return config;
				}
			}
		}]);