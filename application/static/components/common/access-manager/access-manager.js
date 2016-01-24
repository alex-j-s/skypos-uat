/*
1. Should listen for route change and determine access/access type from user
2. Should listen for is logged in or not
*/

angular.module('skyZoneApp')
    .constant('API_ENDPOINTS', {
        'dev': 'https://skyzone-epic-dev.herokuapp.com',
        'qa': 'https://skyzone-epic-qa.herokuapp.com',
        'prod': 'https://skyzone-epic.herokuapp.com'
    })
    .constant('PUBLIC_TOKENS', {
        'user': '2dc55cdd-6f10-4303-bf9f-17c1565698c2',
        'pos': '51caeb84-3d49-4d16-ba10-37d54b16-4022d3a73499'
    })
    .constant('USER_ROLES', {
    	'all': '*',
        'public': 'public',
        'pos_sys': 'pos_sys',
        'pos_user': 'pos_user',
        'pos_mgr': 'pos_mgr'
    })
    .constant('SHARED_SECRETS', {
        'public': 'f3bPSp084tTet4ApWoQ0qauSEhrDh1xfcubFrUXzVsKn4vq54xvTH5Kk2NY4SUt',
        'pos_sys': 'CSHHIrq63PMeow8EaF1kC48w5mgs8ESiyT74Mw8N6J2Jj8PYqec3xy1ZwcYjOBH',
        'pos_user': 'PfmiJs44uxPoT7xDsoHZV28AFSQrJ4FnRZRKUEM2Y2fE9hzzIFlYFukHYcSHZ8C',
        'pos_mgr': 'vm8OZ5ahZjEakOJWg73Et9v3Z27L0gxTpw5UWFlWn9sjMeCn1CiJvcJnuWw0ajc'
    })
    .factory('authInterceptor', ['$q', 'HmacService', 'StorageService', 'EndpointType', 'ENV', 'API_ENDPOINTS', 'PUBLIC_TOKENS', 'USER_ROLES', 'SHARED_SECRETS',
        function($q, HmacService, StorageService, EndpointType, ENV, API_ENDPOINTS, PUBLIC_TOKENS, USER_ROLES, SHARED_SECRETS) {

            return {
                request: function(config) {
                    if (config.url.indexOf('/api/') !== -1) {
                        config.url = API_ENDPOINTS[ENV] + config.url;
                        //config.url = 'http://Localhost:5000'+config.url;
                        config.url = config.url.replace('/api', '');
                        config.headers = config.headers || {};
                        // Only put Content-Type when sending data
                        // put data in JSON format

                        // Set Content-MD5 header
                        if (config.data) {
                            config.headers['Content-Type'] = 'application/json; charset=UTF-8';
                            console.log('data: ', config.data);
                            if (config.data.signature) {
                                config.headers['X-Order-Signature'] = config.data.signature;
                                delete config.data.signature;
                                if (config.data.id) {
                                    delete config.data.id;
                                }
                            }
                            config.data = JSON.stringify(config.data);
                            config.headers['Content-MD5'] = CryptoJS.MD5(config.data);
                        }

                        console.log('AUTH INTERCEPTER', config);
                        // set XApiKey, if nonpublic token exists, use that
                        var posAuthToken = '51caeb84-3d49-4d16-ba10-37d54b16-4022d3a73499';
                        var publicAuthToken = '2dc55cdd-6f10-4303-bf9f-17c1565698c2';
                        var authToken = StorageService.getAuthToken();
                        console.log(authToken);
                        config.headers['X-ApiKey'] = (authToken && (config.url.indexOf('tokens') < 0 || config.url.indexOf('tokens/current-user') > 0)) ? authToken : posAuthToken;
                        config.headers['X-ApiKey'] = EndpointType.isPublic(config.url) ? publicAuthToken : config.headers['X-ApiKey'];
                        config.headers['X-Date'] = new Date();

                        var hmac64 = HmacService.getHmacFromRequest(config);
                        var role = StorageService.handleGet('role');
                        console.log(role)
                        role = (role && (config.url.indexOf('tokens') < 0 || config.url.indexOf('tokens/current-user') > 0)) ? role : 'pos_sys';
                        role = EndpointType.isPublic(config.url) ? 'public' : role;
                        if (config.headers['X-ApiKey'] === posAuthToken) {
                            role = 'pos_sys';
                        }
                        // else if (authToken !== publicAuthToken){
                        //   channel = 'pos_user';
                        // } 
                        config.headers.Authorization = role + ':' + hmac64;

                        console.log(config.headers);
                    }
                    return config;
                },
                response: function(response) {
                    if (response.status === 401) {
                        //handle unauthorized case
                    }
                    return response || $q.when(response);
                }
            };
        }
    ])
    .service('Session', function(PUBLIC_TOKENS) {
        this.create = function(token, role, verified) {
            this.verified = verified;
            this.token = token;
            // this.userId = userId;
            this.role = role;
        };
        this.destroy = function() {
            this.verified = false;
            this.token = PUBLIC_TOKENS['pos_sys'];
            this.role = 'pos_sys';
        };
    })
    .service('AccessManager', 
    	['$http', '$location', '$rootScope', 'ProfileService', 'PromiseFactory', 'StorageService', 'Session', 'USER_ROLES', 'PUBLIC_TOKENS',
            function($http, $location, $rootScope, ProfileService, PromiseFactory, StorageService, Session, USER_ROLES, PUBLIC_TOKENS) {
                return {
                    reset: function(roleKey) {
                        StorageService.handleSet('role', USER_ROLES[roleKey]);
                        StorageService.handleSet('authToken', PUBLIC_TOKENS[StorageService.handleGet('role')]);
                        Session.destroy();
                        $location.path('/login');
                    },
                    isAuthenticated: function() {
                        return !!Session.token;
                    },
                    isAuthorized: function(authorizedRoles) {
                        if (!angular.isArray(authorizedRoles)) {
                            authorizedRoles = [authorizedRoles];
                        }

                        return (this.isAuthenticated() &&
                            authorizedRoles.indexOf(Session.role) !== -1);
                    },
                    authenticate: function(username, password) {
                        var credentials = {
                            'username': username,
                            'password': password
                        };

                        // var credentials = {
                        //     'username': '111111',
                        //     'password': '1234'
                        // };

                        return $http.post('/api/tokens', credentials)
                            .success(function(data) {
                            	console.log(data);
                            	Session.create(data.token, data.role, data.verified);
                                StorageService.setAuthToken(data.token, data.verified);
                                StorageService.handleSet('role', data.role);
                                  // StorageService.handleSet('employeeNumber', username);
                                  // StorageService.handleSet('employeePin', password);
                            })
                            .error(function() {

                            	$rootScope.$broadcast('szeError', 'Login Failed: Incorrect Employee Number or PIN. Please try again.');
                            });
                    }
                }
            }])
