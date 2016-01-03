'use strict';

describe('Directive: ValidateEmail', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var compile, scope, form;

  var html = '<form name="form"><input sze-email-validate ng-model="model.email" name="email"></form>';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($compile, $rootScope) {

    scope = $rootScope.$new();
    compile = $compile;

    compile(html)(scope);
    form = scope.form;
  }));

  it('should reject emails that do not meet requirements of a@a.a', function() {
    form.email.$setViewValue('test@email.com');
    scope.$digest();

    expect(form.email.$error.emailValidate).toBeUndefined();
    expect(form.email.$modelValue).toEqual('test@email.com');
  });

  it('should reject emails that do not meet requirements', function() {
    form.email.$setViewValue('test@email.');
    scope.$digest();

    expect(form.email.$error.emailValidate).toEqual(true);
    expect(form.email.$modelValue).toBeUndefined();
  });

  it('should reject emails that do not meet requirements', function() {
    form.email.$setViewValue('test@.com');
    scope.$digest();

    expect(form.email.$error.emailValidate).toEqual(true);
    expect(form.email.$modelValue).toBeUndefined();
  });

  it('should reject emails that do not meet requirements', function() {
    form.email.$setViewValue('testemail.com');
    scope.$digest();

    expect(form.email.$error.emailValidate).toEqual(true);
    expect(form.email.$modelValue).toBeUndefined();
  });
});