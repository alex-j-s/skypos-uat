'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:incrementInput
 * @description
 * # incrementInput
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeIncrementInput', [ function() {
    return {
      restrict: 'E',
      scope: {
        value: '='
      },
      templateUrl: 'static/components/common/directives/increment-input/increment-input.html'
    };
  }]);