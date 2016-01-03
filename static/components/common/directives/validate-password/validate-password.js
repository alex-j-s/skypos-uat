'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:password-validate
 * @description
 * # progressBar
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szePasswordValidate', [ function() {
    return {
      require: 'ngModel',
        link: function(scope, element, attributes, ngModel) {
          ngModel.$validators.passwordValidate = function(modelValue) {
            /***
              Must have 1 number
                (?=.*\d)
              Must have 1 lowercase alpha character
                (?=.*[a-z])
              Must have 1 upperase alpha character
                (?=.*[A-Z])
              Must have 1 special character ->  ?!@#$%^&*()[]{}:;'"/.\|
                (?=.*[?!@#$%^&*()\[\]{}:;'"/.\\|])
              Must have at least 8 characters made up of the characters stated above (includes spaces)
                [0-9a-zA-Z ?!@#$%^&*()\[\]{}:/;'"/.\\|]{8,}
            ***/
            var reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[?!@#$%^&*()\[\]{}:;'"/.\\|])[0-9a-zA-Z ?!@#$%^&*()\[\]{}:/;'"/.\\|]{8,}$/;
            return reg.test(modelValue);
          };
        }
    };
  }]);