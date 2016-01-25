'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.waiver:WaiverService
 * @description
 * # WaiverService
 * Service of the skyZoneApp
 *
 */

angular.module('skyZoneApp')
.service('WaiverStatus', function(){
  
  var waiverStatus = {};
  var num = {
    unsigned:0,
    pending:0
  }

  function calcStatusCounts(){
    num.unsigned = 0;
    num.pending = 0;

    angular.forEach(waiverStatus, function(status, key){
      if(status == 'No Waiver' || status == 'Expired'){
        num.unsigned++;
      }
      if(status == 'Pending'){
        num.pending++;
      }
    })

  }

  return {
    reset: function(){
      waiverStatus = {};
      num = {
        unsigned:0,
        pending:0
      };
    },
    setStatusFromWaiver: function(id, waiver) {
      var expirationDate = new Date();
      var status = null;
      var expirationDateStringArray = waiver.expirationDate.split('-');
      expirationDate.setFullYear(expirationDateStringArray[0]);
      expirationDate.setMonth(expirationDateStringArray[1]);
      expirationDate.setDate(expirationDateStringArray[2]);
      var now = new Date();
      if (now > expirationDate) {
          status = 'Expired';
      } else if (waiver.approved) {
          status = 'Pending';
      } else if (waiver.approved) {
          status = 'Approved';
      } else {
          status = null;
      }

      waiverStatus['_'+id+'_'] = status;
      calcStatusCounts();
    },
    setStatus: function(id, status){


      waiverStatus['_'+id+'_'] = status;

      calcStatusCounts();
    },
    getStatus: function(id){
      if(id){
        return waiverStatus['_'+id+'_']
      }else{
        return waiverStatus;
      }
    },
    numUnsigned: function(){
      return num.unsigned;
    },
    numPending: function(){
      return num.pending;
    },
    allSigned: function(){
      return ((num.pending + num.unsigned) === 0)
    }
  }
})
  .service('WaiverService', ['$http', function($http) {
    var self = this;

    function Adult(a, sig){
      return {
        'id':a.id,
        'firstName': a.firstName,
        'lastName': a.lastName,
        'birthday': a.birthday, // yyyy-MM-dd
        'email': a.email,
        'phoneNumber': a.phoneNumber,
        'gender': a.gender,
        'signature':sig,
        'personmailingcity':a.personmailingcity,
        'personmailingstatecode':a.personmailingstatecode,
        'personmailingcountrycode':a.personmailingcountrycode,
        'personmailingpostalcode':a.personmailingpostalcode
      };
    }

    function Minor(m){
      return {
        'id':(m.id)?m.id:null,
        'firstName': m.firstName,
        'lastName': m.lastName,
        'birthday': m.birthday, // yyyy-MM-dd
        'gender': m.gender,
        'email': (m.email)? m.email: null
      };
    }

    self.getWaiversByCustomerId = function(id, parkId, currentOnly) {
      var params = {};
      if(parkId) {
        params.parkId = parkId;
      }
      if(currentOnly) {
        params.currentOnly = currentOnly;
      }

      return $http.get('/api/customers/'+id+'/waivers', {'params': params});
    };

    self.getParkWaiverContent = function(parkId) {
      var type = 'Waiver Template';
      var language = 'English';

      return $http.get('/api/parks/'+parkId+'/documents?activeOnly=true');
    };

    self.createWaiver = function(legalDocumentId, parkId, adults, minors, agreement) {

      console.log(agreement);
      
      var waiverObj = {
        'legalDocumentId': legalDocumentId,
        'parkId': parkId,
        'adults': [],
        'minors': []
      };

      angular.forEach(adults, function(ad){
        waiverObj.adults.push(Adult(ad, agreement.primarySignature));
      });

      angular.forEach(minors, function(min){
        waiverObj.minors.push(Minor(min));
      });


      console.log('waiver object: ', JSON.stringify(waiverObj));

      return $http.post('/api/waivers', waiverObj);
    };
    
    self.approveWaivers = function(userId,waiverIds) {
      var obj = {
        'userId':(userId)?userId:50,
        'ids':waiverIds
      }
      
      return $http.post('/api/waivers/approvals',obj);
    }

  }]);
