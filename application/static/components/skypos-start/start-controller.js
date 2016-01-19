angular.module('skyZoneApp')
    .controller('SPStartController', function($scope, $modal, $filter, $location, Park, OrderService, $rootScope,ReservationService, NavService, WaiverStatus) {
        
        
        $rootScope.hasReturn = false;

        $scope.searchCriteria = {
            orderNumber:null,
            primaryGuestEmail:null,
            customerId:null,
            parkId:Park.id
        };

        function logErrorHideLoading(err){
                    $rootScope.$broadcast('szeHideLoading');
                    $rootScope.$broadcast('szeError', err);
        }

        function newJumpTimeOrder(){
            $location.path('/skypos/activity/'+Park.parkUrlSegment)
        }

        function findReservation(){
                if(!$scope.searchCriteria.primaryGuestEmail
                    || ($scope.searchCriteria.primaryGuestEmail && $scope.searchCriteria.primaryGuestEmail.length === 0)){
                    $rootScope.$broadcast('szeError', 'Please enter email to search for reservation.');
                    return;
                }
                $rootScope.$broadcast('szeShowLoading');
                ReservationService.findReservation({email: $scope.searchCriteria.primaryGuestEmail}).then($scope.openResSearchModal, logErrorHideLoading)

        }

        // function bookEvent(){
        //         $rootScope.$broadcast('szeError', 'Coming Soon!');

        // }

        function newMerchandiseOrder(){
                $location.path('/skypos/offers/'+Park.parkUrlSegment)

        }


        $scope.actions = [{
            'label': 'New Order',
            'action': newJumpTimeOrder
        }, {
            'label': 'Find Reservation',
            'action': findReservation
        }, {
            'label': 'Merchandise',
            'action': newMerchandiseOrder
        }];

        function handleOrderSearchSuccess(result){

            function getGuestId(order){
                if(!order || !order.orderAccount){
                    return -1;
                }
                if(order.orderAccount.customer){
                    return order.orderAccount.customer.id;
                }
                else if(order.orderAccount.group){
                    return order.orderAccount.group.id;
                }
                else{
                    return -1;
                }
            }
            console.log('++++ GUEST SEARCH RESULT: ', result);

            if(result.data && angular.isArray(result.data)){
                if(result.data.length === 1){
                    result = result.data[0];
                }
                else if(result.data.length > 1){
                    //show results modal
                    return;
                }
                else{
                    logErrorHideLoading('Unable to locate order. Please try again.')
                    return;
                }
            }

            if(result){
                console.log(result)
                if(getGuestId(result) !== -1){
                    $scope.goToJumpersScreen(getGuestId(result), result.id);
                }
                else{
                    $location.path('/skypos/offers/'+Park.parkUrlSegment+'/'+result.id);

                }
            }else{
                logErrorHideLoading('Unable to locate order. Please try again.');
            }

        }

        function handleResSearchResult(result){
            $scope.goToJumpersScreen(result.guestId, result.orderId);
        }

        $scope.goToJumpersScreen = function(guestId, orderId){
                NavService.goToRoute('jumpers', {
                    'parkUrlSegment':Park.parkUrlSegment,
                    'guestId':guestId,
                    'orderId':orderId
                })
        };

        function handleOrderSearchFailure(result){
            console.log(result);
            logErrorHideLoading('Unable to locate order. Please try again.');

        }

        $scope.handleClockInOut=function ()
        {
            $location.path('/skypos/clockin/'+Park.parkUrlSegment);
        }

        $scope.POSTypes = [
            {
                'id': 1, 
                'label': 'Book Jump Time',
                'actions': [{
                    'label': 'New Order',
                    'action': newJumpTimeOrder
                }, {
                    'label': 'Find Reservation',
                    'action': findReservation
                }, {
                    'label': 'Merchandise',
                    'action': newMerchandiseOrder
                }]
            }, 
            {
                'id': 2, 
                'label': 'Concessions Stand',
                'actions': [{
                    'label': 'New Order',
                    'action': newMerchandiseOrder
                }]
            }
        ];

        $scope.SelectedPOS = JSON.parse(localStorage.getItem('POSType'));
        $rootScope.SelectedPOSType = $scope.SelectedPOS;

        $scope.onSave = function()
        {
            localStorage.setItem('POSType', JSON.stringify($scope.SelectedPOS));
            console.log($scope.SelectedPOS)
            $rootScope.SelectedPOSType = $scope.SelectedPOS
            $rootScope.$broadcast('posChange');
        }

        $scope.openBarCodeModal = function(){
            var barcodeModal = $modal.open({
                animation: true,
                size:'md',
                templateUrl: 'static/components/common/directives/receipt-modal/receipt-modal.html',
                link: function(scope, elem, attr){
                    elem.find('.scanner-field').focus();
                },
                controller: 'SPReceiptModal'
            });
            barcodeModal.result.then($scope.handleBarcodeResult, function(reason){

            }); 
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
                ReservationService.findReservation({skybandId: skybandId}).then($scope.openResSearchModal, logErrorHideLoading)
            }, function(reason){

            })
        };

        $scope.openResSearchModal = function(customer){
                $rootScope.$broadcast('szeHideLoading');
            var resSearch = $modal.open({
                animation: true,
                size:'xl',
                templateUrl: 'static/components/skypos-start/reservation-search-modal.html',
                resolve:{
                    'Customer': function(){
                        return customer;
                    }
                },
                controller: function($scope, $modalInstance, Customer){
                    $scope.searchedGuest = Customer;

                    $scope.selectReservation = function(guestId, orderId){
                        $modalInstance.close({
                            'guestId':guestId,
                            'orderId':orderId
                        })
                    };
                    $scope.cancel = function(){
                        $modalInstance.dismiss('close button');
                    }
                }
            });
            resSearch.result.then(handleResSearchResult, function(reason){

            }); 
        };

        $scope.handleBarcodeResult = function(orderNumber){
            // $scope.searchCriteria.orderNumber = orderNumber;
            console.log('Order Search Criteria: ',orderNumber);
            // console.log('Order Search Request: ',OrderService.createOrderSearch($scope.searchCriteria))
            OrderService.getOrder(orderNumber).then(handleOrderSearchSuccess, handleOrderSearchFailure)
        };

        OrderService.clearLocal();
        WaiverStatus.reset();

    });
