'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:DateService
 * @description
 * # DateService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('DateService', [ function() {
    var self = this;

    self.getDisplayDate = function(date) {
      var displayDate = '';

      if( !(date instanceof Date) ) {
        date = new Date(date);
      }

      if( !isNaN( Date.parse(date) ) ) {
        var month = self.formatDateDigit(date.getUTCMonth() + 1);
        var day = self.formatDateDigit(date.getUTCDate());
        var year = date.getFullYear();

        displayDate = month + '/' + day + '/' + year;
      }

      return displayDate;
    };

    self.getApiDateFormat = function(date) {
      var apiFormat = '';

      if( !(date instanceof Date) ) {
        date = new Date(date);
      }

      if( !isNaN( Date.parse(date) ) ) {
        var month = self.formatDateDigit(date.getUTCMonth() + 1);
        var day = self.formatDateDigit(date.getUTCDate());
        var year = date.getFullYear();

        apiFormat = year + '-' + month + '-' + day;
      }

      return apiFormat;
    };

    self.formatDateDigit = function(digit) {
      if(parseInt(digit) < 10) {
        digit = '0'+digit;
      }
      return digit.toString();
    };

    self.getDateFromTimestamp = function(timestamp) {
      var date = new Date(timestamp);

      if(isNaN(date)) {
        var a = timestamp.split(/[^0-9]/);
        var timeZone = timestamp.slice( timestamp.length-5, timestamp.length-2);
        var d= new Date(a[0],a[1]-1,a[2],a[3],a[4],a[5] );
        var millisecondOffset = -(d.getTimezoneOffset()*60*1000) - parseInt(timeZone)*3600*1000;
        d.setTime( d.getTime() + millisecondOffset );
        date = d;
      }

      return date;
    };

  }]);
