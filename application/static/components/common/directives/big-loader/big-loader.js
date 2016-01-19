'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:bigLoader
 * @description
 * # bigLoader
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeBigLoader', [ function() {

    var bigLoaderStyleString = 'background: rgba(255, 255, 255, 0.60);'+
        'position: absolute;'+
        'width: 100%;'+
        'height: 100%;'+
        'display: flex;'+
        'align-items: center;'+
        'top: 0;'+
        'left: 0;'+
        'z-index: 188;';

    var bigLoaderImgStyleString = 'display: flex;'+
        'margin: 0 auto;'+
        'opacity: 0.6;';

    var markup = '<div style="'+bigLoaderStyleString
        +'" class="text-center"><img style="'+bigLoaderImgStyleString
        +'" src="static/images/big-loader.gif"/></div>';

    return {
      restrict: 'E',
      scope: {
        isLoading: '='
      },
      controller: function($scope, $element) {
        $scope.loaderShowing = false;

        $scope.$watch('isLoading', function(newValue) {
          if(newValue && !$scope.loaderShowing) {
            $element.prepend(markup);
            $scope.loaderShowing = true;
          }else if($scope.loaderShowing){
            $element.children().remove();
            $scope.loaderShowing = false;
          }
        });
      }
    };
  }]);
