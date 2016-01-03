'use strict';

describe('Service: HmacService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var service;
  var getConfig = {
    'url': '/api/current-user',
    'method': 'GET',
    'headers': {
      'X-ApiKey': 'asdf1123',
      'X-Date': new Date()
    }
  };

  var postConfig = {
    'url': '/api/tokens',
    'method': 'POST',
    'headers': {
      'X-ApiKey': 'asdf1123',
      'X-Date': new Date(),
      'Content-Type': 'application/json',
      'Content-MD5': 'asdf7asfd8uasjfd'
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_HmacService_) {
    service = _HmacService_;
  }));

  it('getHmacFromRequest - GET: should call getRequestString with correct params', function() {
    var requestStr = 'string';
    spyOn(service, 'getRequestString').and.returnValue(requestStr);
    spyOn(service, 'getHmacB64');

    service.getHmacFromRequest(getConfig);

    expect(service.getRequestString).toHaveBeenCalledWith(getConfig.method, getConfig.url.replace('/api',''), '', getConfig.headers['X-Date'], '', getConfig.headers['X-ApiKey']);
    expect(service.getRequestString.calls.count()).toEqual(1);

    expect(service.getHmacB64).toHaveBeenCalledWith(requestStr);
    expect(service.getHmacB64.calls.count()).toEqual(1);
  });

  it('getHmacFromRequest - POST: should call getRequestString with correct params', function() {
    var requestStr = 'string';
    spyOn(service, 'getRequestString').and.returnValue(requestStr);
    spyOn(service, 'getHmacB64');

    service.getHmacFromRequest(postConfig);

    expect(service.getRequestString).toHaveBeenCalledWith(postConfig.method, postConfig.url.replace('/api',''), postConfig.headers['Content-Type'], postConfig.headers['X-Date'], postConfig.headers['Content-MD5'], postConfig.headers['X-ApiKey']);
    expect(service.getRequestString.calls.count()).toEqual(1);

    expect(service.getHmacB64).toHaveBeenCalledWith(requestStr);
    expect(service.getHmacB64.calls.count()).toEqual(1);
  });

  it('getRequestString: with no request body', function() {
    var result = service.getRequestString(getConfig.method, getConfig.url, '', getConfig.headers['X-Date'], '', getConfig.headers['X-ApiKey']);
    expect(result).toEqual(getConfig.method + getConfig.url + getConfig.headers['X-Date'] + getConfig.headers['X-ApiKey']);
  });

  it('getRequestString: with request body', function() {
    var result = service.getRequestString(postConfig.method, postConfig.url, postConfig.headers['Content-Type'], postConfig.headers['X-Date'], postConfig.headers['Content-MD5'], postConfig.headers['X-ApiKey']);
    expect(result).toEqual(postConfig.method + postConfig.url + postConfig.headers['Content-Type'] + postConfig.headers['X-Date'] + postConfig.headers['Content-MD5'] + postConfig.headers['X-ApiKey']);
  });

  it('getHmacB64: compare str to knownHmac using secret key', function() {
    var str = 'foobar';
    var knownHmac = 'z+/t7kW0X9Fyf0Vn9FzK1OFpYUXW16pytHNBHSiJ5a7WtXB4/KDxjcDCqifai1BLiNqJISAfGRP3FKA81wSijg==';

    var result = service.getHmacB64(str);
    expect(result).toEqual(knownHmac);
  });


});