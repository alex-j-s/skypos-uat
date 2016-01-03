'use strict';

describe('Controller: BirthdayDropdownCtrl', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var ctrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {

    scope = $rootScope.$new();
    ctrl = $controller('BirthdayDropdownCtrl', {
      $scope: scope
    });
  }));

  it('onLoad: days should be populated with 31 days', function() {
    expect(ctrl.days.length).toEqual(31);
    expect(ctrl.days instanceof Array).toBeTruthy();
  });

  it('onLoad: years should be populated', function() {
    expect(ctrl.years.length > 0).toBeTruthy();
    expect(ctrl.years instanceof Array).toBeTruthy();
  });

  it('onBirthdayChange: should call prepopulateBirthday', function() {
    spyOn(ctrl, 'prepopulateBirthday');

    scope.fullBirthday = '2015-01-01';
    scope.$digest();

    scope.fullBirthday = '2015-01-02';
    scope.$digest();

    expect(ctrl.prepopulateBirthday).toHaveBeenCalledWith();
    expect(ctrl.prepopulateBirthday.calls.count()).toEqual(2);
  });

  it('calculateDays: should return array of strings', function(){
    expect(ctrl.calculateDays(29).length).toEqual(29);
    expect(ctrl.calculateDays(31).length).toEqual(31);

    expect(ctrl.calculateDays(31) instanceof Array).toBeTruthy();
  });

  it('calculateDays: should return array that starts with 01 and is prefixed with a 0', function(){
    expect(ctrl.calculateDays(29)[0]).toEqual('01');
  });

  it('getYears: should return array of strings', function(){
    expect(ctrl.getYears() instanceof Array).toBeTruthy();
  });

  it('getYears: should return array that starts with current year', function(){
    expect(ctrl.getYears()[0]).toEqual( new Date().getFullYear() );
  });

  it('isLeapYear: should check if leapYear is true', function(){
    expect(ctrl.isLeapYear(2006)).toBeFalsy();
    expect(ctrl.isLeapYear(2007)).toBeFalsy();
    expect(ctrl.isLeapYear(2008)).toBeTruthy();
    expect(ctrl.isLeapYear(2009)).toBeFalsy();
    expect(ctrl.isLeapYear(2010)).toBeFalsy();
    expect(ctrl.isLeapYear(2011)).toBeFalsy();
    expect(ctrl.isLeapYear(2012)).toBeTruthy();
    expect(ctrl.isLeapYear(2013)).toBeFalsy();
    expect(ctrl.isLeapYear(2014)).toBeFalsy();
  });

  it('isLeapYear: should return true if no year selected yet', function(){
    expect(ctrl.isLeapYear(null)).toBeTruthy();
    expect(ctrl.isLeapYear('')).toBeTruthy();
  });

  it('updateDays: should set days to 31 if no month selected yet', function(){
    //set self.days to empty
    ctrl.days = [];

    ctrl.updateDays();
    expect(ctrl.days instanceof Array).toBeTruthy();
    expect(ctrl.days.length).toEqual(31);
  });

  it('updateDays: should set days to 30 if month selected has 30 days', function(){
    var months = [4,6,9,11];

    //set self.days to empty
    ctrl.days = [];

    for( var i = 0; i < months.length; i++){
      ctrl.birthdayMonth = months[i];
      ctrl.updateDays();
      expect(ctrl.days instanceof Array).toBeTruthy();
      expect(ctrl.days.length).toEqual(30);
    }
  });

  it('updateDays: should set days to 31 if month selected has 31 days', function(){
    var months = [1,3,5,7,8,10,12];

    //set self.days to empty
    ctrl.days = [];

    for( var i = 0; i < months.length; i++){
      ctrl.birthdayMonth = months[i];
      ctrl.updateDays();
      expect(ctrl.days instanceof Array).toBeTruthy();
      expect(ctrl.days.length).toEqual(31);
    }
  });

  it('updateDays: should set days to 29 if month selected is February and it\'s a leap year', function(){
    //set self.days to empty
    ctrl.days = [];
    ctrl.birthdayMonth = 2;
    ctrl.birthdayYear = 2012;
    ctrl.updateDays();
    expect(ctrl.days instanceof Array).toBeTruthy();
    expect(ctrl.days.length).toEqual(29);
  });

  it('updateDays: should set days to 28 if month selected is February and it\'s a not leap year', function(){
    //set self.days to empty
    ctrl.days = [];
    ctrl.birthdayMonth = 2;
    ctrl.birthdayYear = 2015;
    ctrl.updateDays();
    expect(ctrl.days instanceof Array).toBeTruthy();
    expect(ctrl.days.length).toEqual(28);
  });

  it('updateBirthday: should set date in string format of yyyy-MM-dd', function(){
    ctrl.birthdayMonth = '01';
    ctrl.birthdayDay = '02';
    ctrl.birthdayYear = '2000';

    ctrl.updateBirthday();

    expect(scope.fullBirthday).toEqual('2000-01-02');
  });

  it('updateBirthday: should not set date', function(){
    ctrl.birthdayMonth = '';
    ctrl.birthdayDay = '02';
    ctrl.birthdayYear = '2000';

    ctrl.updateBirthday();

    expect(scope.fullBirthday).toBeUndefined();
  });

  it('prepopulateBirthday: should prepopulate birthday if exists' , function() {
    scope.fullBirthday = '2000-01-12';
    expect(scope.fullBirthday).toBeDefined();

    ctrl.prepopulateBirthday();

    expect(ctrl.birthdayMonth).toEqual('01');
    expect(ctrl.birthdayDay).toEqual('12');
    expect(ctrl.birthdayYear).toEqual(2000);
  });

  it('prepopulateBirthday: should not prepopulate birthday if DNE' , function() {
    expect(scope.fullBirthday).toBeUndefined();

    ctrl.prepopulateBirthday();

    expect(ctrl.birthdayMonth).toBeUndefined();
    expect(ctrl.birthdayDay).toBeUndefined();
    expect(ctrl.birthdayYear).toBeUndefined();
  });

  it('prepopulateBirthday: should not prepopulate birthday if not a valid date' , function() {
    scope.fullBirthday = 'asdfasdf';
    expect(scope.fullBirthday).toBeDefined();

    ctrl.prepopulateBirthday();

    expect(ctrl.birthdayMonth).toBeUndefined();
    expect(ctrl.birthdayDay).toBeUndefined();
    expect(ctrl.birthdayYear).toBeUndefined();
  });

});