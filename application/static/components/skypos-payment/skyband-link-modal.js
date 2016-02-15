'use strict';

angular.module('skyZoneApp')
    .controller('SPSkyBandLinkCtrl', ['$scope', '$routeParams', '$modalInstance', '$modal', '$rootScope', '$q', '$location', 'Order', 'ProfileService', '$filter',
        function($scope, $routeParams, $modalInstance, $modal, $rootScope, $q, $location, Order, ProfileService, $filter) {


            function logErrorStopLoading(err) {
                $rootScope.$broadcast('szeHideLoading');
                $rootScope.$broadcast('szeError', 'Failed to process order: '+JSON.stringify(err));
                $scope.showModal = false;
            }

            $scope.jumpers = Order.participants;

            $scope.selectJumper = function(jumper) {

                var skybandModal = $modal.open({
                    animation: true,
                    size: 'md',
                    templateUrl: 'static/components/skypos-start/skyband-scan-modal.html',
                    link: function(scope, elem, attr) {
                        elem.find('.scanner-field').focus();
                    },
                    controller: 'SPSkybandModal'
                })

                skybandModal.result.then(function(skybandId) {
                    jumper.skybandId = skybandId;
                    $rootScope.$broadcast('szeShowLoading');
                    ProfileService.updateCustomerInformation(jumper.id, jumper).then(function(result) {

                        $rootScope.$broadcast('szeHideLoading');

                    }, logErrorStopLoading)
                }, function(reason) {
                    $rootScope.$broadcast('szeHideLoading');

                })
            };

            $scope.getReservationDetails = function(jumper) {
                var out = '';
                angular.forEach(Order.orderItems, function(oi) {
                        if (oi.reservation) {
                            angular.forEach(oi.reservation.reservationItems, function(ri){
                                if(ri.id === jumper.reservationItemId){
                                    out = $filter('ampm')(ri.startTime) + ' ,' + oi.product.jumpDurationMinutes+' Min';
                                }
                            })
                        }
                    })
                    return out;
            }

            $scope.close = function(jumper) {
                $modalInstance.close($scope.order);
            };

            $scope.getAge = function(jumper) {
                var birthday = jumper.birthday;
                if(birthday && birthday.length > 0){
                    var ageDifMs = Date.now() - new Date(birthday).getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    return Math.abs(ageDate.getUTCFullYear() - 1970);
                }
                else{
                    return 0;
                }
            };

            $scope.hasBandStyle = function(jumper) {
                if(jumper.skybandId && jumper.skybandId.length > 0){
                    return {'background-color':'#0055b7'};
                }
                else{
                    return '';
                }
            };
            $scope.done = function(){
                //TODO:check for unbanded jumpers
                //TODO:alert if found
                //TODO:go to start if all jumpers have bands
                $modalInstance.close($scope.order);
            }
        }
    ]);
