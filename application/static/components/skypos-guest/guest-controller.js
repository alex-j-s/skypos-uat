'use strict';

angular.module('skyZoneApp')
    .controller('SPGuestController',['$scope', '$modal', '$routeParams', '$q', '$rootScope', '$location', 'Park', 'ProfileService', 'OrderService', 'NavService', 'Order', 'UserService', 'RFIDReaderService'
    	function($scope, $modal, $routeParams, $q, $rootScope ,$location, Park, ProfileService, OrderService, NavService, Order, UserService, RFIDReaderService){

    	console.log(Park);

                    $scope.isSearching = false;
        $scope.order = Order?Order:{};
    	$scope.guestFound = ($scope.order.id)?true:false;
        $scope.reservation = angular.copy($rootScope.reservation);
    	$scope.guest = {};
        $scope.newGuest = {
            gender:'Male',
            firstName:'',
            lastName:'',
            birthday:'',
            email:'',
            phone:''
        };



    	function logErrorHideLoading(err){
                    $scope.isLoading = false;
                    $scope.isSearching = false;
    				$rootScope.$broadcast('szeHideLoading');
    				$rootScope.$broadcast('szeError', err);
    	}

    	$scope.handleGuestSearchCancel = function(){

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

    	$scope.handleGuestSearchResult = function(guest){
    		$scope.guest = guest;
            console.log('handling guest search result', $scope.guest)
    		$scope.createOrder(guest).then($scope.addReservationItems, logErrorHideLoading);
    	};

        $scope.canAddGuest = function(guest){
            return(guest.firstName && guest.firstName.length > 0
                && guest.lastName && guest.lastName.length > 0
                && guest.email && guest.email.length > 0
                && guest.phone && guest.phone.length > 0
                && guest.birthday && guest.birthday.length > 0
                && guest.gender && guest.gender.length > 0)
        };

        $scope.addGuest = function(guest){

            $rootScope.$broadcast('szeDismissError')
            $rootScope.$broadcast('szeShowLoading')
            if ($scope.canAddGuest(guest)) {
                if($scope.getAge(guest.birthday) >= 18){
                    UserService.createAccount(guest).then(function(customer) {
                        console.log(customer);
                        $scope.handleGuestSearchResult(customer.data);
                    }, logErrorHideLoading)
                } else {
                    logErrorHideLoading('Guest must be at least 18 years old.')
                }
            }
            else{
                    logErrorHideLoading('Please fill in all fields for new guest.')
            }
        };

        $scope.getAge = function(birthday) {
                if(birthday && birthday.length > 0){
                    var ageDifMs = Date.now() - new Date(birthday).getTime();
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    return Math.abs(ageDate.getUTCFullYear() - 1970);
                } else{
                    return 0;
                }
        };

    	$scope.createOrder = function(guest){

    		var orderRequest = {
    			'parkId':Park.id,
    			'accountId':guest.id,
                'numberOfGuests':$rootScope.reservation.numberOfGuests,
                'numberOfJumpers':$rootScope.reservation.numberOfGuests,
    			'start': new Date(),
    			'end':new Date(new Date().getTime()+(60*60*1000))
    		};

    		var def = $q.defer();

    		$rootScope.$broadcast('szeShowLoading');
            $scope.isSearching = true;
    		OrderService.createOrder(orderRequest)
    			.then(function(order){
                    order.numberOfGuests = $rootScope.reservation.numberOfJumpers
                    order.numberOfGuests = $rootScope.reservation.numberOfGuests;
                    console.log('order updating number of guests: ', order.numberOfGuests)
                    OrderService.updateOrder(order.id, order).then(function(order){
        				$scope.guestFound = true;
        				$scope.order = order;
        				$rootScope.$broadcast('szeHideLoading');
        				def.resolve(order);
                    }, logErrorHideLoading)
    			}, logErrorHideLoading);

    		return def.promise;
    	};

        $scope.addReservationItems = function(order){
            if($scope.reservation.reservationItems.length === 0){
                return $scope.goToJumpersScreen();
            }

            $scope.addReservationItem($scope.reservation.reservationItems.pop());
        };

        $scope.addReservationItem = function(resItem){

            $rootScope.$broadcast('szeShowLoading');
            OrderService.addLineItemToOrder($scope.order.id, OrderService.createLineItem(resItem.resourceId, resItem.numberOfGuests, $scope.reservation.id))
                .then($scope.goToJumpersScreen, logErrorHideLoading);
        };

    	$scope.doGuestSearch = function(crit){
    		$rootScope.$broadcast('szeGuestSearch', crit)
            var gsModal = $modal.open({
                animation: true,
                templateUrl: 'static/components/guest-search/guest-search.html',
                size: 'lg',
                resolve: {
                    'Criteria':function(){
                        return crit;
                    }
                },
                controller: 'GuestSearchCtrl'
            });

            gsModal.result.then($scope.handleGuestSearchResult, $scope.handleGuestSearchCancel);
    	};

    	$scope.goToJumpersScreen = function(){
    		if($scope.guestFound){
    			NavService.goToRoute('jumpers', {
    				'parkUrlSegment':Park.parkUrlSegment,
    				'orderId':$scope.order.id,
    				'guestId':$scope.guest.id
    			});
    		}else{
                logErrorHideLoading('Use the form below to find a guest.');
            }
    	};

        $scope.goToActivitiesScreen = function(){
            $rootScope.$broadcast('szeConfirm', {
                    title: 'Cancel Order?',
                    message: 'Going back will release the current reservation. Continue?',
                    confirm: {
                        label: 'Continue',
                        action: function($clickEvent) {
                            //OrderService.cancelOrder();
                            OrderService.clearLocal();
                            NavService.goToRoute('activity', {
                                'parkUrlSegment': Park.parkUrlSegment
                            });
                        }
                    },
                    cancel: {
                        label: 'Stay Here',
                        action: function($clickEvent) {
                            return;

                        }
                    }
                })
        };

        $scope.openSkybandModal = function(){
            var skybandModal = $modal.open({
                animation: true,
                size:'md',
                templateUrl: 'static/components/skypos-start/skyband-scan-modal.html',
                link: function(scope, elem, attr){
                    elem.find('.scanner-field').focus();
                },
                controller: 'SPSkybandModal'
            })

            skybandModal.result.then( function (skybandId) {
                $rootScope.$broadcast('szeShowLoading');
                ProfileService.customerSearch({'skybandId':id})
                  .then(function(result) {
                    console.log(result);
                  }, function(err) {
                    console.log(err);
                  });
            }, function(reason){

            })
        };
    }]);
