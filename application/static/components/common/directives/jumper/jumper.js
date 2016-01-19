'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:bigLoader
 * @description
 * # bigLoader
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('jumper', [ function() {

    return {
      restrict: 'A',
      scope: {
        guest: '='
      },
      templateUrl:'static/components/common/directives/jumper/jumper.html',
      controller: function($scope, $element) {


      }
    };
  }]);