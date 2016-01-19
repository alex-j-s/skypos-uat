'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.datepicker:DatepickerFactory
 * @description
 * # DatepickerFactory
 * Factory of the skyZoneApp
 */


angular.module('skyZoneApp')
  .factory('DatepickerFactory', ['DateService', function(DateService) {

    var Datepicker = function(selectedDate, minDate, maxDate) {
      this.isOpened = false;
      this.selectedDate = selectedDate;
      this.minDate = minDate;
      this.maxDate = maxDate;
      this.format = 'MM/dd/yyyy';
      this.dateOptions = {
        maxMode: 'month',
        formatYear: 'yyyy',
        showWeeks: false
      };
    };

    Datepicker.prototype = {

      clear: function() {
        this.selectedDate = null;
      },

      open: function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.isOpened = true;
      }

    };

    return {
      getInstance: function(selectedDate, minDate, maxDate) {
        return new Datepicker(DateService.getDisplayDate(selectedDate), minDate, maxDate);
      }
    };

  }]);
