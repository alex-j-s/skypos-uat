'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:input-match
 * @description
 * # progressBar
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('compareTo', [ function() {
    return {
      require: 'ngModel',
        scope: {
          otherModelValue: '=compareTo'
        },
        link: function(scope, element, attributes, ngModel) {
          ngModel.$validators.compareTo = function(modelValue) {
              return modelValue === scope.otherModelValue.$modelValue;
          };

          scope.$watch('otherModelValue.$modelValue', function() {
              ngModel.$validate();
          });
        }
    };
  }]);