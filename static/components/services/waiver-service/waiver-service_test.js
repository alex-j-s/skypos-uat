'use strict';

describe('Service: WaiverService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var waiverService, mockBackend;
  var userId = 1;

  var waivers = [
    {
      'id': 123456,
      'approved': false,
      'approvedOn': '',
      'expirationDate': '2015-12-31',
      'park': {
        'id': 1,
        'name': 'Everett'
      }
    },
    {
      'id': 23232,
      'approved': true,
      'approvedOn': '2014-01-28',
      'expirationDate': '2015-01-28',
      'park': {
        'id': 2,
        'name': 'Torrance'
      }
    },
    {
      'id': 343433,
      'approved': true,
      'approvedOn': '2014-06-30',
      'expirationDate': '2015-06-30',
      'park': {
        'id': 3,
        'name': 'Oaks'
      }
    },
    {
      'id': 555434,
      'approved': true,
      'approvedOn': '2013-06-30',
      'expirationDate': '2014-06-30',
      'park': {
        'id': 4,
        'name': 'Chalfont'
      }
    }
  ];

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, _WaiverService_) {
    waiverService = _WaiverService_;
    mockBackend = $httpBackend;
  }));

  it('getParkWaiverContent: should return a promise', function() {
    var parkId = 123;
    var response = [];

    mockBackend.expectGET('/api/parks/'+parkId+'/documents?type=Waiver Template&language=English')
      .respond(response);

    var promise = waiverService.getParkWaiverContent(parkId),
        waiverDocs;

    promise.success(function(response){
      waiverDocs = response;
    });

    mockBackend.flush();

    expect(waiverDocs instanceof Array).toBeTruthy();
    expect(waiverDocs).toEqual(response);
  });

  it('createWaiver: should return a promise', function() {
    var response = {};
    var waiverObj = {
      'legalDocumentId': 1234,
      'parkId': 234,
      'adults': [],
      'minors': []
    };

    mockBackend.expectPOST('/api/waivers', waiverObj)
      .respond(response);

    var promise = waiverService.createWaiver(waiverObj.legalDocumentId, waiverObj.parkId, waiverObj.adults, waiverObj.minors),
        waiver;

    promise.success(function(response){
      waiver = response;
    });

    mockBackend.flush();

    expect(waiver instanceof Object).toBeTruthy();
    expect(waiver).toEqual(response);
  });

  it('getWaiversByCustomerId: should return a promise', function(){
    mockBackend.expectGET('/api/customers/'+userId+'/waivers').respond(200, waivers);

    var promise = waiverService.getWaiversByCustomerId(userId),
        waiverList;
    promise.then(function(response){
      waiverList = response.data;
    });

    mockBackend.flush();

    expect(waiverList instanceof Array).toBeTruthy();
    expect(waiverList).toEqual(waivers);
  });

  it('getWaiversByCustomerId: should return a promise with params', function(){
    var parkId = 123456;
    var currentOnly = true;

    mockBackend.expectGET('/api/customers/'+userId+'/waivers?currentOnly='+currentOnly+'&parkId='+parkId).respond(200, waivers);

    var promise = waiverService.getWaiversByCustomerId(userId, parkId, currentOnly),
        waiverList;
    promise.then(function(response){
      waiverList = response.data;
    });

    mockBackend.flush();

    expect(waiverList instanceof Array).toBeTruthy();
    expect(waiverList).toEqual(waivers);
  });

});