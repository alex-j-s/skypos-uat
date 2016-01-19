'use strict';

describe('Service: CatalogService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var mockBackend, q, scope, service, mockParkService;

  var parkId = '1';

  var categories = [
    {
      'id': 1,
      'name': 'Tickets & Classes',
      'imgUrl': 'images/adult.png',
      'type':'tickets-classes'
    },
    {
      'id': 2,
      'name': 'Events & Birthday Parties',
      'imgUrl': 'images/kids-birthday.png',
      'type':'events'
    },
    {
      'id': 3,
      'name': 'Gift Cards & Memberships',
      'imgUrl': 'images/adult-2.png',
      'type':'gift-cards'
    },
    {
      'id': 4,
      'name': 'Sky Zone Products',
      'imgUrl': 'images/clothing.png',
      'type':'products'
    }
  ];

  var mockGetCatalogList = function() {
    mockBackend.whenGET('/api/parks/'+parkId+'/catalog/categories').respond(categories);

    var promise = service.getCatalogList(),
        catalogList;
    promise.success(function(response){
      catalogList = response;
    });

    mockBackend.flush();

    return catalogList;
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function (CatalogService, $rootScope, $httpBackend, _ParkService_, $q) {
    q = $q;
    mockParkService = _ParkService_;

    scope = $rootScope.$new();

    service = CatalogService;
    mockBackend = $httpBackend;
  }));

  it('getDefaultProductFlowUrl: should generate correct product list url', function() {
    var categoryType = 'category';
    var result = service.getDefaultProductFlowUrl(categoryType);
    expect(result).toEqual('#/category/list');
  });

  it('applyCategoryUrlAndSaveInfo: if category is ticket or event, match accordingly', function() {
    spyOn(service, 'getDefaultProductFlowUrl').and.callThrough();

    categories.forEach(function(category) {
      expect(category.targetUrl).toBeUndefined();
    });

    Object.keys(service.catalogInfoMap).forEach(function(key) {
      expect(service.catalogInfoMap[key].id).toBeUndefined();
    });

    service.applyCategoryUrlAndSaveInfo(categories);

    categories.forEach(function(category) {
      expect(category.targetUrl).toBeDefined();
    });

    Object.keys(service.catalogInfoMap).forEach(function(key) {
      expect(service.catalogInfoMap[key].id).toBeDefined();
    });

    expect(service.getDefaultProductFlowUrl).toHaveBeenCalledWith(categories[2].type);
    expect(service.getDefaultProductFlowUrl).toHaveBeenCalledWith(categories[3].type);
  });

  it('getCatalogList: should get catalogList and return a promise', function() {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));
    spyOn(service, 'applyCategoryUrlAndSaveInfo');

    var response = mockGetCatalogList();

    expect(response instanceof Array).toBeTruthy();
    expect(service.applyCategoryUrlAndSaveInfo).toHaveBeenCalledWith(categories);
    expect(service.applyCategoryUrlAndSaveInfo.calls.count()).toEqual(1);
  });

  it('getCatalogList: should get catalogList and return a promise', function() {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, false, 'error'));
    spyOn(service, 'applyCategoryUrlAndSaveInfo');

    var promise = service.getCatalogList(),
        result;
    promise.error( function(response) {
      result = response;
    });

    scope.$digest();

    expect(result).toEqual('error');

    expect(service.applyCategoryUrlAndSaveInfo).not.toHaveBeenCalled();
    expect(service.applyCategoryUrlAndSaveInfo.calls.count()).toEqual(0);
  });

  it('getCatalogList: on error, should return undefined object', function() {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));
    mockBackend.whenGET('/api/parks/'+parkId+'/catalog/categories').respond(500, 'error');
    spyOn(service, 'applyCategoryUrlAndSaveInfo');

    var promise = service.getCatalogList(),
        result;
    promise.error( function(response) {
      result = response;
    });

    mockBackend.flush();

    expect(result).toEqual('error');

    expect(service.applyCategoryUrlAndSaveInfo).not.toHaveBeenCalled();
    expect(service.applyCategoryUrlAndSaveInfo.calls.count()).toEqual(0);
  });

  it('getCategoryByKey: if ids are stored, make no $http call and return category', function() {
    service.applyCategoryUrlAndSaveInfo(categories);
    var category = categories[0];

    var promise = service.getCategoryByKey(category.type);
    var resultCategory;
    promise.success(function(data){
      resultCategory = data;
    });

    scope.$digest();

    expect(resultCategory.id).toEqual(category.id);
    expect(resultCategory.name).toEqual(category.name);
  });

  it('getCategoryByKey: if ids are not stored, make $http call and return category', function() {
    var category = categories[3];

    spyOn(service, 'getCatalogList').and.returnValue(getPromiseObject(q, categories, true));

    var promise = service.getCategoryByKey(category.type);
    var resultCategory;
    promise.success(function(data){
      resultCategory = data;
    });

    scope.$digest();

    expect(resultCategory).toBeUndefined();
  });

  it('getCategoryByKey - error: if ids are not stored, make $http call and reject', function() {
    var category = categories[0];

    spyOn(service, 'getCatalogList').and.returnValue(getPromiseObject(q, categories, false, 'error'));

    var promise = service.getCategoryByKey(category.type);
    var resultCategory, result;
    promise.error(function(error){
      result = error;
    });

    scope.$digest();

    expect(resultCategory).toBeUndefined();
    expect(result).toEqual('error');
  });

});