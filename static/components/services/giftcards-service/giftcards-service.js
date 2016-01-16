'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.parks:ParkService
 * @description
 * # ParkService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('GiftCardsService', [ '$http', 'PromiseFactory', '$rootScope', 
      function($http, PromiseFactory, $rootScope) {
    
    var self = this;

    self.issueCard = function(giftCard) {
      function removeHeaders(data, getHeaders){
        var headers = getHeaders();
        headers[ "Content-Type" ] = "text/plain";
        return data;
      }

      var url = '/api/giftcards/issuecard';

      return $http.post(url,giftCard);
    };

    self.createIssueGiftCard = function(cardNumber, initialAmount, orderId) {
      return {
        'cardNumber':cardNumber,
        'orderid':orderId,
        'initialAmount':initialAmount
      };
    };

  }]);
