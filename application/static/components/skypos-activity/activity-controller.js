'use strict';

angular.module('skyZoneApp')
    .controller('SPActivityController', ['$scope', '$rootScope', '$location', 'Park', 'ReservationService', 'Activities', 'ProductService', 'DateService', 'NavService', 'AlertService', 'OrderService',
        function($scope, $rootScope, $location, Park, ReservationService, Activities, ProductService, DateService, NavService, AlertService, OrderService) {

            $scope.rowStatus = true
            $scope.date = new Date();
            $scope.dateOptions = {
                formatYear: 'yy',
                showWeeks: false,
                // startingDay: 0
            };
            $scope.opened = false;
            $scope.duration;
            $scope.format = "EEEE, MMMM d, y";
            $rootScope.reservation = {};

            var resourceIds = [];
            var quantities = {};

            function calculateQuantities(){
                
                $scope.reservationQuantity = 0;
                
                angular.forEach(resourceIds, function(resId){
                    $scope.reservationQuantity += quantities[resId];
                })

                return $scope.reservationQuantity;
            }

            $scope.open = function($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };

            $scope.$watch('date', function(newDate, oldDate){
                if($scope.duration && $scope.duration.id && newDate && $scope.reservationQuantity){
                    $scope.date = newDate;
                    $scope.getTimeSlots($scope.duration.id, $scope.reservationQuantity);
                }
            })

            function logErrorStopLoading(err) {
                $rootScope.$broadcast('szeHideLoading');
                $rootScope.$broadcast('szeError', err);
            }

            var panelStatusObjects = [{
                    "id": '1',
                    "showFrontPanel": true,
                    "showBackPanel": false
                }, {
                    "id": '2',
                    "showFrontPanel": false,
                    "showBackPanel": false,
                    "showPlaceholder": true

                }, {
                    "id": '3',
                    "showFrontPanel": false,
                    "showBackPanel": false,
                    "showPlaceholder": true
                }

            ];

            $scope.timeSlots = [];
            $scope.durations = [];
            $scope.activities = Activities;
            $scope.panelStatusObjects = panelStatusObjects; // panel status
            $scope.reservation;
            $scope.reservationQuantity = 0;

            $scope.onActivitySelection = function(type, localActivity) {
                $rootScope.$broadcast('szeShowLoading')
                
                $scope.duration = null;
                $scope.durations = [];
                $scope.timeSlots = [];

                angular.forEach($scope.activities, function(a) {
                    a.isChecked = false;
                });

                localActivity.isChecked = true;


                $scope.panelStatusObjects[0].showFrontPanel = false;
                $scope.panelStatusObjects[0].showBackPanel = true;

                $scope.panelStatusObjects[1].showFrontPanel = true;
                $scope.panelStatusObjects[1].showBackPanel = false;
                $scope.panelStatusObjects[1].showPlaceholder = false;

                $scope.panelStatusObjects[2].showFrontPanel = false;
                $scope.panelStatusObjects[2].showBackPanel = false;

                ProductService.getProductsByActivityType(localActivity.activityType).then(function(prods) {
                    $scope.durations = prods;
                    $rootScope.$broadcast('szeHideLoading');
                }, logErrorStopLoading)

            }

            $scope.onDurationSelection = function(localDuration) {
                localDuration.isChecked = true;
                $scope.duration = localDuration;

                if (localDuration.quantity >= 0) {
                    $scope.getTimeSlots(localDuration.id, localDuration.quantity);
                }
            };

            $scope.getTimeSlots = function(resourceId, quantity) {
                if (quantity === 0) {
                    delete quantities[resourceId]
                    resourceIds.splice(resourceIds.indexOf(resourceId), 1);

                    console.log('no quantity requested, aborting availability check')
                    return;
                } else {
                    if(resourceIds.indexOf(resourceId) === -1){
                        resourceIds.push(resourceId)
                    }
                    quantities[resourceId] = quantity;
                }

                $rootScope.$broadcast('szeShowLoading');

                $scope.timeSlots = [];


                var date = DateService.getApiDateFormat($scope.date);
                ReservationService.getAvailabilityByProductId(resourceIds, calculateQuantities(), date, date, null, null, true)
                    .success(function(data) {
                        $rootScope.$broadcast('szeHideLoading');
                        console.log(data);
                        if (data.dates && data.dates.length >= 1) {
                            $scope.timeSlots = data.dates[0].timeSlots;
                        }
                        $scope.panelStatusObjects[1].showFrontPanel = true;
                        $scope.panelStatusObjects[1].showBackPanel = false;

                        $scope.panelStatusObjects[2].showFrontPanel = true;
                        $scope.panelStatusObjects[2].showBackPanel = false;
                        $scope.panelStatusObjects[2].showPlaceholder = false;
                        console.log($scope.timeSlots);
                    })
                    .error(logErrorStopLoading)
                    .finally(function() {});
            };

            $scope.generateTimeSlotLabel = function(timeSlot) {
                return $scope.formatHourString(timeSlot.startTime) + ' - ' + $scope.formatHourString(timeSlot.endTime)
            };

            $scope.formatHourString = function(hourString) {
                var min, hr;
                if (hourString.indexOf(':') > -1) {
                    min = hourString.split(':')[1]
                    min += '0';
                    hr = hourString.split(':')[0];
                    return hr + ':' + min.substring(0, 2);
                } else {
                    return hourString;
                }
            };

            $scope.onTimeSlotSelection = function(localTimeSlot) {

                //  localTimeSlot.isChecked = true;

                $scope.panelStatusObjects[2].showFrontPanel = true;

                $rootScope.$broadcast('szeShowLoading')
                console.log($scope.duration)
                var date = DateService.getApiDateFormat($scope.date);
                ReservationService.createReservation(quantities, date, $scope.formatHourString(localTimeSlot.startTime))
                    .success(function(data) {
                        console.log('reservation response', data);
                        $scope.reservation = data;
                        $rootScope.reservation = $scope.reservation;
                        $scope.goToGuestScreen();
                    })
                    .error(logErrorStopLoading)
                    .finally(function() {});
            };


            $scope.goToGuestScreen = function() {
                if ($scope.reservation) {
                    NavService.goToRoute('guest', {
                        'parkUrlSegment': Park.parkUrlSegment,
                        'reservationId': $scope.reservation.id,
                        'productId': $scope.duration.id,
                        'quantity': $scope.reservationQuantity
                    });
                } else {
                    logErrorStopLoading('Select a timeslot above to create a reservation.');
                }


            };

            $scope.goToStartScreen = function() {

                $location.path('/skypos/start/' + Park.parkUrlSegment)
            }

        }
    ])
.filter('szeHideEmptySlots', function($q){
    return function(input){
        var out = []
        angular.forEach(input, function(ts){
            if(ts.availableCapacity > 0){
                out.push(ts);
            }
        })
        return out;
    }
});
