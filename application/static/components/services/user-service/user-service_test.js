'use strict';

describe('Service: UserService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var scope, userService, mockBackend, $location, storageService, fakeNavHeaderService, q;

  var token = 'VALIDTOKEN';

  var credentials = {
    'username': 'usr',
    'password': 'test'
  };

  var errorResponse = {
    'message': 'Error',
    'code': 1234
  };

  var loginResponse = {
    'token':token,
    'verified': true
  };

  var customer = {
      'id' : '1',
      'firstName' : 'Joe',
      'lastName' : 'Smith',
      'birthday' : '1970-01-01',
      'email' : 'jsmith@any.com',
      'lastVisitLocationName' : 'Demo SkyZone',
      'lastVisitDate' : '2015-01-01',
      'loyaltyStatusBanner' : '',
      'address' : {
        'street' : '123 Main Blvd',
        'city' : 'Anytown',
        'countryCode' : 'USA',
        'stateCode' : 'PA',
        'postalCode' : '11111'
      },
      'phoneNumber' : '555-555-5555',
      'gender' : 'male',
      'photo' : 'http://qaservices.trifecta.com:8080/SkyZone/images/smith1.jpg'
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, $rootScope, _UserService_, _$location_, _NavHeaderService_, _StorageService_, $q) {
    userService = _UserService_;
    mockBackend = $httpBackend;
    $location = _$location_;
    storageService = _StorageService_;

    spyOn(storageService, 'setAuthToken');
    spyOn(storageService, 'getUnverifiedToken').and.returnValue(token);

    q = $q;
    scope = $rootScope.$new();
    spyOn(scope.$parent, '$broadcast').and.callThrough();

    fakeNavHeaderService = _NavHeaderService_;

    spyOn(fakeNavHeaderService, 'setShowSignWaiverButton');
  }));

  it('onBroadcast: should show greeting upon login', function () {
    userService.displayGreeting();

    expect(scope.$parent.$broadcast).toHaveBeenCalled();
    expect(scope.$parent.$broadcast.calls.count()).toEqual(1);
  });

  it('login: should login successfully and get current user if verified', function () {
    spyOn(userService, 'getCurrentUser').and.returnValue(getPromiseObject(q, customer, true));
    spyOn(userService, 'displayGreeting');
    spyOn(userService, 'removeUserInfo');
    mockBackend.expectPOST('/api/tokens', credentials).respond(201, loginResponse);

    var response;
    var promise = userService.login(credentials.username, credentials.password);

    promise.success(function(data){
      response = data;
    });

    mockBackend.flush();

    expect(response).toEqual(loginResponse);

    expect(storageService.setAuthToken).toHaveBeenCalledWith(loginResponse.token, loginResponse.verified);
    expect(storageService.setAuthToken.calls.count()).toEqual(1);

    expect(userService.getCurrentUser).toHaveBeenCalledWith();
    expect(userService.getCurrentUser.calls.count()).toEqual(1);

    expect(userService.displayGreeting).toHaveBeenCalledWith();
    expect(userService.displayGreeting.calls.count()).toEqual(1);

    expect(userService.removeUserInfo).not.toHaveBeenCalled();
    expect(userService.removeUserInfo.calls.count()).toEqual(0);
  });

  it('login: should login successfully but not get current user', function () {
    spyOn(userService, 'getCurrentUser');
    spyOn(userService, 'displayGreeting');
    spyOn(userService, 'removeUserInfo');
    var unverifiedLoginResponse = angular.copy(loginResponse);
    unverifiedLoginResponse.verified = false;
    mockBackend.expectPOST('/api/tokens', credentials).respond(201, unverifiedLoginResponse);

    var response;
    var promise = userService.login(credentials.username, credentials.password);

    promise.success(function(data){
      response = data;
    });

    mockBackend.flush();

    expect(response).toEqual(unverifiedLoginResponse);

    expect(storageService.setAuthToken).toHaveBeenCalledWith(unverifiedLoginResponse.token, unverifiedLoginResponse.verified);
    expect(storageService.setAuthToken.calls.count()).toEqual(1);

    expect(userService.getCurrentUser).not.toHaveBeenCalled();
    expect(userService.getCurrentUser.calls.count()).toEqual(0);

    expect(userService.displayGreeting).not.toHaveBeenCalled();
    expect(userService.displayGreeting.calls.count()).toEqual(0);

    expect(userService.removeUserInfo).not.toHaveBeenCalled();
    expect(userService.removeUserInfo.calls.count()).toEqual(0);
  });

  it('login: should error on login and remove user info', function () {
    spyOn(userService, 'getCurrentUser');
    spyOn(userService, 'removeUserInfo');
    mockBackend.expectPOST('/api/tokens', credentials).respond(404, errorResponse);

    var response;
    var promise = userService.login(credentials.username, credentials.password);

    promise.error(function(data){
      response = data;
    });

    mockBackend.flush();

    expect(response).toEqual(errorResponse);

    expect(storageService.setAuthToken).not.toHaveBeenCalled();
    expect(storageService.setAuthToken.calls.count()).toEqual(0);

    expect(userService.getCurrentUser).not.toHaveBeenCalled();
    expect(userService.getCurrentUser.calls.count()).toEqual(0);

    expect(userService.removeUserInfo).toHaveBeenCalledWith();
    expect(userService.removeUserInfo.calls.count()).toEqual(1);
  });

  it('logout: should logout successfully', function () {
    spyOn(userService, 'removeUserInfo');
    spyOn(storageService, 'getAuthToken').and.returnValue(token);
    mockBackend.expectDELETE('/api/tokens/'+token).respond( 204 );

    userService.logout();
    mockBackend.flush();

    expect(userService.removeUserInfo).toHaveBeenCalledWith();
    expect(userService.removeUserInfo.calls.count()).toEqual(1);

    expect(fakeNavHeaderService.setShowSignWaiverButton).toHaveBeenCalledWith(undefined);
    expect(fakeNavHeaderService.setShowSignWaiverButton.calls.count()).toEqual(1);
  });

  it('redirectToHome: should redirect user to / if the user is on an account page', function() {
    $location.path('/account/jump-profile');
    userService.redirectToHome();
    expect($location.path()).toEqual('/');
  });

  it('redirectToHome: should not redirect user to / if the user is not on an account page', function() {
    $location.path('/ticket/tickets-classes');
    userService.redirectToHome();
    expect($location.path()).toEqual('/ticket/tickets-classes');
  });

  it('createAccount: should successfully create account', function(){
    var profile = {
      'firstName': customer.firstName,
      'lastName': customer.lastName,
      'birthday': customer.birthday, // yyyy-MM-dd
      'email': customer.email,
      'password': customer.password,
      'phoneNumber': customer.phone,
      'gender': customer.gender // 'male' or 'female'
    };

    mockBackend.expectPOST('/api/customers', profile).respond(customer);

    var response;

    userService.createAccount(profile)
      .success(function(data){
        response = data;
      });

    mockBackend.flush();

    expect(response).toEqual(customer);
  });

  it('updatePassword: should sucessfully update password', function() {
    var mockUserId = 100;
    var passwords = {
      oldPassword: 'oldPassword',
      newPassword: 'newPassword'
    };

    mockBackend.expectPUT('/api/customers/'+mockUserId+'/password', passwords).respond(204);

    var success;

    userService.updatePassword(mockUserId, passwords.oldPassword, passwords.newPassword)
      .success(function() {
        success = true;
      });

    mockBackend.flush();

    expect(success).toBeTruthy();
  });

  it('isUserLoggedIn: should not be logged in', function () {
    spyOn(storageService, 'getAuthToken').and.returnValue(null);
    expect(userService.isUserLoggedIn()).toEqual(false);
  });

  it('isUserLoggedIn: should be logged in', function () {
    spyOn(storageService, 'getAuthToken').and.returnValue(token);
    expect(userService.isUserLoggedIn()).toEqual(true);
  });

  it('getCurrentUser: if not logged in, should return undefined', function() {
    spyOn(storageService, 'getAuthToken').and.returnValue(undefined);
    var response;
    var promise = userService.getCurrentUser();

    promise.success(function(data) {
      response = data;
    });

    expect(response).toBeUndefined();

    expect(fakeNavHeaderService.setShowSignWaiverButton).toHaveBeenCalledWith(null);
    expect(fakeNavHeaderService.setShowSignWaiverButton.calls.count()).toEqual(1);
  });

  it('getCurrentUser: if local data exists, just return it', function() {
    spyOn(storageService, 'getAuthToken').and.returnValue(token);
    spyOn(userService, 'removeUserInfo');

    // set current user
    mockBackend.expectGET('/api/tokens/current-user').respond(200, customer);
    userService.getCurrentUser();
    mockBackend.flush();
    // setup

    var response;
    var promise = userService.getCurrentUser();

    promise.success(function(data) {
      response = data;
    });

    scope.$digest();

    expect(response).toEqual(customer);

    expect(userService.removeUserInfo).not.toHaveBeenCalled();
    expect(userService.removeUserInfo.calls.count()).toEqual(0);

    expect(fakeNavHeaderService.setShowSignWaiverButton).toHaveBeenCalledWith(customer);
    expect(fakeNavHeaderService.setShowSignWaiverButton.calls.count()).toEqual(2);
  });

  it('getCurrentUser: if session storage token exists, should send http request to get current user when not stored locally', function() {
    spyOn(storageService, 'getAuthToken').and.returnValue(token);
    spyOn(userService, 'removeUserInfo');
    mockBackend.expectGET('/api/tokens/current-user').respond(200, customer);

    var response;
    var promise = userService.getCurrentUser();

    promise.success(function(data){
      response = data;
    });

    mockBackend.flush();
    scope.$digest();

    expect(response).toEqual(customer);

    expect(userService.removeUserInfo).not.toHaveBeenCalled();
    expect(userService.removeUserInfo.calls.count()).toEqual(0);

    expect(fakeNavHeaderService.setShowSignWaiverButton).toHaveBeenCalledWith(customer);
    expect(fakeNavHeaderService.setShowSignWaiverButton.calls.count()).toEqual(1);
  });

  it('getCurrentUser: remove info on error', function() {
    spyOn(storageService, 'getAuthToken').and.returnValue(token);
    spyOn(userService, 'removeUserInfo');
    mockBackend.expectGET('/api/tokens/current-user').respond(404);

    userService.getCurrentUser();

    mockBackend.flush();

    expect(userService.removeUserInfo).toHaveBeenCalledWith();
    expect(userService.removeUserInfo.calls.count()).toEqual(1);

    expect(fakeNavHeaderService.setShowSignWaiverButton).toHaveBeenCalledWith(undefined);
    expect(fakeNavHeaderService.setShowSignWaiverButton.calls.count()).toEqual(1);
  });

  it('getCurrentUserId: should call getCurrentUser and return its id', function() {
    spyOn(userService, 'getCurrentUser').and.returnValue(getPromiseObject(q, customer, true));

    var promise = userService.getCurrentUserId();
    var result;

    promise.success(function(data) {
      result = data;
    });

    scope.$digest();

    expect(result).toEqual(customer.id);
    expect(userService.getCurrentUser).toHaveBeenCalled();
  });

  it('getCurrentUserId: should call getCurrentUser and error', function() {
    spyOn(userService, 'getCurrentUser').and.returnValue(getPromiseObject(q, customer, false, 'error'));

    var promise = userService.getCurrentUserId();
    var result;

    promise.error(function(error) {
      result = error;
    });

    scope.$digest();

    expect(result).toEqual('error');
    expect(userService.getCurrentUser).toHaveBeenCalled();
  });

  it('verifyAccount: handle success case', function() {
    spyOn(userService, 'getCurrentUser').and.returnValue(getPromiseObject(q, customer, true));
    spyOn(userService, 'displayGreeting');

    var body = {
      'email': 'customer@email.com',
      'code': 1234566,
      'token': token
    };

    mockBackend.expectPOST('/api/verification/email', body).respond(201);

    var response;
    var promise = userService.verifyAccount(body.email, body.code);

    promise.success(function(data) {
      response = data;
    });

    mockBackend.flush();

    expect(response).toBeUndefined();

    expect(storageService.setAuthToken).toHaveBeenCalledWith(token, true);
    expect(storageService.setAuthToken.calls.count()).toEqual(1);

    expect(userService.getCurrentUser).toHaveBeenCalledWith();
    expect(userService.getCurrentUser.calls.count()).toEqual(1);

    expect(userService.displayGreeting).toHaveBeenCalledWith();
    expect(userService.displayGreeting.calls.count()).toEqual(1);
  });

  it('removeUserInfo: should remove oath token and handle location redirect', function() {
    spyOn(userService, 'redirectToHome');

    userService.removeUserInfo();

    expect(userService.redirectToHome).toHaveBeenCalledWith();
    expect(userService.redirectToHome.calls.count()).toEqual(1);

    expect(storageService.setAuthToken).toHaveBeenCalledWith(null, true);
    expect(storageService.setAuthToken.calls.count()).toEqual(1);
  });

  it('requestPasswordReset: should sucessfully initiate password reset', function() {
    var email = 'test@test.com';
    var body = {
      emailAddress: email
    };

    mockBackend.expectPOST('/api/customers/password/reset', body).respond(201);

    var success;

    userService.requestPasswordReset(email)
      .success(function() {
        success = true;
      });

    mockBackend.flush();

    expect(success).toBeTruthy();
  });

  it('submitPasswordReset: should sucessfully perform password reset', function() {
    var email = 'test@test.com';
    var password = 'testpassword';
    var token = '1234asdf';
    var body = {
        'emailAddress': email,
        'newPassword': password,
        'token': token
      };

    mockBackend.expectPUT('/api/customers/password/reset', body).respond(201);

    var success;

    userService.submitPasswordReset(email, password, token)
      .success(function() {
        success = true;
      });

    mockBackend.flush();

    expect(success).toBeTruthy();
  });

});