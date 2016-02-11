'use strict';

/**
 * @ngdoc overview
 * @name skyZoneApp
 * @description
 * # skyZoneApp
 *
 * Main module of the application.
 */
angular
    .module('skyZoneApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'mm.foundation',
        'ui.bootstrap',
        'formlyBootstrap',
        'monospaced.qrcode',
        'mgo-angular-wizard',
        'formly'
    ])
    .constant('ENV', 'dev')
    .constant('ERROR_MESSAGE', {
        'LOGIN_FAILED':'',
        'SCREEN_UNAVAIL_CUST_ACT_REQUIRED':''
    })
    .config(['$routeProvider', 'USER_ROLES', function($routeProvider, USER_ROLES) {


        $routeProvider
        // Entry points to events flow
        //  from ios will have park, guest, product, and start time
        //  => process order: create, update, addOrderItem
        //  => route to jumpers
            .when('/login/:parkUrlSegment', {
                resolve: {
                    Park: ParkResolve,
                    UserCredentials: function(StorageService){
                        if(StorageService.handleGet('employeeNumber')){
                            return {
                                'employeeNumber': StorageService.handleGet('employeeNumber'),
                                'employeePin': StorageService.handleGet('employeePin')
                            };
                        }
                        else{
                            return false;
                        }
                    }
                },
                data: {
                    authorizedRoles: [USER_ROLES.all]
                },
                templateUrl:'static/components/employee-login/login.html',
                controller:'SPLoginController' 
            })
            .when('/skypos/start/:parkUrlSegment', {
                resolve: {
                    Park: ParkResolve
                },
                data: {
                    authorizedRoles: [USER_ROLES.all]
                },
                templateUrl:'static/components/skypos-start/start-layout.html',
                controller:'SPStartController' 
            })
            .when('/skypos/clockin/:parkUrlSegment', {
                resolve: {
                    Park: CachedParkResolve
                },
                data: {
                    authorizedRoles: [USER_ROLES.all]
                },
                templateUrl:'static/components/skypos-clockin/clockin-layout.html',
                controller:'SPClockinController'
            })
            .when('/skypos/activity/:parkUrlSegment', {
                resolve:{
                    Park:CachedParkResolve,
                    Activities:ActivitiesResolve
                },
                data: {
                    authorizedRoles: [USER_ROLES.pos_mgr, USER_ROLES.pos_user]
                },
                templateUrl:'static/components/skypos-activity/activity-layout.html',
                controller:'SPActivityController'
            })
            .when('/skypos/guest/:parkUrlSegment/:reservationId/:productId/:quantity', {
                resolve:{
                    Park:CachedParkResolve,
                    Order:function(){return false;}
                },
                data: {
                    authorizedRoles: [USER_ROLES.pos_mgr, USER_ROLES.pos_user]
                },
                templateUrl:'static/components/skypos-guest/guest-layout.html',
                controller:'SPGuestController'
            })
            .when('/skypos/guest/:parkUrlSegment', {
                resolve:{
                    Park:CachedParkResolve,
                    Order:function(){return false;}
                },
                templateUrl:'static/components/skypos-guest/guest-layout.html',
                controller:'SPGuestController'
            })
            .when('/skypos/jumpers/:parkUrlSegment/:guestId/:orderId', {
                resolve:{
                    Park:CachedParkResolve,
                    Order:OrderResolve,
                    Guest:GuestResolve,
                    Waiver:WaiverResolve
                },
                data: {
                    authorizedRoles: [USER_ROLES.pos_mgr, USER_ROLES.pos_user]
                },
                templateUrl:'static/components/skypos-jumpers/jumpers-layout.html',
                controller:'SPJumpersController'
            })
            .when('/skypos/offers/:parkUrlSegment', {
                resolve:{
                    Catalog:CatalogResolve,
                    Park:CachedParkResolve,
                    Order:NewOrderResolve,
                    Guest:function(){return false;}
                },
                data: {
                    authorizedRoles: [USER_ROLES.pos_mgr, USER_ROLES.pos_user]
                },
                templateUrl:'static/components/skypos-offers/offers-layout.html',
                controller:'SPOffersController'
            })
            .when('/skypos/offers/:parkUrlSegment/:orderId', {
                resolve:{
                    Catalog:CatalogResolve,
                    Park:CachedParkResolve,
                    Order:OrderResolve,
                    Guest:function(){return false;}
                },
                data: {
                    authorizedRoles: [USER_ROLES.pos_mgr, USER_ROLES.pos_user]
                },
                templateUrl:'static/components/skypos-offers/offers-layout.html',
                controller:'SPOffersController'
            })
            .when('/skypos/offers/:parkUrlSegment/:guestId/:orderId', {
                resolve:{
                    Catalog:CatalogResolve,
                    Park:CachedParkResolve,
                    Order:OrderResolve,
                    Guest:CachedGuestResolve
                },
                data: {
                    authorizedRoles: [USER_ROLES.pos_mgr, USER_ROLES.pos_user]
                },
                templateUrl:'static/components/skypos-offers/offers-layout.html',
                controller:'SPOffersController'
            })
            .when('/skypos/payment/:parkUrlSegment/:guestId/:orderId', {
                resolve:{
                    Park:CachedParkResolve,
                    Order:OrderResolve,
                    Guest:CachedGuestResolve
                },
                data: {
                    authorizedRoles: [USER_ROLES.pos_mgr, USER_ROLES.pos_user]
                },
                templateUrl:'static/components/skypos-payment/payment-layout.html',
                controller:'SPPaymentController'
            })
            .when('/skypos/hardware-config', {
                data: {
                    authorizedRoles: [USER_ROLES.all]
                },
                templateUrl: 'static/components/skypos-hardware/hardware-config-layout.html',
                controller:'SPHardwareConfigController'
            })
        .otherwise({
          redirectTo: '/login/tor'
        });
    }])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('triPOSAuthInterceptor');
    }])
    .run(['$rootScope', '$timeout', '$location', 'formlyConfig', 'UserService', 'AccessManager', 'USER_ROLES', 'PrintService','VerifoneService','EpsonService','BocaService','AveryDennisonService',  
        function($rootScope, $timeout, $location, formlyConfig, UserService, AccessManager, USER_ROLES, PrintService, VerifoneService,EpsonService,BocaService,AveryDennisonService) {
        AccessManager.reset('pos_sys');
        
        console.log('run')
        
        
       setTimeout(function () {
           VerifoneService.connect();
       }, 3100)
       
       setTimeout(function () {
        VerifoneService.clearAndShowIdle();   
       }, 4000);
    
    setTimeout(function() {
        EpsonService.connect();
    },3000);
    
    // setTimeout(function() {
    //     EpsonService.printReciept(null);
    // },5000);
    
    // setTimeout(function() {
    //     EpsonService.disconnect();
    // },6000);
    
    setTimeout(function() {
        BocaService.connect();
        AveryDennisonService.connect();
    },3000);
    
    // setTimeout(function() {
    //     BocaService.printTicket();
    // },5000);
    
    // setTimeout(function() {
    //     BocaService.disconnect();
    // },6000);
        
        
        $rootScope.$on('$routeChangeStart', function(e, next, previous) {
            console.log(next)
            if(next.data){
                var authorizedRoles = next.data.authorizedRoles;
                if(authorizedRoles[0] !== USER_ROLES.all && !AccessManager.isAuthorized(authorizedRoles)){
                    e.preventDefault();
                    //if authenticated raise unauthorized event
                    //else raise unauthenticated event
                    alert('Unauthorized!')
                }
                
            }
        });

        formlyConfig.setType({
            name: 'date',
            templateUrl: 'static/components/event-guests/birthday-form-control.html'
        })
    }])
.filter('ampm', function(){
    return function(input){

        var hrs = input.split(':')[0];
        var hrsInt = parseInt(hrs);
        var min = input.split(':')[1];

        if(hrsInt > 12){
            hrs = ''+(hrsInt-12)+':';
            min += ' PM';
        }
        else if(hrsInt === 12){
            hrs += ':';
            min += ' PM';
        }
        else if(hrsInt === 0){
            hrs = '12:';
            min += ' AM';
        }
        else{
            hrs += ':';
            min += ' AM';
        }

        return hrs+min;
    }   
});












