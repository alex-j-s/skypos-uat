'use strict';

angular.module('skyZoneApp')
    .controller('SPClockinController', ['$scope', '$rootScope', '$window', '$location', '$filter', 'Park', 'UserService',
        function($scope, $rootScope, $window, $location, $filter, Park, UserService) {


            function logErrorHideLoading(err) {
                $rootScope.$broadcast('szeHideLoading');
                $rootScope.$broadcast('szeError', err);
            }

            $scope.isFullScreen = function(){
                return ($location.path().indexOf('clockin') > -1);
            };


            $scope.doClockIn = function(memberid, memberpin, type) {

                $rootScope.$broadcast('szeShowLoading');

                UserService.ClockIn(memberid, memberpin, type).then($scope.handleSuccess, logErrorHideLoading);

            };

            $scope.handleSuccess = function(result){
                $rootScope.$broadcast('szeHideLoading');
                $rootScope.$broadcast('szeError', result.eventType+' Successful: '+ $filter('date')(result.eventDate, 'HH:mm:ss a'))
            };


            $scope.backToHome = function() {
                $rootScope.$broadcast('szeDismissError');
                $window.history.back();
            };


        }
    ]);
