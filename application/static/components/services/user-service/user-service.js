'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.login:UserService
 * @description
 * # UserService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
    .service('UserService', ['$rootScope', '$http', '$location', 'StorageService', 'PromiseFactory',
        function ($rootScope, $http, $location, StorageService, PromiseFactory) {
            var self = this;

            var currentUser;

            self.login = function (username, password) {
                var credentials = {
                    'username': username,
                    'password': password
                };

                return $http.post('/api/tokens', credentials)
                    .success(function (data) {
                        StorageService.setAuthToken(data.token, data.verified);
                        StorageService.handleSet('role', data.role);
                        StorageService.handleSet('employeeNumber', username);
                        StorageService.handleSet('employeePin', password);
                        console.log(data);

                    })
                    .error(function () {
                        self.removeUserInfo();
                    });
            };

            self.managerAuth = function (username, password) {
                var deferred = PromiseFactory.getInstance();
                var credentials = {
                    'username': username,
                    'password': password
                };
                $http.post('/api/tokens', credentials)
                    .success(function (data) {
                        deferred.resolve(data);
                    }).error(function (error) {
                        console.log(error);
                        deferred.reject(error);

                    });
                return deferred.promise
            };

            self.ClockIn = function (username, password, type) {
                var deferred = PromiseFactory.getInstance();
                var credentials = {
                    'username': username,
                    'password': password
                };
                //first cache logged in user token
                StorageService.handleSet('temp_authToken', StorageService.handleGet('authToken'))
                StorageService.handleSet('temp_role', StorageService.handleGet('role'))

                $http.post('/api/tokens', credentials)
                    .success(function (result) {
                        StorageService.setAuthToken(result.token, result.verified);
                        StorageService.handleSet('role', result.role);

                        var eventType={
                            'eventType':type
                        };

                       $http.post('/api/timeclock/events',eventType)
                           .success(function (data){

                           deferred.resolve(data)

                        }).error(function(error){
                            deferred.reject(error)
                       })
                        .finally(function(){
                            StorageService.handleSet('authToken', StorageService.handleGet('temp_authToken'))
                            StorageService.handleSet('role', StorageService.handleGet('temp_role'))
                            StorageService.handleSet('temp_role', null)
                            StorageService.handleSet('temp_authToken', null)
                        });



                    })
                    .error(function (error) {
                            deferred.reject(error)
                    });

                    return deferred.promise
            };

            self.logout = function () {
                $http.delete('/api/tokens/' + StorageService.getAuthToken())
                    .finally(function () {
                        self.removeUserInfo();
                        // NavHeaderService.setShowSignWaiverButton(currentUser);
                    });

            };

            self.redirectToHome = function () {
                // if current location is an account page, redirect to home page.
                if ($location.path().indexOf('/account/') !== -1) {
                    $location.path('/');
                }
            };

            self.createAccount = function (userProfile) {
                var profile = {
                    'id': userProfile.id,
                    'firstName': userProfile.firstName,
                    'lastName': userProfile.lastName,
                    'birthday': userProfile.birthday, // yyyy-MM-dd
                    'email': userProfile.email,
                    // 'password':'',
                    // 'password': userProfile.password,
                    'phoneNumber': userProfile.phone,
                    'gender': userProfile.gender // 'male' or 'female'
                };

                if (userProfile.password) {
                    profile.password = userProfile.password;
                }

                return $http.post('/api/customers', profile);
            };

            self.createMinorForGuest = function (custId, minor) {
                var req = {
                    'firstName': minor.firstName,
                    'lastName': minor.lastName,
                    'birthday': minor.birthday, // yyyy-MM-dd
                    'gender': minor.gender // 'male' or 'female'
                };

                console.log('minor req string: ' + JSON.stringify(req))

                return $http.post('/api/customers/' + custId + '/minor', req);
            };

            self.createMinor = function (minor) {
                var req = {
                    'firstName': minor.firstName,
                    'lastName': minor.lastName,
                    'birthday': minor.birthday, // yyyy-MM-dd
                    'gender': minor.gender // 'male' or 'female'
                };

                return $http.post('/api/customers/' + currentUser.id + '/minor', req);
            };

            self.customerSearch = function (kvps) {

                var qs = '';

                angular.forEach(kvps, function (value, key) {
                    qs += '?' + key + '=' + value;

                })

                return $http.get('/api/customers' + qs);
            }

            self.updatePassword = function (userId, password, newPassword) {
                var passwords = {
                    'oldPassword': password,
                    'newPassword': newPassword
                };

                return $http.put('/api/customers/' + userId + '/password', passwords);
            };

            self.isUserLoggedIn = function () {
                return (StorageService.getAuthToken()) ? true : false;
            };

            self.getUserById = function (id) {
                var deferred = PromiseFactory.getInstance();
                return $http.get('/api/customers/' + id)
                    .success(function (data) {
                        currentUser = data;
                        deferred.resolve(currentUser);
                    })
                    .error(function (error) {
                        self.removeUserInfo();
                        deferred.reject(error);
                    })
            };

            self.getCurrentUser = function () {
                var deferred = PromiseFactory.getInstance();
                if (StorageService.getAuthToken()) { // logged in

                    if (!currentUser) { // if no local user data exists, get it
                        // $http.get('/api/customers/profile/' + StorageService.getAuthToken())
                        $http.get('/api/tokens/current-user')
                            .success(function (data) {
                                currentUser = data;
                                deferred.resolve(currentUser);
                            })
                            .error(function (error) {
                                self.removeUserInfo();
                                deferred.reject(error);
                            })
                            .finally(function () {
                                // NavHeaderService.setShowSignWaiverButton(currentUser);
                            });
                    } else { // if local user data exists, just return that
                        deferred.resolve(currentUser);
                        // NavHeaderService.setShowSignWaiverButton(currentUser);
                    }
                } else { // not logged in
                    deferred.reject('Not logged in.');
                    // NavHeaderService.setShowSignWaiverButton(null);
                }

                return deferred.promise;
            };

            self.getCurrentUserId = function () {
                var deferred = PromiseFactory.getInstance();

                self.getCurrentUser()
                    .success(function (customerData) {
                        deferred.resolve(customerData.id);
                    })
                    .error(function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            self.verifyAccount = function (email, code) {
                var body = {
                    'email': email,
                    'code': code,
                    'token': StorageService.getUnverifiedToken()
                };
                return $http.post('/api/verification/email', body)
                    .success(function () {
                        StorageService.setAuthToken(StorageService.getUnverifiedToken(), true);
                        self.getCurrentUser()
                            .success(function () {
                                self.displayGreeting();
                            });
                    });
            };

            self.removeUserInfo = function () {
                self.redirectToHome();

                StorageService.setAuthToken(null, true);
                currentUser = undefined;
            };

            self.requestPasswordReset = function (emailAddress) {
                var body = {
                    'emailAddress': emailAddress
                };

                return $http.post('/api/customers/password/reset', body);
            };

            self.submitPasswordReset = function (emailAddress, newPassword, token) {
                var body = {
                    'emailAddress': emailAddress,
                    'newPassword': newPassword,
                    'token': token
                };

                return $http.put('/api/customers/password/reset', body);
            };

            self.displayGreeting = function () {
                $rootScope.$broadcast('loginGreetingCheck', currentUser);
            };

        }]);
