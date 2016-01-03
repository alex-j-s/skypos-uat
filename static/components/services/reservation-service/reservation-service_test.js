'use strict';

describe('Service: ReservationService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var reservationService, mockBackend, mockParkService, scope;

  var parkId = 1;
  var resourceId = 123;
  var resourceIds = [resourceId];
  var guests = 3;
  var startDate = '2015-10-10';
  var endDate = '2019-10-10';
  var startTime = '09:00';
  var endTime = '18:00';
  var resultType = 'summary';

  var availabilityResponse = {
    'resourceIds' : [111],
    'dates' : [
      {
        'date' : '2015-01-27',
        'hasAvailability' : true
      }
    ]
  };

  var noAvailabilityResponse = {
    'resourceIds' : [111],
    'dates' : [
      {
        'date' : '2015-01-27',
        'hasAvailability' : false
      }
    ]
  };

  var product = {
    'activityType': 'SkyRobics',
    'attributes': [
      {
        'id': 'attr222',
        'name': 'Duration',
        'type': '',
        'values': [
          {
            'id': 'attrval333',
            'value': 30
          }
        ]
      }
    ],
    'description': 'Sky Fitness Program',
    'endDate': '2018-01-01',
    'id': 'prd-222',
    'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/tickets-classes.jpg',
    'name': 'Sky Fitness Program',
    'priceBookEntries': [
      {
        'availableOnline': false,
        'endDate': '2018-01-01',
        'id': 'pbe-222',
        'managerApprovalRequired': false,
        'name': 'Store Prices',
        'sortOrder': 2,
        'standardPrice': 20,
        'startDate': '1970-01-01',
        'taxRate': 0,
        'taxable': false
      }
    ],
    'productCode': 'prd222',
    'startDate': '1970-01-01',
    'variants': [
      {
        'activityType': ' ',
        'attributes': [
          {
            'id': 'atr222',
            'name': 'Duration',
            'type': '',
            'value': {
              'id': 'attrval333',
              'value': 30
            }
          }
        ],
        'endDate': '2018-01-01',
        'id': 'var114',
        'image': 'http://qaservices.trifecta.com/images/var111.jpg',
        'name': 'Sky Fitness 30 Minute',
        'priceBookEntries': [
          {
            'availableOnline': false,
            'endDate': '2018-01-01',
            'id': 'pbe-222',
            'managerApprovalRequired': false,
            'name': 'PBE 30 Minute Open Jump',
            'sortOrder': 1,
            'standardPrice': 20,
            'startDate': '1970-01-01',
            'taxRate': 0,
            'taxable': false
          }
        ],
        'productCode': 'prd111-1',
        'startDate': '1970-01-01'
      }
    ]
  };

  var reservationSuccess = {
    'id' : 1,
    'resourceId' : 123,
    'numberOfGuests' : 3,
    'status' : '',
    'placedByUserId' : '',
    'dateCreated' : '2015-11-01T00:00:00+0000',
    'dateExpires' : '2015-11-01T00:00:00+0000',
    'startDate' : '2019-10-10',
    'startTime' : '09:00'
  };

  describe('ParkService http success', function () {

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($httpBackend, _ReservationService_, _ParkService_, $q) {
      mockParkService = _ParkService_;

      spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject($q, parkId, true));

      reservationService = _ReservationService_;
      mockBackend = $httpBackend;

    }));

    it('getProductAvailability - only required fields passed: should return promise', function() {
      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+guests+'&resourceIds='+resourceId)
                              .respond(availabilityResponse);

      var response;

      reservationService.getProductAvailability(resourceIds, guests, null, null, null, null, null)
        .success(function(data){
          response = data;
        });

      mockBackend.flush();

      expect(response).toEqual(availabilityResponse);
    });

    it('createReservation: on success, should return reservation details', function() {
      var details = {
        'resourceId': resourceId,
        'numberOfGuests': guests,
        'startDate': startDate,
        'startTime': startTime
      };

      mockBackend.expectPOST('/api/parks/'+parkId+'/reservations', details)
                              .respond(reservationSuccess);

      var response;

      reservationService.createReservation(resourceId, guests, startDate, startTime)
        .success(function(data) {
          response = data;
        });

        mockBackend.flush();

        expect(response).toEqual(reservationSuccess);
    });

    it('getProductAvailability - required, only start date: should return promise', function() {
      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+guests+'&resourceIds='+resourceId)
                              .respond(availabilityResponse);

      var response;

      reservationService.getProductAvailability(resourceIds, guests, startDate, null, null, null, null)
        .success(function(data){
          response = data;
        });

      mockBackend.flush();

      expect(response).toEqual(availabilityResponse);
    });

    it('getProductAvailability - required, only end date: should return promise', function() {
      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+guests+'&resourceIds='+resourceId)
                              .respond(availabilityResponse);

      var response;

      reservationService.getProductAvailability(resourceIds, guests, null, endDate, null, null, null)
        .success(function(data){
          response = data;
        });

      mockBackend.flush();

      expect(response).toEqual(availabilityResponse);
    });

    it('getProductAvailability - required, start/end date: should return promise', function() {
      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+guests+'&resourceIds='+resourceId+'&startDate='+startDate+'&endDate='+endDate)
                              .respond(availabilityResponse);

      var response;

      reservationService.getProductAvailability(resourceIds, guests, startDate, endDate, null, null, null)
        .success(function(data){
          response = data;
        });

      mockBackend.flush();

      expect(response).toEqual(availabilityResponse);
    });

    it('getProductAvailability - required, all others: should return promise', function() {
      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+guests+'&resourceIds='+resourceId+'&startDate='+startDate+'&endDate='+endDate+'&startTime='+startTime+'&endTime='+endTime+'&resultType='+resultType)
                              .respond(availabilityResponse);

      var response;

      reservationService.getProductAvailability(resourceIds, guests, startDate, endDate, startTime, endTime, resultType)
        .success(function(data){
          response = data;
        });

      mockBackend.flush();

      expect(response).toEqual(availabilityResponse);
    });

    it('setDurationAttributeUnavailableFlag', function() {
      var localProduct = angular.copy(product);
      var localVariant = localProduct.variants[0];

      reservationService.setDurationAttributeUnavailableFlag(localProduct, localVariant);

      expect(localProduct.attributes[0].values[0].hasAvailability).toEqual(false);
    });

    it('getProductAndVariantAvailabilityForDate: availability', function() {
      var productList = [];
      var localProduct = angular.copy(product);
      productList.push(localProduct);

      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+1+'&resourceIds='+product.variants[0].id+'&startDate='+startDate+'&endDate='+startDate+'&resultType=summary')
                              .respond(availabilityResponse);

      reservationService.getProductAndVariantAvailabilityForDate(productList, startDate);

      mockBackend.flush();

      expect(localProduct.hasAvailability).toEqual(true);

      localProduct.attributes.forEach(function(attr) {
        if( attr.name === 'Duration' ) {
          attr.values.forEach(function(value) {
            expect(value.hasAvailability).toBeUndefined();
          });
        }
      });

      localProduct.variants.forEach(function(variant) {
        expect(variant.hasAvailability).toEqual(true);
      });
    });

    it('getProductAndVariantAvailabilityForDate: no availability', function() {
      var productList = [];
      var localProduct = angular.copy(product);
      productList.push(localProduct);

      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+1+'&resourceIds='+product.variants[0].id+'&startDate='+startDate+'&endDate='+startDate+'&resultType=summary')
                              .respond(noAvailabilityResponse);

      reservationService.getProductAndVariantAvailabilityForDate(productList, startDate);

      mockBackend.flush();

      expect(localProduct.hasAvailability).toEqual(false);

      localProduct.attributes.forEach(function(attr) {
        if( attr.name === 'Duration' ) {
          attr.values.forEach(function(value) {
            expect(value.hasAvailability).toEqual(false);
          });
        }
      });

      localProduct.variants.forEach(function(variant) {
        expect(variant.hasAvailability).toEqual(false);
      });
    });

    it('getProductAndVariantAvailabilityForDate: http fail', function() {
      var productList = [];
      var localProduct = angular.copy(product);
      productList.push(localProduct);

      mockBackend.expectGET('/api/parks/'+parkId+'/availability?guests='+1+'&resourceIds='+product.variants[0].id+'&startDate='+startDate+'&endDate='+startDate+'&resultType=summary')
                              .respond(500);

      reservationService.getProductAndVariantAvailabilityForDate(productList, startDate);

      mockBackend.flush();

      expect(localProduct.hasAvailability).toBeUndefined();

      localProduct.attributes.forEach(function(attr) {
        if( attr.name === 'Duration' ) {
          attr.values.forEach(function(value) {
            expect(value.hasAvailability).toBeUndefined();
          });
        }
      });

      localProduct.variants.forEach(function(variant) {
        expect(variant.hasAvailability).toBeUndefined();
      });
    });

  });

  describe('ParkService http failure', function () {

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope, _ReservationService_, _ParkService_, $q) {
      mockParkService = _ParkService_;

      spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject($q, parkId, false, 'error'));

      scope = $rootScope.$new();

      reservationService = _ReservationService_;
    }));

    it('getProductAvailability: should reject promise', function() {
      var response;

      reservationService.getProductAvailability(resourceId, guests, startDate, startTime)
        .error(function(error) {
          response = error;
        });

        scope.$digest();

        expect(response).toEqual('error');
    });

    it('createReservation: should reject promise', function() {
      var response;

      reservationService.createReservation(resourceId, guests, startDate, startTime)
        .error(function(error) {
          response = error;
        });

        scope.$digest();

        expect(response).toEqual('error');
    });

  });

});