'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services.hmac-service:HmacService
 * @description
 * # HmacService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
    .factory('EndpointType', function(){

      var PUBLIC_ENDPOINTS = [
        // '/events',
        '/reference',
        '/documents',
        // '/waivers',
        // '/customers'
      ];

      return {
        isPublic: function(uri){
          var pub = false;
          angular.forEach(PUBLIC_ENDPOINTS, function(slug){
            if(uri.indexOf(slug) > -1){
              pub = true;
            }
          })
          return pub;
        }
      }
    })
    

.service('HmacService', ['StorageService', 'EndpointType', 'ENV', 'API_ENDPOINTS', function(StorageService, EndpointType, ENV, API_ENDPOINTS) {
    var self = this;

    var secretKeys = {
        'pos_sys': 'CSHHIrq63PMeow8EaF1kC48w5mgs8ESiyT74Mw8N6J2Jj8PYqec3xy1ZwcYjOBH',
        'pos_user': 'PfmiJs44uxPoT7xDsoHZV28AFSQrJ4FnRZRKUEM2Y2fE9hzzIFlYFukHYcSHZ8C',
        'pos_mgr': 'vm8OZ5ahZjEakOJWg73Et9v3Z27L0gxTpw5UWFlWn9sjMeCn1CiJvcJnuWw0ajc',
        'public': 'f3bPSp084tTet4ApWoQ0qauSEhrDh1xfcubFrUXzVsKn4vq54xvTH5Kk2NY4SUt'
    };
    var secretKey = 'CSHHIrq63PMeow8EaF1kC48w5mgs8ESiyT74Mw8N6J2Jj8PYqec3xy1ZwcYjOBH';
    // var secretKey = 'f3bPSp084tTet4ApWoQ0qauSEhrDh1xfcubFrUXzVsKn4vq54xvTH5Kk2NY4SUt';
    var baseEndpointURL = API_ENDPOINTS[ENV];

    self.getHmacFromRequest = function(requestConfig) {
      var role = StorageService.handleGet('role');
      console.log(role);
      role = (role && (requestConfig.url.indexOf('tokens') < 0 || requestConfig.url.indexOf('tokens/current-user') > 0))? role:'pos_sys';
      role = EndpointType.isPublic(requestConfig.url)? 'public': role;
      //var baseEndpointURL = 'http://Localhost:5000';
      console.log('secret key: '+secretKey);
      console.log('role: '+role);
      // remove /api from uri for HMAC
      var uri = requestConfig.url.replace('/api','');
      uri = uri.replace(baseEndpointURL,'');
      var contentTypeHeaderValue = (requestConfig.headers['Content-Type']) ? requestConfig.headers['Content-Type'] : '';
      var dateHeaderValue = requestConfig.headers['X-Date'];
      var contentMD5 = (requestConfig.headers['Content-MD5']) ? requestConfig.headers['Content-MD5'] : '';
      var apiToken = requestConfig.headers['X-ApiKey'];

      if(apiToken === '51caeb84-3d49-4d16-ba10-37d54b16-4022d3a73499'){
        role = 'pos_sys';
      }
      secretKey = secretKeys[role];

      var requestStr = self.getRequestString( requestConfig.method.toUpperCase(), uri, contentTypeHeaderValue, dateHeaderValue, contentMD5, apiToken);
      return self.getHmacB64(requestStr);
    };

    self.getRequestString = function( method, uri, contentType, date, contentMD5, apiToken) {

      console.log('@@@ Method : '+method);
      console.log('@@@ uri : '+uri);
      console.log('@@@ contentType : '+contentType);
      console.log('@@@ date : '+date);
      console.log('@@@ contentMD5 : '+contentMD5);
      console.log('@@@ apiToken : '+apiToken);


      return method + uri + contentType + date + contentMD5 + apiToken;
    };

    self.getHmacB64 = function(str) {
      var hmac = CryptoJS.HmacSHA512(str, secretKey);
      var hmac64 = CryptoJS.enc.Base64.stringify(hmac);
      return hmac64;
    };

    self.getTriPOSHmac = function(str,key) {
      var utf8encodedStr = unescape(encodeURIComponent(str));
      var hmac;
      if ( key ) {
        var utf8encodedKey = unescape(encodeURIComponent(key));
        hmac = CryptoJS.HmacSHA256(utf8encodedStr,utf8encodedKey);
      } else {
        hmac = CryptoJS.HmacSHA256(utf8encodedStr,''); // no key
      }
      var hmacHEX = CryptoJS.enc.Hex.stringify(hmac);
      return hmacHEX;
    }

    self.getTriPOSHmacWithKey = function(str) {
      var utf8encodedStr = unescape(encodeURIComponent(str));
      var date = new Date();
      var timestamp = date.toISOString();
      var hmac = Crypto
    }

    self.generateUUID = function(){
      var d = new Date().getTime();
      if(window.performance && typeof window.performance.now === "function"){
          d += performance.now(); //use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }

  }]);
