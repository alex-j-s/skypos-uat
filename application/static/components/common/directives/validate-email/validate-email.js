'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.common.directives:validate-email
 * @description
 * # emailValidate
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeEmailValidate', [ function() {
    return {
      require: 'ngModel',
        link: function(scope, element, attributes, ngModel) {
          ngModel.$validators.emailValidate = function(modelValue) {
            var reg = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]/;
            return reg.test(modelValue) || (modelValue && modelValue.length === 0);
          };
        }
    };
  }]);