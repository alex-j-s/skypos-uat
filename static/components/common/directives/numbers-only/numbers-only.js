'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:numbers-only
 * @description
 * # numbersOnly
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeNumbersOnly', [ function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attributes, ngModel) {
        ngModel.$parsers.push(function(text) {
          var numbersOnly = text.replace(/[^0-9]/g, '');
          if(numbersOnly !== text) {
            ngModel.$setViewValue(numbersOnly);
            ngModel.$render();
          }else if(numbersOnly === '' || numbersOnly === '0') {
            numbersOnly = 1;
            ngModel.$setViewValue('1');
            ngModel.$render();
          }
          return Number(numbersOnly);  // or return Number(numbersOnly)
        });
      }
    };
  }]);