'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:birthdayDropdown
 * @description
 * # progressBar
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeBirthdayDropdown', [ function() {
    return {
      restrict: 'E',
      scope: {
        form: '=form',
        isSubmit: '=isSubmit',
        fullBirthday: '=birthday',
        labelClass: '=',
        dropdownClass: '=',
        label: '@'
      },
      templateUrl: 'static/components/common/directives/birthday-dropdown/birthday-dropdown.html',
      controller: 'BirthdayDropdownCtrl as birthdayCtrl'
    };
  }])
  .controller('BirthdayDropdownCtrl', ['$scope', 'DateService', function($scope, DateService) {
    var self = this;

    $scope.$watch('fullBirthday', function() {
      self.prepopulateBirthday();
    });

    self.calculateDays = function(max) {
      var range = [1,parseInt(max)];
      var days = [];
      for( var i = range[0]; i <= range[1]; i++) {
        var label = DateService.formatDateDigit(i);

        days.push(label);
      }
      return days;
    };

    self.getYears = function() {
      var min = 1900;
      var years = [];
      for( var i= new Date().getFullYear(); i>=min; i--){
        years.push(i);
      }
      return years;
    };

    self.isLeapYear = function(year) {
      var isLeapYear = false;
      if(!year){
        isLeapYear = true;
      } else {
        if( (year % 400 === 0) || ( (year % 4 === 0) && ( year % 100 !== 0)) ){
          isLeapYear = true;
        }
      }
      return isLeapYear;
    };

    self.months = [
      {
        value: '01',
        label: 'Jan',
        days: function(){
          return '31';
        }
      },
      {
        value: '02',
        label: 'Feb',
        days: function() {
          return (self.isLeapYear(self.birthdayYear)) ? '29' : '28';
        }
      },
      {
        value: '03',
        label: 'Mar',
        days: function(){
          return '31';
        }
      },
      {
        value: '04',
        label: 'Apr',
        days: function(){
          return '30';
        }
      },
      {
        value: '05',
        label: 'May',
        days: function(){
          return '31';
        }
      },
      {
        value: '06',
        label: 'Jun',
        days: function(){
          return '30';
        }
      },
      {
        value: '07',
        label: 'Jul',
        days: function(){
          return '31';
        }
      },
      {
        value: '08',
        label: 'Aug',
        days: function(){
          return '31';
        }
      },
      {
        value: '09',
        label: 'Sept',
        days: function(){
          return '30';
        }
      },
      {
        value: '10',
        label: 'Oct',
        days: function(){
          return '31';
        }
      },
      {
        value: '11',
        label: 'Nov',
        days: function(){
          return '30';
        }
      },
      {
        value: '12',
        label: 'Dec',
        days: function(){
          return '31';
        }
      }
    ];

    self.days = self.calculateDays(self.months[0].days());

    self.years = self.getYears();

    self.updateDays = function() {
      self.days = (!self.birthdayMonth) ? self.calculateDays(31) : self.calculateDays(self.months[parseInt(self.birthdayMonth)-1].days());
    };

    self.updateBirthday = function() {
      if (self.birthdayYear && self.birthdayMonth && self.birthdayDay ) {
        $scope.fullBirthday = self.birthdayYear + '-' +self.birthdayMonth+ '-' +self.birthdayDay;
      }
    };

    self.prepopulateBirthday = function() {
      if($scope.fullBirthday) {
        var birthday = new Date($scope.fullBirthday);
        if(!isNaN(Date.parse(birthday))) {
          self.birthdayMonth = DateService.formatDateDigit(birthday.getUTCMonth()+1);
          self.birthdayDay = DateService.formatDateDigit(birthday.getUTCDate());
          self.birthdayYear = birthday.getUTCFullYear();
        }
      }else{
        self.birthdayYear = undefined;
        self.birthdayMonth = undefined;
        self.birthdayDay = undefined;
      }
    };

  }]);
