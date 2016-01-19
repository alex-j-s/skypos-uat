'use strict';

describe('Factory: PaginationFactory', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var factory;

  var defaultPagination = {
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 5,
    maxSize: 5,
    rotate: true
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_PaginationFactory_) {
    factory = _PaginationFactory_;
  }));

  it('getInstance: should return pagination object with default values set', function() {
    var paginationObj = factory.getInstance();
    expect(paginationObj.totalItems).toEqual(defaultPagination.totalItems);
    expect(paginationObj.currentPage).toEqual(defaultPagination.currentPage);
    expect(paginationObj.itemsPerPage).toEqual(defaultPagination.itemsPerPage);
    expect(paginationObj.maxSize).toEqual(defaultPagination.maxSize);
    expect(paginationObj.rotate).toEqual(defaultPagination.rotate);
  });

  it('getInstance: should return pagination object with exception values set', function() {
    var expectedPagination = angular.copy(defaultPagination);
    var itemsPerPage = 10;
    expectedPagination.totalItems = 1;
    expectedPagination.itemsPerPage = itemsPerPage;

    var paginationObj = factory.getInstance(['1'], itemsPerPage);
    expect(paginationObj.totalItems).toEqual(expectedPagination.totalItems);
    expect(paginationObj.currentPage).toEqual(expectedPagination.currentPage);
    expect(paginationObj.itemsPerPage).toEqual(expectedPagination.itemsPerPage);
    expect(paginationObj.maxSize).toEqual(expectedPagination.maxSize);
    expect(paginationObj.rotate).toEqual(expectedPagination.rotate);
  });

});