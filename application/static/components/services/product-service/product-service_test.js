'use strict';

describe('Service: ProductService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var productService, mockBackend, mockParkService, q, scope;

  var parkId = 1;
  var categoryId = 1;
  var productId = 'hat';
  var productList;


  var product = {
      'activityType': '',
      'attributes': [
        {
          'id': 11112,
          'name': 'Category',
          'type': 'Filterable',
          'values': [
            {
              'id': 11114,
              'value': 'Apparel'
            }
          ]
        },
        {
          'id': 2391,
          'name': 'Size',
          'type': '',
          'values': [
            {
                'id': 999991,
                'value': 'Small'
            },
            {
                'id': 999992,
                'value': 'Large'
            }
          ]
        },
        {
          'id': 2392,
          'name': 'Color',
          'type': '',
          'values': [
            {
                'id': 999993,
                'value': 'Black'
            },
            {
                'id': 999994,
                'value': 'White'
            },
            {
                'id': 999995,
                'value': 'Red'
            }
          ]
        }
      ],
      'description': 'Sky Zone T Shirt.  Cotton T-Shirt.  6.1oz, 100% preshrunk cotton jersey knit t-shirt.  Seamless coverseam, stitched collar, Taped neck and shoulders, Tubular knit construction.  Double needle-stitched sleeve and bottom hem.',
      'id': 101,
      'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/blackshirt.jpg',
      'name': 'Sky Zone T-Shirt',
      'priceBookEntries': [
          {
              'availableOnline': true,
              'id': 111111,
              'managerApprovalRequired': false,
              'name': '',
              'sortOrder': 2,
              'standardPrice': 15,
              'startDate': '1970-01-01',
              'taxable': false
          }
      ],
      'productCode': '222',
      'startDate': '1970-01-01',
      'variants': [
          {
            'activityType': '',
            'attributes': [
              {
                'id': 2391,
                'name': 'Size',
                'type': '',
                'value': {
                    'id': 999991,
                    'value': 'Small'
                }
              },
              {
                'id': 2392,
                'name': 'Color',
                'type': '',
                'value': {
                    'id': 999993,
                    'value': 'Black'
                }
              }
            ],
              'description': 'Small Black T Shirt.  Cotton T-Shirt.  6.1oz, 100% preshrunk cotton jersey knit t-shirt.  Seamless coverseam, stitched collar, Taped neck and shoulders, Tubular knit construction.  Double needle-stitched sleeve and bottom hem.',
              'id': 11116,
              'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/blackshirt.jpg',
              'name': 'Small Black T Shirt',
              'priceBookEntries': [
                {
                  'availableOnline': true,
                  'id': 222222,
                  'managerApprovalRequired': false,
                  'name': '',
                  'sortOrder': 1,
                  'standardPrice': 14.99,
                  'startDate': '1970-01-01',
                  'taxable': false
                }
              ],
              'productCode': '111222',
              'startDate': '1970-01-01'
          },
          {
            'activityType': '',
            'attributes': [
                {
                    'id': 2391,
                    'name': 'Size',
                    'type': '',
                    'value': {
                        'id': 999992,
                        'value': 'Large'
                    }
                },
                {
                    'id': 2392,
                    'name': 'Color',
                    'type': '',
                    'value': {
                        'id': 999993,
                        'value': 'Black'
                    }
                }
            ],
            'description': 'Large Black T Shirt.  Cotton T-Shirt.  6.1oz, 100% preshrunk cotton jersey knit t-shirt.  Seamless coverseam, stitched collar, Taped neck and shoulders, Tubular knit construction.  Double needle-stitched sleeve and bottom hem.',
            'id': 11116,
            'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/blackshirt.jpg',
            'name': 'Large Black T Shirt',
            'priceBookEntries': [
                {
                    'availableOnline': true,
                    'id': 333333,
                    'managerApprovalRequired': false,
                    'name': '',
                    'sortOrder': 2,
                    'standardPrice': 15.99,
                    'startDate': '1970-01-01',
                    'taxable': false
                }
            ],
            'productCode': '111333',
            'startDate': '1970-01-01'
        },
        {
            'activityType': '',
            'attributes': [
                {
                    'id': 2391,
                    'name': 'Size',
                    'type': '',
                    'value': {
                        'id': 999991,
                        'value': 'Small'
                    }
                },
                {
                    'id': 2392,
                    'name': 'Color',
                    'type': '',
                    'value': {
                        'id': 999994,
                        'value': 'White'
                    }
                }
            ],
            'description': 'Small White T Shirt.  Cotton T-Shirt.  6.1oz, 100% preshrunk cotton jersey knit t-shirt.  Seamless coverseam, stitched collar, Taped neck and shoulders, Tubular knit construction.  Double needle-stitched sleeve and bottom hem.',
            'id': 11117,
            'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/whiteshirt.jpg',
            'name': 'Small White T Shirt',
            'priceBookEntries': [
                {
                    'availableOnline': true,
                    'id': 444444,
                    'managerApprovalRequired': false,
                    'name': '',
                    'sortOrder': 3,
                    'standardPrice': 16.99,
                    'startDate': '1970-01-01',
                    'taxable': false
                }
            ],
            'productCode': '111444',
            'startDate': '1970-01-01'
        },
          {
              'activityType': '',
              'attributes': [
                  {
                      'id': 2391,
                      'name': 'Size',
                      'type': '',
                      'value': {
                          'id': 999992,
                          'value': 'Large'
                      }
                  },
                  {
                      'id': 2392,
                      'name': 'Color',
                      'type': '',
                      'value': {
                          'id': 999994,
                          'value': 'White'
                      }
                  }
              ],
              'description': 'Large White T Shirt.  Cotton T-Shirt.  6.1oz, 100% preshrunk cotton jersey knit t-shirt.  Seamless coverseam, stitched collar, Taped neck and shoulders, Tubular knit construction.  Double needle-stitched sleeve and bottom hem.',
              'id': 11118,
              'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/whiteshirt.jpg',
              'name': 'Large White T Shirt',
              'priceBookEntries': [
                  {
                      'availableOnline': true,
                      'id': 555555,
                      'managerApprovalRequired': false,
                      'name': '',
                      'sortOrder': 4,
                      'standardPrice': 17.99,
                      'startDate': '1970-01-01',
                      'taxable': false
                  }
              ],
              'productCode': '111555',
              'startDate': '1970-01-01'
          },
          {
              'activityType': '',
              'attributes': [
                  {
                      'id': 2391,
                      'name': 'Size',
                      'type': '',
                      'value': {
                          'id': 999991,
                          'value': 'Small'
                      }
                  },
                  {
                      'id': 2392,
                      'name': 'Color',
                      'type': '',
                      'value': {
                          'id': 999995,
                          'value': 'Red'
                      }
                  }
              ],
              'description': 'Small Red T Shirt.  Cotton T-Shirt.  6.1oz, 100% preshrunk cotton jersey knit t-shirt.  Seamless coverseam, stitched collar, Taped neck and shoulders, Tubular knit construction.  Double needle-stitched sleeve and bottom hem.',
              'id': 11119,
              'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/redshirt.jpg',
              'name': 'Small Red T Shirt',
              'priceBookEntries': [
                  {
                      'availableOnline': true,
                      'id': 666666,
                      'managerApprovalRequired': false,
                      'name': '',
                      'sortOrder': 3,
                      'standardPrice': 18.99,
                      'startDate': '1970-01-01',
                      'taxable': false
                  }
              ],
              'productCode': '111666',
              'startDate': '1970-01-01'
          },
          {
              'activityType': '',
              'attributes': [
                  {
                      'id': 2391,
                      'name': 'Size',
                      'type': '',
                      'value': {
                          'id': 999992,
                          'value': 'Large'
                      }
                  },
                  {
                      'id': 2392,
                      'name': 'Color',
                      'type': '',
                      'value': {
                          'id': 999995,
                          'value': 'Red'
                      }
                  }
              ],
              'description': 'Large Red T Shirt.  Cotton T-Shirt.  6.1oz, 100% preshrunk cotton jersey knit t-shirt.  Seamless coverseam, stitched collar, Taped neck and shoulders, Tubular knit construction.  Double needle-stitched sleeve and bottom hem.',
              'id': 11120,
              'image': 'http://qaservices.trifecta.com:8080/SkyZone/images/redshirt.jpg',
              'name': 'Large Red T Shirt',
              'priceBookEntries': [
                  {
                      'availableOnline': true,
                      'id': 777777,
                      'managerApprovalRequired': false,
                      'name': '',
                      'sortOrder': 4,
                      'standardPrice': 17.99,
                      'startDate': '1970-01-01',
                      'taxable': false
                  }
              ],
              'productCode': '111777',
              'startDate': '1970-01-01'
          }
      ]
  };

  var mockGetProductList = function(categoryId, httpSuccess) {
    var responseCode = (httpSuccess) ? 200 : 404;
    var responseBody = (httpSuccess) ? productList : 'error';

    mockBackend.expectGET('/api/parks/'+parkId+'/catalog/products?categoryId='+categoryId)
                            .respond(responseCode, responseBody);

    var response;

    productService.getProductList(categoryId)
      .success(function(data){
        response = data;
      })
      .error(function(error) {
        response = error;
      });

    mockBackend.flush();

    return response;
  };

  var mockGetProductById = function(productId, httpSuccess, respond) {
    mockBackend.expectGET('/api/parks/'+parkId+'/catalog/products/'+productId)
                            .respond( (httpSuccess) ? 201 : 404, respond);

    var response;

    productService.getProductById(productId)
      .success(function(data){
        response = data;
      })
      .error(function(error) {
        response = error;
      });

    mockBackend.flush();

    return response;
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend, _ProductService_, _ParkService_, $q, $rootScope) {
    q = $q;
    scope = $rootScope.$new();
    mockParkService = _ParkService_;

    productService = _ProductService_;
    mockBackend = $httpBackend;

    productList = [];

  }));

  it('getProductList: should return an array', function () {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));
    expect(mockGetProductList(categoryId, true) instanceof Array).toBeTruthy();
  });

  it('getProductList: should return an array with length of 2', function () {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));
    productList.push(product);
    productList.push(product);
    expect(mockGetProductList(categoryId, true).length).toEqual(2);
  });

  it('getProductList: getParkId error, reject promise', function () {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, false, 'error'));

    var promise = productService.getProductList(categoryId);
    var result;
    promise.error(function(error) {
      result = error;
    });
    scope.$digest();

    expect(result).toEqual('error');
  });

  it('getProductList: http error, reject promise', function () {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));

    expect(mockGetProductList(categoryId, false)).toEqual('error');
  });

  it('getProductById: should return an Object', function () {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));

    var result = mockGetProductById(productId, true, product);
    expect(result instanceof Object).toBeTruthy();
    expect(result).toEqual(product);
  });

  it('getProductById: get park error', function () {
    var error = 'error';
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, false, error));

    var result;
    productService.getProductById(1)
      .error(function(error) {
        result = error;
      });

    scope.$digest();

    expect(result).toEqual(error);
  });

  it('getProductById: get product error', function () {
    spyOn(mockParkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));

    var error = 'error';
    var result = mockGetProductById(productId, false, error);
    expect(result).toEqual(error);
  });

  it('setFilterableAttributesOnProduct: should add filterable attributes to top level product', function () {
    productList.push(product);
    expect(productList[0].filterableAttributes).toBeUndefined();
    productService.setFilterableAttributesOnProduct(productList);
    expect(productList[0].filterableAttributes).toBeDefined();
    expect(productList[0].filterableAttributes.length).toEqual(1);
  });

  it('getProductVariantByAttributes: if no attributes, returned variant should be undefined', function() {
    var result = productService.getProductVariantByAttributes(product, null, null);
    expect(result).toBeUndefined();
  });

  it('getProductVariantByAttributes: if no attributes match, returned variant should be undefined', function() {
    var attributesObject = {
      'Length': 1234
    };
    var result = productService.getProductVariantByAttributes(product, null, attributesObject);
    expect(result).toBeUndefined();
  });

  it('getProductVariantByAttributes: if no attributes match, returned variant should be undefined', function() {
    var attributesArray = [{
      'name':'Length',
      'value': 1234
    }];
    var result = productService.getProductVariantByAttributes(product, attributesArray, null);
    expect(result).toBeUndefined();
  });

  it('getProductVariantByAttributes: attributesArray - if only one attribute matches, returned variant should be undefined', function() {
    var attributesArray = [{
      'name':'Size',
      'value': 999991
    }];
    var result = productService.getProductVariantByAttributes(product, attributesArray, null);
    expect(result).toBeUndefined();
  });

  it('getProductVariantByAttributes: attributesArray - if all attributes matches, variant should be returned', function() {
    var attributesArray = [
      {
        'name':'Size',
        'value': 999991 // Small
      },
      {
        'name':'Color',
        'value': 999994 // White
      }
    ];
    var result = productService.getProductVariantByAttributes(product, attributesArray, null);
    expect(result).toBeDefined();
    expect(result).toEqual(product.variants[2]);
  });

  it('getProductVariantByAttributes: attributesObject - if only one attribute matches, returned variant should be undefined', function() {
    var attributesObject = {
      'Size':999991
    };
    var result = productService.getProductVariantByAttributes(product, null, attributesObject);
    expect(result).toBeUndefined();
  });

  it('getProductVariantByAttributes: attributesObject - if all attributes matches, variant should be returned', function() {
    var attributesObject = {
        'Size': 999991, // Small
        'Color':999994 // White
      };
    var result = productService.getProductVariantByAttributes(product, null, attributesObject);
    expect(result).toBeDefined();
    expect(result).toEqual(product.variants[2]);
  });

  it('getProductVariantByAttributes: if product only has one variant, return that variant', function() {
    var attributesObject = null;
    var localProduct = angular.copy(product);
    localProduct.variants = localProduct.variants.slice(0,1);

    var result = productService.getProductVariantByAttributes(localProduct, null, attributesObject);
    expect(result).toEqual(localProduct.variants[0]);
  });

  it('getVariantPrice: should return product\'s standard price when no variant', function() {
    var result = productService.getVariantPrice(product, null);
    expect(result).toEqual(product.priceBookEntries[0].standardPrice);
  });

  it('getVariantPrice: should return product\'s variant standard price when variant exists', function() {
    var result = productService.getVariantPrice(product, product.variants[2]);
    expect(result).toEqual(product.variants[2].priceBookEntries[0].standardPrice);
  });

});