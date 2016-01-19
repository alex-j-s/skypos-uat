'use strict';

angular.module('skyZoneApp')
  .directive('szeGuestSearch', ['$rootScope', 'ProfileService', function($rootScope, ProfileService){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      //can be an object with firstName, lastName, email, postalCode
      // criteria: '=',
      // foundCallback: '='
    }, // {} = isolate, true = child, false/undefined = no change
    controller: function($scope, $element, $attrs, $transclude) {
      $scope.criteria = {};
      $rootScope.$on('szeGuestSearch', function(evt, criteria){
          $rootScope.$broadcast('szeDismissError')
          $scope.isSearching = false;
          $scope.criteria = criteria;
          $scope.guestSearch($scope.criteria);
      });

      function isEmail (en){
        if(!en){
          return false;
        }
        if(angular.isNumber(en)){
          return false;
        }
        return (en.indexOf('@') > -1);
      }

      function isPhone (en){
        if(!en){
          return false;
        }
        else {
          return angular.isNumber(parseInt(en));
        }
      }

      $scope.guestSearch = function(searchCriteria){

            var temp = angular.copy(searchCriteria);

            if(isEmail(temp.numOrEmail)){
              temp.email = temp.numOrEmail;
              delete temp.numOrEmail;
            }
            else if(isPhone(temp.numOrEmail)){
              temp.phoneNumber = temp.numOrEmail;
              delete temp.numOrEmail;
            }
            $scope.isLoading = true;
            ProfileService.customerSearch(temp).then(function(result){
                $scope.isLoading = false;
                $scope.guestSearchResults = result.data;
            }, function(err){
                $scope.isLoading = false;
                $rootScope.$broadcast('szeError', err);
                $scope.guestSearchResults = [];
            });
        };

        $scope.selectGuest = function(guest){
            // $scope.showGuestSearch = false;
            console.log(guest);
            $rootScope.$broadcast('szeFoundGuest', guest);
            // $modal.close(guest);
        };

        $scope.canSearch = function(searchCriteria){
          return (searchCriteria.firstName.length > 0 ||
            searchCriteria.lastName.length > 0 ||
            searchCriteria.email.length > 0 ||
            searchCriteria.postalCode.length > 0 ||
            searchCriteria.orderNumber.length > 0 ||
            isPhone(searchCriteria.numOrEmail) ||
            isEmail(searchCriteria.numOrEmail)); 
        };
    },
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: '/components/common/directives/guest-search/guest-search.html',
    replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function(scope, iElm, iAttrs, controller) {

      scope.guestSearchResults = [];
      scope.isLoading = false;
    }
  };
}])