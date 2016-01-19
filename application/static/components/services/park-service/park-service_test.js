'use strict';

describe('Service: ParkService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var parkService, mockBackend;

  var parks = [
    {
      'id' : '1',
      'name' : 'Everett',
      'parkUrlSegment' : 'everett',
      'description' : 'This park is the most exciting place to visit.',
      'phone' : '555.555.5555',
      'fax' : '555.666.6666',
      'website' : 'www.demopark.com',
      'timezone' : 'EST',
      'timeBlock' : '15',
      'timeNeededPriorToEvent' : '30',
      'parkNumber' : 1234,
      'status' : 'Active',
      'storeOpeningDate' : '1972-07-11',
      'haltOnlineSales' : false,
      'currencyCode': '€',
      'address' : {
        'street' : '123 Main St',
        'city' : 'Anytown',
        'countryCode' : 'USA',
        'stateCode' : 'CA',
        'postalCode' : '55555'
      }
    },
    {
      'id' : '2',
      'name' : 'Oaks',
      'parkUrlSegment' : 'oaks',
      'description' : 'This park is the most exciting place to visit.',
      'phone' : '555.555.1234',
      'fax' : '555.666.6666',
      'website' : 'www.demopark.com',
      'timezone' : 'EST',
      'timeBlock' : '15',
      'timeNeededPriorToEvent' : '30',
      'parkNumber' : 1234,
      'status' : 'Active',
      'storeOpeningDate' : '1972-07-11',
      'haltOnlineSales' : false,
      'currencyCode': '$',
      'address' : {
        'street' : '123 Main St',
        'city' : 'Anytown',
        'countryCode' : 'USA',
        'stateCode' : 'CA',
        'postalCode' : '55555'
      }
    },
    {
      'id' : '3',
      'name' : 'Torrance',
      'parkUrlSegment' : 'torrance',
      'description' : 'This park is the most exciting place to visit.',
      'phone' : '555.555.5678',
      'fax' : '555.666.6666',
      'website' : 'www.demopark.com',
      'timezone' : 'EST',
      'timeBlock' : '15',
      'timeNeededPriorToEvent' : '30',
      'parkNumber' : 1234,
      'status' : 'Active',
      'storeOpeningDate' : '1972-07-11',
      'haltOnlineSales' : false,
      'currencyCode': '$',
      'address' : {
        'street' : '123 Main St',
        'city' : 'Anytown',
        'countryCode' : 'USA',
        'stateCode' : 'CA',
        'postalCode' : '55555'
      }
    }
  ];

  var mockGetParks = function(makeCall, isSuccess, parkUrlSegment) {
    var url = '/api/parks';
    var jsonResponse = parks;
    console.log(parkUrlSegment);
    if(parkUrlSegment) {
      url += '?parkUrlSegment='+parkUrlSegment;
      jsonResponse = parks.slice(0,1);
    }

    mockBackend.expectGET(url).respond((isSuccess)?200:404, jsonResponse);

    var response;

    if(makeCall) {
      parkService.getParks(parkUrlSegment)
        .success(function(data){
          response = data;
        });
    }

    mockBackend.flush();

    return response;
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, _ParkService_) {

    parkService = _ParkService_;
    mockBackend = $httpBackend;

  }));

  it('doesParkInfoExist: if park info set, should return true', function () {
    expect(parkService.doesParkInfoExist()).toBeTruthy();
  });

  it('getParkCurrencyCode: no park defaults to $', function() {
    var result = parkService.getParkCurrencyCode();
    expect(result).toEqual('$');
  });

  it('getParkCurrencyCode: returns currency code for specific park', function() {
    parkService.getCurrentPark();
    mockGetParks(false, true, 'everett');
    var result = parkService.getParkCurrencyCode();
    expect(result).toEqual('€');
  });

  it('getParks: should return a promise resolved with a park array', function () {
    var result = mockGetParks(true, true);
    expect(result instanceof Array).toEqual(true);
    expect(result.length).toEqual(parks.length);
  });

  it('getParks w/ parkUrlSegment: should return a promise resolved with a park array with length 1', function () {
    var result = mockGetParks(true, true, 'parkUrlSegment');
    expect(result instanceof Array).toEqual(true);
    expect(result.length).toEqual(1);
  });

  it('getParkId: should make http request and return park id if current park is empty', function () {
    var promise = parkService.getParkId();
    var result;

    promise.success(function(data) {
      result = data;
    });

    mockGetParks(false, true, 'everett');

    expect(result[0]).toEqual(parks[0].id);
  });

  it('getCurrentPark: should make http request and return current park if current park is empty', function() {
    var promise = parkService.getCurrentPark();
    var result;

    promise.success(function(data) {
      result = data;
    });

    mockGetParks(false, true, 'everett');

    expect(result instanceof Object).toEqual(true);
    expect(result).toEqual(parks[0]);
  });

  it('getParkId: should make http request and return park id if current park is empty', function () {
    var promise = parkService.getParkId();
    var result;

    promise.success(function(data) {
      result = data;
    });

    mockGetParks(false, false, 'everett');

    expect(result).toBeUndefined();
  });

  it('getCurrentPark: should make http request and return current park if current park is empty', function() {
    var promise = parkService.getCurrentPark();
    var result;

    promise.success(function(data) {
      result = data;
    });

    mockGetParks(false, false, 'everett');

    expect(result).toBeUndefined();
  });

});