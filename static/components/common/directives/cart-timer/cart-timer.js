'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:cartTimer
 * @description
 * # cartTimer
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeCartTimer', [ function() {
    return {
      restrict: 'E',
      scope: {
        expDate: '='
      },
      templateUrl: 'static/components/common/directives/cart-timer/cart-timer.html',
      controller: 'ReservationTimerCtrl as resTimerCtrl'
    };
  }])
  .controller('ReservationTimerCtrl', ['$scope', '$interval', '$modal', 'OrderService', 'DateService', function($scope, $interval, $modal, OrderService, DateService) {
    var self = this;
    var countdownStarted = false;
    var countdownInterval; // so that we can cancel the time updates

    self.reservationItem = null;

    $scope.$on('orderReservationCheck', function(event, reservationItem) {
      if(reservationItem && !countdownStarted) {
        self.reservationItem = reservationItem;
        self.startCountdown(reservationItem.reservation.dateExpires);
      }else if(!reservationItem) {
        countdownStarted = false;
        self.reservationItem = null;
        $interval.cancel(countdownInterval);
      }
    });

    self.startCountdown = function(expDate) {
      countdownStarted = true;

      var now = new Date();
      var expirationDate = DateService.getDateFromTimestamp(expDate);

      var timeDifference = expirationDate - now;
      var timeRemaining = Math.max( 0, Math.floor(timeDifference/1000) );

      var generateDisplay = function() {
        var output = '';
        if(timeRemaining/60 > 1) {
          output = Math.floor(timeRemaining/60) + ' minutes ';
        }
        output += (timeRemaining%60) + ' seconds';
        self.timeRemainingStr = output;
      };

      // used to update the UI
      var updateTime = function() {
        if(timeRemaining > 0){
          timeRemaining--;
        }else{
          $interval.cancel(countdownInterval);
          self.handleExpiredReservation();
        }

        generateDisplay();
      };

      generateDisplay();
      countdownInterval = $interval(updateTime, 1000);
    };

    self.handleExpiredReservation = function() {
      var expireModal = $modal.open({
        templateUrl: 'static/components/common/message-modal/message-modal.html',
        controller: 'MessageModalCtrl as modalCtrl',
        backdrop: true,
        windowClass: 'small',
        resolve: {
          options: function() {
            return {
              'messaging': {
                'title': 'Reservation Expired',
                'message': 'Unfortunately your 15 minute reservation window to purchase tickets has expired. Please return to the catalog screen to reserve a new jump time.',
                'button': 'Find New Jump Time'
              },
              'targetUrl': '/'
            };
          }
        }
      });

      expireModal.result.then( function(result) {
        var sendBroadcast = (result !== 'redirect');
        self.removeReservationItem(sendBroadcast);
      }, function() {
        self.removeReservationItem(true);
      });

    };

    self.removeReservationItem = function(sendBroadcast) {
      if(self.reservationItem) {
        OrderService.deleteOrderLineItem(self.reservationItem.id)
          .success( function() {
            if(sendBroadcast) {
              $scope.$parent.$broadcast('reservationRemoved');
            }
          });
      }
    };

  }]);
