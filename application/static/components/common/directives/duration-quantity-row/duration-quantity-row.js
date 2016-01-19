
'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:bigLoader
 * @description
 * # bigLoader
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
    .directive('durationQuantityRow', ['$rootScope', function($rootScope){
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {
                'duration':'=',
                'activityItem': '=',
                // 'rowStatus': '=',
                'quantity': '=',
                'index': '@'
            }, // {} = isolate, true = child, false/undefined = no change
            controller: function($scope, $element, $attrs, $transclude) {},
           // require: 'ngModel', Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
            // template: '',
            templateUrl: 'static/components/common/directives/duration-quantity-row/duration-quantity-row.html',
            // replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function($scope, iElm, iAttrs, ngModal) {

                $scope.onQuantityChange = function(isIncrement, e) {
                    if (isIncrement) {
                        $scope.duration.quantity = $scope.duration.quantity + 1;
                    }
                    else {
                        $scope.duration.quantity = $scope.duration.quantity - 1;
                    }
                    
                    if($scope.duration.quantity <= 0){
                        $scope.duration.quantity = 0;
                        $scope.duration.isChecked = false;
                    }
                    else{
                        $scope.duration.isChecked = true;
                    }

                };

                $scope.rowStatus = function() {
                    return $scope.duration.quantity > 0
                };

            }
        };
    }]);
