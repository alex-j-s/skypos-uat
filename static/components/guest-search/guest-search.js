'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.waiver.directive.agreement:Agreement
 * @description
 * # Agreement
 * Directive of the skyZoneApp
 */

angular.module('skyZoneApp')
    .controller('GuestSearchCtrl', ['$scope', '$modalInstance', '$modal', '$rootScope', 'ProfileService', 'Criteria', 
        function($scope, $modalInstance, $modal, $rootScope, ProfileService, Criteria) {
      
        $scope.isSearching = true;
        $scope.showProfile = false;
      $scope.criteria = Criteria;
      // $rootScope.$on('szeGuestSearch', function(evt, criteria){
      //     $rootScope.$broadcast('szeDismissError')
      //     $scope.isSearching = false;
      //     $scope.criteria = criteria;
      //     $scope.guestSearch($scope.criteria);
      // });

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
                $scope.isSearching = false;
            }, function(err){
                $scope.isLoading = false;
                $scope.isSearching = false;
                $rootScope.$broadcast('szeError', err);
                $scope.guestSearchResults = [];
            });
        };

        $scope.selectGuest = function(guest){
            // $scope.showGuestSearch = false;
            // console.log(guest);
            // $rootScope.$broadcast('szeFoundGuest', guest);
            $modalInstance.close(guest);
        };

        $scope.viewProfile = function(guest){
          $scope.selectedJumper = guest;
          $scope.showProfile = true;

          var m = $modal.open({
                    animation: true,
                    template: '<profile-modal profile="selectedJumper" /></profile-modal>',
                    size: 'lg',
                    resolve:{
                      SelectedJumper:function(){
                        return guest;
                      }
                    },
                    controller: function($scope, SelectedJumper){
                      $scope.selectedJumper = SelectedJumper;
                    }
                });

          m.result.then(function(result){

          }, function(reason){

          })
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

        $scope.guestSearch($scope.criteria);
    }
    ]);
