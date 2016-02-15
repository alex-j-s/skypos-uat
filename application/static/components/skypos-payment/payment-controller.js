'use strict';

angular.module('skyZoneApp')
    .controller('SPPaymentController',['$scope', '$modal', '$rootScope', '$q', '$location','$filter','Park', 'Guest', 'Order', 'GiftCardsService', 'OrderService','EpsonService','BocaService','AveryDennisonService','VerifoneService', 'NavService','UserService','WaiverStatus','RFIDReaderService','TriPOSService',
    	function($scope, $modal, $rootScope, $q, $location, $filter, Park, Guest, Order, GiftCardsService, OrderService, EpsonService,BocaService,AveryDennisonService,VerifoneService, NavService,UserService, WaiverStatus,RFIDReaderService, TriPOSService){

    	console.log("PARK:", Park);
    	console.log("ORDER: ", Order);
    	console.log("GUEST: ", Guest);


        function logErrorStopLoading(err) {
            $rootScope.$broadcast('szeHideLoading');
            $rootScope.$broadcast('szeError', 'Failed to process order: '+JSON.stringify(err));
            $scope.showModal = false;
        }


    	$scope.order = Order;
    	$scope.guest = Guest;
    	$scope.park = Park;
        
        $scope.returnOrder;
        $rootScope.hasReturn = false;
        
        $scope.hasReturn = function(){
          return $rootScope.hasReturn;  
        };

		$scope.showModal = false;

        $scope.isEditable = false;
            $scope.modelTitle='';

        // order update
        $rootScope.$on('szeOrderUpdated', function(event,order) {
            console.log('order updated: ', order);
            $scope.order = order;
            $rootScope.$broadcast('szeHideLoading');
        });

		$scope.toggleModal = function(type){
            $scope.modelType = type;
            $scope.modelTitle='';
			$scope.showModal = !$scope.showModal;
		};

        ////////// ORDER STATUS //////////
        $scope.orderInProgress = function(e) {
            return $scope.order.status == 'In Progress' || $scope.order.status == 'Reserved';
        };

        $scope.orderCancelled = function(e) {
            return $scope.order.status == "Cancelled";
        }

        $scope.orderPurchased = function(e) {
            return $scope.order.status == 'Purchased';
        }

        ////////// END ORDER STATUS //////////
        
        ////////// HARDWARE INTEGRATION ///////////
        $scope.printReciept = function(order) {
            // $scope.order = order;

            // display message for change:

            var def = $q.defer();

            
            var promArray = [];


            angular.forEach(order.payments, function(payment) {
                if ( payment.recordType.name == 'Gift Card' ) {
                    promArray.push(GiftCardsService.getBalance(payment.giftCardNumber).then(function(result) {
                        payment.balance = result.data.balance;
                    }, function(err) {
                        console.log('error getting gift card balance: ', err);
                    }));
                    
                }
            });

            var printReciepts = function() {
                if ( $scope.orderPurchased() || $scope.returnOrder ) {
                EpsonService.printReciept(order,$scope.park,$scope.guest,"Sky Zone Copy","SALE",true);
                EpsonService.printReciept(order,$scope.park,$scope.guest,"Customer Copy","SALE",false);
                    if ( $scope.returnOrder ) {
                        EpsonService.printReturnReciept($scope.returnOrder,$scope.park,$scope.guest,"Sky Zone Copy","RETURN",true);
                        EpsonService.printReturnReciept($scope.returnOrder,$scope.park,$scope.guest,"Customer Copy","RETURN",false);
                    }
                }   
                //return $q.when(order);
            }

            $q.all(promArray).then(function(results) {
                  printReciepts();
                  def.resolve(order);
            }, function(err) {
                printReciepts();
                def.reject(err)
            })

            return def.promise;

        };

        $scope.getAgeGroup = function(dateString) {
            var today = new Date();
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if ( m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ) {
                age--;
            }
            //return age;
            if ( age <= 4 ) {
                return 'A';
            } else if ( age <= 10 ) {
                return 'B'
            } else if ( age <= 15 ) {
                return 'C';
            } else {
                return 'D'
            }
 
        }
        
        $scope.printTicket = function(order) {

            var def = $q.defer();

            console.log('*****PRINTING TICKET: ', order);

            if ( order == undefined ) { return; }

            var participants = angular.copy(order.participants);

            angular.forEach(participants, function(p) {
                var resId = p.reservationItemId;
                var reservation = p.reservation;
                UserService.getUserById(p.id)
                    .then(function(result) {
                        var participant = result.data;
                        angular.forEach(order.orderItems, function(item) {
                            angular.forEach(item.reservation.reservationItems, function(rItem) {
                                if ( rItem.id === resId ) {
                                    participant.reservation = item.reservation;
                                    participant.product = item.product;
                                    participant.reservationItem = rItem;
                                }
                            });
                        })

                        if ( participant.reservation == null || participant.reservation.reservationItems == null || $scope.returnOrder ) {
                            // do not print
                            console.log('NOT PRINTING TICKETS');
                        } else {
                            var parkName = order.parkName;
                            var startTime = $scope.toTimeString(participant.reservationItem.startTime);
                            var endTime = $scope.toTimeString(participant.reservationItem.endTime);
                            var productName = participant.product.name;
                            var date = $filter('date')(participant.reservation.startDate,'fullDate');
                            var customerFirstInitial = participant.firstName.charAt(0).toUpperCase();
                            var customerLastName = participant.lastName;
                            var ageGroup = $scope.getAgeGroup(participant.getAgeGroup);
                            var marketingText = $scope.park.receiptFreeText == null ? "" : $scope.park.receiptFreeText;

                            BocaService.printTicket(parkName,startTime,endTime,productName,date,customerFirstInitial,customerLastName,ageGroup,marketingText);
                            AveryDennisonService.printTicket(parkName,startTime,endTime,productName,date,customerFirstInitial,customerLastName,ageGroup,marketingText);
                        }

                        def.resolve(order);

                    }, function(err) {
                        def.reject(err);
                    });
            });

            return def.promise;
        }
           
        
        $scope.toTimeString= function(str) {
            var a = str.split(':')
            var d = new Date();
            d.setHours(a[0]);
            d.setMinutes(a[1]);
            return $filter('date')(d,'shortTime');
        }
        
        $scope.tagData = '';
        $scope.getRFIDTag = function() {
            RFIDReaderService.readTag(function(tag) {
                $scope.tagData = tag;
                $scope.$apply();
            },function(errMessage) {
                $scope.tagData = errMessage; 
                $scope.$apply();
            });
        }

        ////////// END HARDWARE INTEGRATION ///////////
        
        $scope.noSale = function() {
            $scope.modelType = 'noSale';
            $scope.modelTitle='No Sale Reasons';
			$scope.showModal = !$scope.showModal;
            
           EpsonService.popDrawer();  
        };
        
        
        $scope.managerDiscountApproval = function(pct, amt) {
            $scope.modelType = 'manager-auth-discount';
            $scope.modelTitle='manager-auth-discount';
			$scope.showModal = true;

            $scope.discountValuePct = pct;
            $scope.discountValueAmt = amt;
        };
        $scope.managerDiscount = function(){
        	

            var disco = {
                'managerNumber':$scope.auth.managerId,
                'managerPin':$scope.auth.managerPin,
                'managerDiscountValue':($scope.discountValuePct && $scope.discountValuePct.length > 0)?$scope.discountValuePct:$scope.discountValueAmt,
                'managerDiscountReason':'',
                'valueInPercent':($scope.discountValuePct && $scope.discountValuePct.length > 0)?true:false
            }


            $scope.verifyManagerPin().then(function(role){
                if(role === 'pos_mgr'){
                    OrderService.addManagerDiscount($scope.order.id, OrderService.createManagerDiscount(disco)).then(function(result){
                        $scope.order = result;
                    }, logErrorStopLoading)
                }   
            }, logErrorStopLoading)
        }

        $scope.managerApprovel = function() {
            $scope.modelType = 'manager-auth';


            $scope.showModal = true;

        };

        ////////// CASH //////////

        $scope.getNumberString = function(value) {
            return $filter('currency')(value / 100);
        };

        $scope.cashInput = $scope.order.totalAmountDue;

        $scope.getChangedOwed = function() {
            var change = ($scope.cashInput) - $scope.order.totalAmountDue;
            return $filter('currency')(change);
        }

        $scope.submitCashPayment = function(amount) {
            console.log('submitting cash payment: ', amount);

            var changeDue = (amount) - $scope.order.totalAmountDue;

            var payload = OrderService.createCashPayment(amount);

            $rootScope.$broadcast('szeDismissError')
            $rootScope.$broadcast('szeShowLoading');
            OrderService.addCashPayment($scope.order.id, payload)   //.then(OrderService.updateOrderStatus,logErrorStopLoading)
                .then(function(order) {
                    console.log('order updated cash', order)
                    $rootScope.$broadcast('szeHideLoading');
                    // setTimeout($scope.printReciept,3000);
                }, logErrorStopLoading);
        };

        $scope.creditCardDataComplete = function() {
            return $scope.cashInput <= 0 
        }


        ////////// END CASH //////////

        ////////// GIFTCARD MODAL //////////

        $scope.giftCard = {
            'giftCardNumber': null,
            'amount': $scope.order.totalAmountDue
        }
        $scope.selectedGiftCardField = 'giftCardNumber';

        $scope.submitGiftCardPayment = function() {
            console.log('submitting giftcard payment: ', $scope.giftCard.giftCardNumber, $scope.giftCard.amount);

            var payload = OrderService.createGiftCardPayment($scope.giftCard.giftCardNumber,$scope.giftCard.amount);

            $rootScope.$broadcast('szeShowLoading');

            $rootScope.$broadcast('szeDismissError')
            OrderService.addGiftCardPayment($scope.order.id, payload)   //.then(OrderService.updateOrderStatus,logErrorStopLoading)
                .then(function(order) {
                    //console.log('order updated gift card', order)
                    $rootScope.$broadcast('szeHideLoading');
                    // setTimeout($scope.printReciept,3000);
                }, logErrorStopLoading);
            
            $scope.giftCard = {
                'giftCardNumber': null,
                'amount': $scope.order.totalAmountDue
            }
            $scope.selectedGiftCardField = 'giftCardNumber';

            $scope.showModal = false
        };

        $scope.giftCardDataComplete = function(e) {
            return !$scope.giftCard.giftCardNumber || $scope.giftCard.amount <= 0;
        }


        $scope.giftCardFieldFocused = function(field) {
            console.log('focused: ', field);
            $scope.selectedGiftCardField = field;
        }

        $scope.getGiftCardBalance = function(cardNumber) {
            GiftCardsService.getBalance(cardNumber).then(function(result) {
                console.log('giftcard balance result: ', result);
            }, function(err) {
                console.log('giftcard balance error: ', err);
            })
        }

        ////////// END GIFT CARD //////////

        ////////// CREDIT CARD MODAL //////////
        $scope.card = {
            'ccn':null,
            'expM':null,
            'expY':null,
            'cvv':null,
            'zip':null,
            'trackData':null,
            'ksn':null,
            'pinBlock':null,
            'amount':$scope.order.totalAmountDue
        }

        $scope.selectedCreditField = 'ccn'
        $scope.capturingPayment = false;

        $scope.creditCardDataComplete = function(e) {
            return !$scope.card.ccn ||
                    !$scope.card.expM ||
                    !$scope.card.expY ||
                    !$scope.card.cvv ||
                    !$scope.card.zip ||
                    $scope.card.amount <= 0;
        }
        $scope.creditFieldFocused = function(field) {
            console.log('focused')
            $scope.selectedCreditField = field;
        }

        $scope.submitCreditCardPayment = function() {
            console.log('card: ', $scope.card);
        
            var payload = OrderService.createCreditCardPayment($scope.card,$scope.card.amount);
            
            console.log('payload: ', payload);

            $rootScope.$broadcast('szeShowLoading');

            $rootScope.$broadcast('szeDismissError')
            OrderService.addCreditCardPayment($scope.order.id,payload)  //.then(OrderService.updateOrderStatus,logErrorStopLoading)
                .then(function(order) {
                    $rootScope.$broadcast('szeHideLoading');
                    // setTimeout($scope.printReciept,3000);
                }, logErrorStopLoading);

            $scope.card = {
                'cnn':null,
                'expM':null,
                'expY':null,
                'cvv':null,
                'zip':null,
                'amount':$scope.order.totalAmountDue
            }
            $scope.selectedCreditField = 'ccn';

            $scope.showModal = false;
        };
        
        
        ////////// END CREDIT CARD MODAL //////////

        ////////// CARD CAPTURE /////////

        $scope.kickOffPaymentProcess = function() {
          $rootScope.$broadcast('szeDismissError');
          console.log('capturing payment information from verifone');
          $scope.capturingPayment = true;
          $scope.card.amount = $scope.order.totalAmountDue;
          //var amountString = $filter('currency')($scope.order.totalAmountDue);
          $rootScope.$broadcast('szeShowLoading');
          
          TriPOSService.swipeCard($scope.card.amount).then(function(data) {
      	    console.log('payment capture compelte: ', data); 
      	 // data.approvedAmount =$scope.card.amount; //for testing purpose remove it later
              $scope.capturingPayment = false;
              var payload = OrderService.swipeCreditORDebitCardPayment(data)
              OrderService.addCreditCardPayment($scope.order.id,payload)
              	.then(function(order) {
              	 $rootScope.$broadcast('szeHideLoading');
                 $scope.printReciept(order)
                 $scope.printTicket(order)
                  $scope.attemptCompleteOrder();
              },function(err) {
                  logErrorStopLoading(err);
              });    
        },function(err) {
            logErrorStopLoading(err);
        });  
          
        };
        
        $scope.processCardPresentPayment = function(data) {
            switch ( data.paymentType ) {
            case ( 'Credit Card' ):
                console.log('data in payment-controller: ', data);
                
                var paymentInfo = {};
                paymentInfo.trackData = '%' + data.track1Data + '?;' +data.track2Data + '?';
                var payload = OrderService.createCreditCardPayment(paymentInfo,$scope.card.amount);
                
                console.log('creditcard payload: ', payload);
                
                OrderService.addCreditCardPayment($scope.order.id,payload)
                    .then(function(order) {
                        VerifoneService.completePayment('Payment Accepted!', function() { return null; });
                        $scope.attemptCompleteOrder();
                    },function(err) {
                        logErrorStopLoading(err);
                        VerifoneService.completePayment('Failed To Process', function() { return null; });
                    });          
                break;
            case ( 'Gift Card' ):
                var track = data.track2Data;
                console.log('gift card track data: ', track);
                var number = track.split('=')[0].replace('603359','');
                console.log('giftcard numnber: ', number);
                
                var payload = OrderService.createGiftCardPayment(number,$scope.card.amount);

                //$rootScope.$broadcast('szeShowLoading');

                OrderService.addGiftCardPayment($scope.order.id, payload)   //.then(OrderService.updateOrderStatus, logErrorStopLoading)
                    .then(function(order) {
                        VerifoneService.completePayment('Payment Accepted!',function() { return null; });
                        //setTimeout($scope.printReciept,3000);
                        $scope.attemptCompleteOrder();
                    }, function(err) {
                        logErrorStopLoading(err);
                        VerifoneService.completePayment('Failed To Process',function() { return null; });
                    }); 
                
                break;
            case ( 'Debit Card' ):
                console.log('data in payment-controller DEBIT: ', data);
                
                var paymentInfo = {}
                paymentInfo.trackData = '%' + data.track1Data + '?;' +data.track2Data + '?';
                var rawPinData = data.pinData.substring(5);
                paymentInfo.pinBlock = rawPinData.substring(rawPinData.length - 16);
                paymentInfo.ksn = rawPinData.substring(0,rawPinData.length - 16);
                
                var payload = OrderService.createCreditCardPayment(paymentInfo,$scope.card.amount);
                
                console.log('debit card payload: ', payload);
                
                OrderService.addCreditCardPayment($scope.order.id,payload)
                    .then(function(order) {
                        VerifoneService.completePayment('Payment Accepted!', function() { return null; });
                        $scope.attemptCompleteOrder();
                    },function(err) {
                        logErrorStopLoading(err);
                        VerifoneService.completePayment('Failed To Process', function() { return null; });
                    });          
                break;
            default: 
                setTimeout(function() {
                    VerifoneService.completePayment('Failed To Process',function() { return null; });
                },2000);
            }  
        };

        ////////// CARD CAPTURE /////////

        ////////// CHECK MODAL /////////
        $scope.check = {
            'checkNumber':'',
            'amount':$scope.order.totalAmountDue
        };
        $scope.selectedCheckField = 'checkNumber';
        
        $scope.checkFieldFocused = function(field) {
            $scope.selectedCheckField = field
        };

        $scope.submitCheckPayment = function() {

            $scope.selectedCheckField = 'checkNumber';

            $rootScope.$broadcast('szeDismissError')
            $rootScope.$broadcast('szeShowLoading');
            var payload = OrderService.createCheckPayment($scope.check.amount,$scope.check.checkNumber,$filter('date')(new Date(),'yyyy-MM-dd'));
            
            console.log('check payment: ', payload);
            
            OrderService.addCheckPayment($scope.order.id,payload)   //.then(OrderService.processOrder,logErrorStopLoading)
                .then(function(order) {
                    console.log('order updated check', order)
                    $rootScope.$broadcast('szeHideLoading');
                    // setTimeout($scope.printReciept,3000);
                }, logErrorStopLoading);
            
            $scope.check = {
                'checkNumber':'',
                'amount':$scope.order.totalAmountDue
            }
            
        };

        ////////// END CHECK MODAL /////////

        ////////// Manager-auth modal //////////
            $scope.auth = {
                'managerId':'',
                'managerPin':''
            };

            $scope.selectedAuthField = 'managerId';
            $scope.checkFieldFocused = function(field) {
                $scope.selectedAuthField = field
            };

            $scope.authManager = function() {
                $scope.auth = {
                    'managerId':'',
                    'managerPin':''
                };
                $scope.selectedAuthField = 'managerId';


            };


            $scope.verifyManagerPin =function(){

                var def = $q.defer();

                $rootScope.$broadcast('szeShowLoading');

                    var credentials = {
                    'username': $scope.auth.managerId,
                    'password': $scope.auth.managerPin
                };


                UserService.managerAuth($scope.auth.managerId,$scope.auth.managerPin)
                    .success(function (data) {
                        $rootScope.$broadcast('szeHideLoading');


                                if(data.role==='pos_mgr')
                                {
                                    //TODO:open the till
                                    def.resolve(data.role);

                                }else{
                                    $rootScope.$broadcast('szeError','Authentication fail,You are not authorized to approve no-sale.');
                                }

                    })
                    .error(function (error){
                        $rootScope.$broadcast('szeHideLoading');
                        $rootScope.$broadcast('szeError',error.message);
                    });

                    return def.promise;

            };

        ////////// Manager-auth modal //////////


        ////////// COUPON MODAL //////////

        $scope.submitCouponCode = function(code) {
            console.log('code: ', code );

            $rootScope.$broadcast('szeShowLoading');
            OrderService.addOrderPromoCode($scope.order.id,code).then(function(result) {
               $rootScope.$broadcast('szeHideLoading'); 
            }, function(err) {
                $rootScope.$broadcast('szeHideLoading'); 
                $rootScope.$broadcast('szeError', 'Failed to Apply Coupon Code: ', err);
            });
        };

        ////////// END COUPON MODAL //////////


        ////////// NAV //////////

            $scope.attemptCompleteOrder = function(){
                //handle errors if not ready to complete

                $rootScope.$broadcast('szeShowLoading');

                console.log('order on attempt to compelte: ', $scope.order);
                console.log('rootScope order: ', $rootScope.order);

                $rootScope.$broadcast('szeDismissError')
                if(!WaiverStatus.allSigned()){
                    $rootScope.$broadcast('szeHideLoading');
                    $rootScope.$broadcast('szeConfirm', {
                        title: 'Waivers Not Complete',
                        message: 'All waivers must be signed and approved before compeleting the order. Go to Jumpers screen now?',
                        confirm: {
                            label: 'Go to Jumpers',
                            action: function($clickEvent) {
                                NavService.goToRoute('jumpers', {
                                    'parkUrlSegment':Park.parkUrlSegment,
                                    'orderId':$scope.order.id,
                                    'guestId':$scope.guest.id
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
                }
                else if ( $scope.order.status != 'Finalized' && $scope.hasRefund($scope.order) ) {
                    //$rootScope.$broadcast('szeError', 'This is a refund order');
                    //var status = ($scope.order.totalPayments > 0) ? 'Deposit Paid' : 'Refunded' ;
                	var status = ($scope.order.totalPayments > 0) ? 'Fully Paid' : 'Refunded' ;
                    OrderService.processOrder($scope.order,status)
                        // .then(function(result) {
                        //     console.log('orderReturned: ', result);
                        // }, logErrorStopLoading)
                        .then($scope.printReciept, logErrorStopLoading)
                        .then($scope.goToStartScreen, logErrorStopLoading)
                        .then(function() { $rootScope.$broadcast('szeHideLoading'); }, logErrorStopLoading);
                }
                else if($scope.order.totalAmountDue > 0){
                    $rootScope.$broadcast('szeError', 'Payment required!')
                    $rootScope.$broadcast('szeHideLoading')
                }
                else{
                    //handle order processing
                    if($scope.order.status === 'In Progress' || $scope.order.status === 'Reserved'
                    || $scope.returnOrder){
                        OrderService.updateOrderStatus($scope.order)
                            .then($scope.printReciept, logErrorStopLoading)
                            .then($scope.printTicket, logErrorStopLoading)
                            .then($scope.goToStartScreen, logErrorStopLoading)
                            .then(function() { $rootScope.$broadcast('szeHideLoading'); }, logErrorStopLoading);
                    }
                    else{
                        console.log('order has probably already been processed (tripos swipe)');
                        $scope.goToStartScreen($scope.order);
                    }
                }
            };
            $scope.goToStartScreen = function(order){

                console.log('order in go to start screen: ', order);

                $rootScope.$broadcast('szeHideLoading')
                
                if(order.paymentStatus === 'Fully Paid' || $scope.hasRefund(order)){

                    if ($scope.hasRefund(order)) {
                        var msg = ($scope.changeDueForReturn(order) > 0)?'Change Due: '+$filter('currency')($scope.changeDueForReturn(order)):'No Change Due.';  
                    } else {
                        var msg = (order.changeDue)?'Change Due: '+$filter('currency')(order.changeDue):'No Change Due.';
                    }

                    

                    $rootScope.$broadcast('szeConfirm', {
                        title: msg,
                        message: 'Activate Gift Cards?',
                        confirm: {
                            label: 'Next',
                            action: function($clickEvent) {
                                //go to start
                                var linkModal = $modal.open({
                                    animation: true,
                                    size:'md',
                                    templateUrl: 'static/components/skypos-payment/skyband-link-modal.html',
                                    link: function(scope, elem, attr){
                                        elem.find('#cardNumber').focus();
                                    },
                                    resolve:{
                                        Order: function(){
                                            return $scope.order;
                                        }
                                    },
                                    controller: 'SPSkyBandLinkCtrl'
                                })

                                linkModal.result.then(function(result){
                                    $location.path('/skypos/start/'+Park.parkUrlSegment);
                                }, function(reason){

                                })
                                
                            }
                        },
                        cancel: {
                            label: 'Activate Gift Card',
                            action: function($clickEvent) {
                                var gcModal = $modal.open({
                                    animation: true,
                                    size:'md',
                                    templateUrl: 'static/components/skypos-payment/gift-card-issuance.html',
                                    link: function(scope, elem, attr){
                                        elem.find('#cardNumber').focus();
                                    },
                                    controller: function($scope, $modalInstance){
                                        $scope.giftCard = {};
                                        $scope.activateGiftCard = function(gc){
                                            $rootScope.$broadcast('szeShowLoading');
                                            GiftCardsService.issueCard(GiftCardsService.createIssueGiftCard(gc.cardNumber, gc.amount, $scope.order.id))
                                                .success(function(result){
                                                    alert(result.resultText)
                                                    if(!result.isFailure){
                                                        $modalInstance.close(result);
                                                    }
                                                    console.log('giftcard issued: ',result);
                                                    $rootScope.$broadcast('szeHideLoading');
                                                })
                                                .error(logErrorStopLoading)
                                        };
                                    }
                                })

                                gcModal.result.then( function (giftCardResult) {
                                    $rootScope.$broadcast('szeShowLoading');
                                    $scope.goToStartScreen(order);
                                }, function(reason){

                                })
                            }
                        }
                    })

                }
            };

            $scope.goToOffersScreen = function(){
                 if($scope.guest){
                NavService.goToRoute('offers', {
                    'parkUrlSegment':Park.parkUrlSegment,
                    'orderId':$scope.order.id,
                    'guestId':$scope.guest.id
                });
            }else{
                NavService.goToRoute('offers', {
                    'parkUrlSegment':Park.parkUrlSegment,
                    'orderId':$scope.order.id
                });
            }

            };

        ////////// END NAV //////////

        ////////// NO SALE //////////

            $scope.showOtherReasonInput = false
            $scope.NOSalesReasons = [{id: 1, label: 'Storing Receipts/Coupons'}, {id: 2, label: 'Making Change'},{id: 3, label: 'Cashing Out'},{id:4,label:'Other - Needs Explanation'}];

            $scope.onOptionChange = function(reason) {
                if (reason.id == 4) {
                    $scope.showOtherReasonInput = true
                }
                else {
                    $scope.showOtherReasonInput = false
                }
            };

            $scope.noSale = function() {
                $scope.modelType = 'noSale';
                $scope.modelTitle='No Sale Reasons';
                $scope.showModal = !$scope.showModal;
                
               EpsonService.popDrawer();  
            };

            $scope.noSaleAvailable = function() {
                return ( $scope.order.orderItems.length < 0 ) || ( $scope.order.payments.length < 0 ) || $scope.status == 'Purchased' || $scope.status == 'Cancelled';
            };


            $scope.noSaleSubmit=function()
            {

            };



        ////////// END NO SALE //////////

        $scope.hasRefund = function(order) {
            var hasRefund = false
            angular.forEach(order.payments,function(payment) {
                if ( payment.paymentType == 'Refund' ) {
                    hasRefund = true;
                }
            });
            return hasRefund;
        }

        $scope.changeDueForReturn = function(order) {
            var total = 0;
            angular.forEach(order.payments, function(payment) {
                if ( payment.paymentType == 'Refund' && payment.recordType.name == "Cash" ) {
                    total += payment.amount
                }
            });
            return total;
        }
	}]);
