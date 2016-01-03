'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive.fatal-error:fatalError
 * @description
 * # fatalError
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeFatalError', [ function() {
    return {
      restrict: 'A',
      transclude: true,
      scope: {
        'errorTitle': '=',
        'errorMessage': '=',
        'errorAction': '=',
        'errorClass': '=',
        'szeFatalError': '='
      },
      templateUrl: 'static/components/common/directives/fatal-error/fatal-error.html'
    };
  }]);