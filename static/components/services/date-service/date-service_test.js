'use strict';

describe('Service: DateService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var dateService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_DateService_) {
    dateService = _DateService_;
  }));

  it('getDisplayDate: if no date, return empty string', function() {
    var result = dateService.getDisplayDate('abacds');
    expect(result).toEqual('');
  });

  it('getApiDateFormat: if no date, return empty string', function() {
    var result = dateService.getApiDateFormat('abacds');
    expect(result).toEqual('');
  });

  it('getDisplayDate: if date, return in display format (MM/dd/yyyy)', function() {
    var result = dateService.getDisplayDate( new Date(2015,10,12) );
    expect(result).toEqual('11/12/2015');

    result = dateService.getDisplayDate( new Date(2015,0,1) );
    expect(result).toEqual('01/01/2015');
  });

  it('getApiDateFormat: if date, return in display format (MM/dd/yyyy)', function() {
    var result = dateService.getApiDateFormat( new Date(2015,10,12) );
    expect(result).toEqual('2015-11-12');

    result = dateService.getApiDateFormat( new Date(2015,0,1) );
    expect(result).toEqual('2015-01-01');
  });

  it('formatDateDigit: only if less than 10, should prepend a 0 and return String', function(){
    expect(dateService.formatDateDigit(1)).toEqual('01');
    expect(dateService.formatDateDigit(2)).toEqual('02');
    expect(dateService.formatDateDigit(3)).toEqual('03');

    expect(dateService.formatDateDigit(11)).toEqual('11');
    expect(dateService.formatDateDigit(12)).toEqual('12');
    expect(dateService.formatDateDigit(13)).toEqual('13');
  });


});