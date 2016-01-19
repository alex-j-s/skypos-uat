'use strict';

describe('Directive: ValidatePassword', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var compile, scope, form;

  var html = '<form name="form"><input sze-password-validate ng-model="model.password" name="password"></form>';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($compile, $rootScope) {

    scope = $rootScope.$new();
    compile = $compile;

    compile(html)(scope);
    form = scope.form;
  }));

  it('should reject passwords less than 8 characters', function(){
    form.password.$setViewValue('12345678');
    scope.$digest();

    expect(form.password.$error.passwordValidate).toBeTruthy();
    expect(form.password.$modelValue).toBeUndefined();
  });

  it('should reject passwords that don\'t meet the requirements', function(){
    form.password.$setViewValue('Trifecta00');
    scope.$digest();

    expect(form.password.$error.passwordValidate).toBeTruthy();
    expect(form.password.$modelValue).toBeUndefined();
  });

  it('should allow passwords that meet the requirements', function(){
    form.password.$setViewValue('Trifecta00*&');
    scope.$digest();

    expect(form.password.$error.passwordValidate).toBeUndefined();
    expect(form.password.$modelValue).toEqual('Trifecta00*&');
  });

  it('should allow passwords that meet the requirements with spaces', function(){
    form.password.$setViewValue('Trifecta 00*&');
    scope.$digest();

    expect(form.password.$error.passwordValidate).toBeUndefined();
    expect(form.password.$modelValue).toEqual('Trifecta 00*&');
  });

  it('should allow passwords that include all special characters', function(){
    form.password.$setViewValue('Trifecta00 ?!@#$%^&*()[]{}:;\'"/.\|');
    scope.$digest();

    expect(form.password.$error.passwordValidate).toBeUndefined();
    expect(form.password.$modelValue).toEqual('Trifecta00 ?!@#$%^&*()[]{}:;\'"/.\|');
  });

});