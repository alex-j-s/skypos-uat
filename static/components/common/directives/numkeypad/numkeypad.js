/**
 * Created by dharmendrarajpurohit on 13/10/15.
 */
'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:bigLoader
 * @description
 * # bigLoader
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
    .directive('numkeypad', [ function(){
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            //scope: true, // {} = isolate, true = child, false/undefined = no change
            controller: function($scope, $element, $attrs, $transclude) {},
            require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            // template: '',
            templateUrl: 'static/components/common/directives/numkeypad/numkeypad.html',
            // replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function($scope, iElm, iAttrs, ngModal) {

                $scope.keypadValue = 0;

                $scope.numKeyPressed = function(keyValue) {

                    console.log('key pressed: ', keyValue);

                    if($scope.keypadValue == 0)
                    {
                        $scope.keypadValue = keyValue
                        ngModal.$setViewValue(keyValue)
                    }
                    else
                    {
                        ngModal.$setViewValue(ngModal.$viewValue.toString() + keyValue.toString())
                        $scope.keypadValue = $scope.keypadValue.toString() + keyValue.toString()
                    }
                }

                $scope.doubleZeroKey = function() {
                    var newValue = $scope.keypadValue * 100;
                    $scope.keypadValue = newValue;
                    ngModal.$setViewValue(newValue);
                }

                $scope.deleteKeyValue = function(keyValue) {
                    var str = $scope.keypadValue.toString();
                    var newValue = str.substring(0,str.length-1)
                    $scope.keypadValue = newValue;
                    ngModal.$setViewValue(newValue);

                }
            }
        };
    }]);