'use strict';

describe('Service: ProfileService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var profileService, mockBackend;
  var userId = '1';

  var profile;

  var testProfile = {
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

  var profileList = [];
  profileList.push(testProfile);

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, _ProfileService_) {
    profileService = _ProfileService_;
    mockBackend = $httpBackend;

    profile = testProfile;
  }));

  it('getCustomerInformation: should return a promise', function(){
    mockBackend.expectGET('/api/customers/'+userId).respond(200, profile);

    var promise = profileService.getCustomerInformation(userId),
        userProfile;
    promise.then(function(response){
      userProfile = response.data;
    });

    mockBackend.flush();

    profile.isMinor = profileService.isMinor(profile);

    expect(userProfile instanceof Object).toBeTruthy();
    expect(userProfile).toEqual(profile);
  });

  it('isMinor: if user is over 18, should return false', function(){
    profile.birthday = '1969-01-01';
    expect(profileService.isMinor(profile)).toBeFalsy();
  });

  it('isMinor: if user is under 18, should return true', function(){
    profile.birthday = '2010-01-01';
    expect(profileService.isMinor(profile)).toBeTruthy();
  });

  it('isMinor: if user is exactly 18, should return false', function(){
    var date = new Date();
    date.setFullYear(date.getFullYear()-18);
    profile.birthday = date;
    expect(profileService.isMinor(profile)).toBeFalsy();
  });

  it('isMinor: if user is a day under 18, should return true', function(){
    var date = new Date();
    date.setFullYear(date.getFullYear()-18);
    date.setDate(date.getDate()+1);
    profile.birthday = date;
    expect(profileService.isMinor(profile)).toBeTruthy();
  });

  it('updateCustomerInformation: should return a promise with updated profile information', function() {
    mockBackend.expectPUT('/api/customers/'+userId, profile).respond(200, profile);

    var promise = profileService.updateCustomerInformation(userId, profile),
        updatedProfile;
    promise.then(function(response){
      updatedProfile = response.data;
    });

    mockBackend.flush();

    profile.isMinor = profileService.isMinor(profile);

    expect(updatedProfile instanceof Object).toBeTruthy();
    expect(updatedProfile).toEqual(profile);
  });

  it('getCustomerDependents: should return a promise with an array of customers', function() {
    mockBackend.expectGET('/api/customers/'+userId+'/dependents').respond(200, profileList);

    var promise = profileService.getCustomerDependents(userId),
        dependentsList;
    promise.then(function(response){
      dependentsList = response.data;
    });

    mockBackend.flush();

    expect(dependentsList instanceof Array).toBeTruthy();
    expect(dependentsList).toEqual(profileList);
  });

  it('getCustomerGuardians: should return a promise with an array of customers', function() {
    mockBackend.expectGET('/api/customers/'+userId+'/guardians').respond(200, profileList);

    var promise = profileService.getCustomerGuardians(userId),
        dependentsList;
    promise.then(function(response){
      dependentsList = response.data;
    });

    mockBackend.flush();

    expect(dependentsList instanceof Array).toBeTruthy();
    expect(dependentsList).toEqual(profileList);
  });

});