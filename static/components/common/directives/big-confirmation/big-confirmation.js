'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.directive:bigLoader
 * @description
 * # bigLoader
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
  .directive('szeBigConfirmation', ['$q', '$rootScope', function($q, $rootScope) {

    var confModel = {
      title:'Warning!',
      message:'Something requires your decision!',
      confirm:{
        label:'Yes!',
        action:function($clickEvent){
          alert('You said yes!')
        }
      },
      cancel:{
        label:'No',
        action:function($clickEvent){
          alert('You said no!')

        }
      }
    }

    return {
      restrict: 'E',
      templateUrl:'static/components/common/directives/big-confirmation/big-confirmation.html',
      link:function(scope, elem, attrs){
        scope.confModel = confModel;
        elem.hide();
        $rootScope.$on('szeConfirm', function(a, b){
          console.log(a, b);
          if(b){
            scope.confModel = angular.copy(b);
            elem.show();
          }
        });
        $rootScope.$on('szeClear', function(){
          elem.hide();
        })
        scope.action = function(ev, action){
          if(scope.confModel[action] &&
            scope.confModel[action].action){
            scope.confModel[action].action(ev, action);
          }
          elem.hide();
        };
      },
      controller: function($scope, $element) {
       
      }
    };
  }]);
