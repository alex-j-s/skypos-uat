'use strict';

angular.module('skyZoneApp')
    .controller('SPNotesModal', ['$scope', '$rootScope', '$modalInstance', 'Order', 'StorageService', function($scope, $rootScope, $modalInstance, Order, StorageService){
        $scope.order = Order;
        console.log($scope.order);
        $scope.closeModal = function(){
            if($scope.isTeamMember()){
                $modalInstance.dismiss('closed by team member');
            }else{
                $modalInstance.close($scope.order);
            }
        };

        $scope.isTeamMember = function(){
            return (StorageService.handleGet('role') == 'pos_user');
        }
    }]);