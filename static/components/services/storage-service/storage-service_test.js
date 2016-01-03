'use strict';

describe('Service: StorageService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var service, window;

  var token = 'VALIDTOKEN';
  var parkUrlSegment = 'everett';
  var authStorageKey = 'authToken';
  var parkStorageKey = 'parkUrlSegment';

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$window_, _StorageService_) {
    window = _$window_;
    service = _StorageService_;
  }));

  it('getAuthToken: should return token in local storage', function() {
    window.localStorage[authStorageKey] = token;

    var result = service.getAuthToken();
    expect(result).toEqual(token);
  });

  it('setAuthToken: verified', function() {
    spyOn(service, 'handleSet');
    service.setAuthToken(token, true);

    expect(service.handleSet).toHaveBeenCalledWith(authStorageKey, token);
    expect(service.handleSet.calls.count()).toEqual(1);

    var unverifiedToken = service.getUnverifiedToken();
    expect(unverifiedToken).toEqual(null);
  });

  it('setAuthToken: unverified', function() {
    spyOn(service, 'handleSet');
    service.setAuthToken(token, false);

    expect(service.handleSet).not.toHaveBeenCalled();
    expect(service.handleSet.calls.count()).toEqual(0);

    var unverifiedToken = service.getUnverifiedToken();
    expect(unverifiedToken).toEqual(token);
  });

  it('getParkUrlSegment: should return parkUrlSegment in local storage', function() {
    window.localStorage[parkStorageKey] = parkUrlSegment;

    var result = service.getParkUrlSegment();
    expect(result).toEqual(parkUrlSegment);
  });

  it('setParkUrlSegment: should set token', function() {
    spyOn(service, 'handleSet');

    service.setParkUrlSegment(parkUrlSegment);

    expect(service.handleSet).toHaveBeenCalledWith(parkStorageKey, parkUrlSegment);
    expect(service.handleSet.calls.count()).toEqual(1);
  });

  it('handleSet: if value null, delete storage', function() {
    window.localStorage[parkStorageKey] = parkUrlSegment;

    expect(service.getParkUrlSegment()).toEqual(parkUrlSegment);

    service.handleSet(parkStorageKey, null);

    expect(service.getParkUrlSegment()).toBeUndefined();
  });

  it('handleSet: if value not null, delete storage', function() {
    expect(service.getParkUrlSegment()).toBeUndefined();

    service.handleSet(parkStorageKey, parkUrlSegment);

    expect(service.getParkUrlSegment()).toEqual(parkUrlSegment);
  });

});