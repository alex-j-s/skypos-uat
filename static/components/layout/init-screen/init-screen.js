angular.module('skyZoneApp')
    .controller('InitCtrl', function($scope, $location, Park, Guest, Product, StartTime, UserService) {
        console.log('route loaded')

          $location.path('/orders/create/'+Guest.id+'/' + StartTime.getTime());
    });
