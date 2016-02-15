'use strict';

angular.module('skyZoneApp')
	.controller('SPResCtrl', ['$scope', '$routeParams', '$modalInstance', '$rootScope', '$q', '$location', 'Jumper', 'ReservationItems',
        function($scope, $routeParams, $modalInstance, $rootScope, $q, $location, Jumper, ReservationItems) {
        	
        	$scope.sizeGroups = [{
        		'value':'Group A',
        		'label':'Group A: 0-4',
        	},{
        		'value':'Group B',
        		'label':'Group B: 5-10',
        	},{
        		'value':'Group C',
        		'label':'Group C: 11-15',
        	},{
        		'value':'Group D',
        		'label':'Group D: 16+',
        	}];	


        	$scope.reservationItems = ReservationItems;
        	$scope.jumper = Jumper;
			console.log(ReservationItems)
			console.log(Jumper)

        	$scope.cancel = function(){
        		$modalInstance.dismiss('Cannot add jumper without a reservation item.');
        	};

        	$scope.selectReservation = function(reservationItems){
        		$scope.jumper.reservationItemId = reservationItems.pop().id;
        		$modalInstance.close($scope.jumper);
        	};

        	$scope.selectSizeGroup = function(groupVal){
        		$scope.jumper.sizeGroup = groupVal;
        	};

        	$scope.hasSizeGroup = function(jumper){
        		return (jumper.sizeGroup != null);
        	};
        }]);
