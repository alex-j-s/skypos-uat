'use strict';

describe('Service: LookupService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var lookupService, mockBackend;

  var countryList = [
    {
      'isoCode': 'US',
      'label': 'United States'
    }
  ];

  var stateList = [
    {
      'isoCode': 'PA',
      'label': 'Pennsylvania'
    }
  ];

  var mockGetCountryList = function() {
    mockBackend.expectGET('/api/reference/countries')
                            .respond(countryList);

    var response;

    lookupService.getCountryList()
      .success(function(data){
        response = data;
      });

    mockBackend.flush();

    return response;
  };

  var mockGetStateList = function(countryCode) {
    mockBackend.expectGET('/api/reference/states?countryIsoCode='+countryCode)
                            .respond(stateList);

    var response;

    lookupService.getStateList(countryCode)
      .success(function(data){
        response = data;
      });

    mockBackend.flush();

    return response;
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, _LookupService_) {
    lookupService = _LookupService_;
    mockBackend = $httpBackend;

  }));

  it('getCountryList: should return an array', function () {
    expect(mockGetCountryList() instanceof Array).toBeTruthy();
  });

  it('getCountryList: should return an array with length of 1', function () {
    expect(mockGetCountryList().length).toEqual(1);
  });

  it('getStateList: should return an array', function () {
    expect(mockGetStateList('US') instanceof Array).toBeTruthy();
  });

  it('getStateList: should return an array with length of 1', function () {
    expect(mockGetStateList('US').length).toEqual(1);
  });


});