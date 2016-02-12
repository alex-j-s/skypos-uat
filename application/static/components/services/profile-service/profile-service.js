'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.account:ProfileService
 * @description
 * # ProfileService
 * Service of the skyZoneApp
 */

angular.module('skyZoneApp')
  .service('ProfileService', ['$http', '$rootScope','PromiseFactory', function($http, $rootScope, PromiseFactory) {
    var self = this;
    self.customer = {};

    self.getCurrentCustomer = function(){
      return $rootScope.guest;
    };

    self.setCurrentCustomer = function(c){
      $rootScope.guest = c;
    }

    self.getCustomerInformation = function(id) {
      return $http.get('/api/customers/'+id)
        .success(function(data){
          data.isMinor = self.isMinor(data);
          $rootScope.guest = data;
        });
    };

    self.getProfile = function(id) {
      var def = PromiseFactory.getInstance();

      console.log('Requesting profile for: '+ id);

      $http.get('/api/customers/'+id).then(function(profile){
        def.resolve(profile);
      }, function(err){
        def.reject(err);
      });

      return def.promise;
    }

    self.customerSearch = function(kvps){

      var qs = '';

      angular.forEach(kvps, function(value, key){
        qs += '&'+key+'='+value;
        
      })

      if(qs.length > 0){
        qs = '?' + qs.substr(1);
      }

      return $http.get('/api/customers'+qs);
    };

    self.updateCustomerInformation = function(id, profile) {
      // profile.id = id;
      var req = {
        'firstName': profile.firstName,
        'lastName': profile.lastName,
        'birthday': profile.birthday, // yyyy-MM-dd
        'email': profile.email,
        'phoneNumber': profile.phoneNumber,
        'mobilePhoneNumber': profile.mobilePhoneNumber,
        'gender': profile.gender,
        'personmailingstreet':profile.personmailingstreet,
        'personmailingcity':profile.personmailingcity,
        'personmailingstatecode':profile.personmailingstatecode,
        'personmailingcountrycode':profile.personmailingcountrycode,
        'personmailingpostalcode':profile.personmailingpostalcode,
        'emergencyContactName':profile.emergencyContactName,
        'emergencyContactNumber':profile.emergencyContactNumber,
        'skybandId':profile.skybandId
      };
      return $http.put('/api/customers/'+id, req)
        .success(function(data) {
          data.isMinor = self.isMinor(data);
        });
    };

    self.isMinor = function(profile) {
      var ageDifMs = Date.now() - Date.parse(profile.birthday);
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      var age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age < 18;
    };

    self.getCustomerDependents = function(userId) {
      return $http.get('/api/customers/'+userId+'/dependents');
    };

    self.getCustomerGuardians = function(userId) {
      return $http.get('/api/customers/'+userId+'/guardians');
    };

  }]);
