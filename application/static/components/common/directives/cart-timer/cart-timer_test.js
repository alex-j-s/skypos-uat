'use strict';

describe('Controller: ReservationTimerCtrl', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var ctrl, scope, interval, modal, orderService;

  var resItem = {
      'id': 'jumpItemId',
      'reservation': {
         'id': '1234',
         'resourceId': '11116',
         'numberOfGuests': 4,
         'status': 'Pending',
         'dateExpires':'2015-03-10T12:05:00-0500',
         'startDate': '2015-05-01',
         'startTime': '13:00',
         'endTime': ''
       }
    };

  var fakeModal = {
    result: {
        then: function(confirmCallback, cancelCallback) {
            //Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
            this.confirmCallBack = confirmCallback;
            this.cancelCallback = cancelCallback;
        }
    },
    close: function( item ) {
      //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
      this.result.confirmCallBack( item );
    },
    dismiss: function( type ) {
        //The user clicked cancel on the modal dialog, call the stored cancel callback
        this.result.cancelCallback( type );
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($q, $controller, $rootScope, _$interval_, _$modal_, _OrderService_, _DateService_) {
    orderService = _OrderService_;
    spyOn(orderService, 'deleteOrderLineItem').and.returnValue(getPromiseObject($q, '', true));

    modal = _$modal_;
    spyOn(modal, 'open').and.returnValue(fakeModal);

    interval = _$interval_;
    spyOn(interval, 'cancel').and.callThrough();

    scope = $rootScope.$new();
    spyOn(scope.$parent, '$broadcast').and.callThrough();

    ctrl = $controller('ReservationTimerCtrl', {
      $scope: scope,
      $interval: interval,
      $modal: _$modal_,
      DateService: _DateService_
    });
  }));

  it('onBroadcast: if order has no reservation, don\'t show timer', function () {
    scope.$broadcast('orderReservationCheck', null);

    expect(ctrl.reservationItem).toBe(null);
    expect(interval.cancel).toHaveBeenCalled();
  });

  it('onBroadcast: if order has reservation, start timer', function () {
    spyOn(ctrl, 'startCountdown');

    scope.$broadcast('orderReservationCheck', resItem);

    expect(ctrl.reservationItem).toBe(resItem);
    expect(ctrl.startCountdown).toHaveBeenCalled();
    expect(ctrl.startCountdown.calls.count()).toEqual(1);
  });

  it('onBroadcast: if multiple broadcasts, don\'t start timer again', function () {
    spyOn(ctrl, 'startCountdown').and.callThrough();

    scope.$broadcast('orderReservationCheck', resItem);
    scope.$broadcast('orderReservationCheck', resItem);

    expect(ctrl.reservationItem).toBe(resItem);
    expect(ctrl.startCountdown).toHaveBeenCalled();
    expect(ctrl.startCountdown.calls.count()).toEqual(1);
  });

  it('startCountdown: should have 15 minutes left on the countdown and decrement every second', function() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var day = now.getDate();

    var hours = now.getHours();
    var minutes = now.getMinutes()+15;
    var seconds = now.getSeconds()+1;

    var dateStr = year+'-'+month+'-'+day+'T'+hours+':'+minutes+':'+seconds+'-0400';
    ctrl.startCountdown(dateStr);

    expect(ctrl.timeRemainingStr).toEqual('15 minutes 0 seconds');
    interval.flush(1000);
    expect(ctrl.timeRemainingStr).toEqual('14 minutes 59 seconds');
    interval.flush(1000);
    expect(ctrl.timeRemainingStr).toEqual('14 minutes 58 seconds');
  });

  it('startCountdown: should have 3 seconds left on the countdown and decrement every second and on zero, handle expiration', function() {
    spyOn(ctrl, 'handleExpiredReservation');
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var day = now.getDate();

    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds()+4;

    var dateStr = year+'-'+month+'-'+day+'T'+hours+':'+minutes+':'+seconds+'-0400';
    ctrl.startCountdown(dateStr);

    expect(ctrl.timeRemainingStr).toEqual('3 seconds');
    interval.flush(1000);
    expect(ctrl.timeRemainingStr).toEqual('2 seconds');
    interval.flush(1000);
    expect(ctrl.timeRemainingStr).toEqual('1 seconds');
    interval.flush(1000);
    expect(ctrl.timeRemainingStr).toEqual('0 seconds');
    interval.flush(1000);

    expect(interval.cancel).toHaveBeenCalled();
    expect(interval.cancel.calls.count()).toEqual(1);
    expect(ctrl.handleExpiredReservation).toHaveBeenCalled();
    expect(ctrl.handleExpiredReservation.calls.count()).toEqual(1);
  });

  it('startCountdown: should have 0 minutes left on the countdown and should cancel the interval and call handleExpiredReservation', function() {
    spyOn(ctrl, 'handleExpiredReservation');
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var day = now.getDate();

    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    var dateStr = year+'-'+month+'-'+day+'T'+hours+':'+minutes+':'+seconds+'-0400';
    ctrl.startCountdown(dateStr);

    expect(ctrl.timeRemainingStr).toEqual('0 seconds');
    interval.flush(1000);

    expect(interval.cancel).toHaveBeenCalled();
    expect(interval.cancel.calls.count()).toEqual(1);
    expect(ctrl.handleExpiredReservation).toHaveBeenCalled();
    expect(ctrl.handleExpiredReservation.calls.count()).toEqual(1);
  });

  it('handleExpiredReservation: should open modal, onClose should remove reservation item', function() {
    spyOn(ctrl, 'removeReservationItem');
    ctrl.handleExpiredReservation();

    expect(modal.open).toHaveBeenCalled();
    expect(modal.open.calls.count()).toEqual(1);

    fakeModal.close('redirect');

    expect(ctrl.removeReservationItem).toHaveBeenCalledWith(false);
    expect(ctrl.removeReservationItem.calls.count()).toEqual(1);
  });

  it('handleExpiredReservation: should open modal, on dismiss should remove reservation item', function() {
    spyOn(ctrl, 'removeReservationItem');
    ctrl.handleExpiredReservation();

    expect(modal.open).toHaveBeenCalled();
    expect(modal.open.calls.count()).toEqual(1);

    fakeModal.dismiss('');

    expect(ctrl.removeReservationItem).toHaveBeenCalledWith(true);
    expect(ctrl.removeReservationItem.calls.count()).toEqual(1);
  });

  it('removeReservationItem: should not remove resItem if it does not exist', function() {
    ctrl.removeReservationItem(false);
    expect(orderService.deleteOrderLineItem).not.toHaveBeenCalled();
  });

  it('removeReservationItem: should remove resItem if it exists', function() {
    ctrl.reservationItem = resItem;
    ctrl.removeReservationItem(false);

    scope.$digest();

    expect(orderService.deleteOrderLineItem).toHaveBeenCalled();
    expect(scope.$parent.$broadcast).not.toHaveBeenCalled();
  });

  it('removeReservationItem: should remove resItem if it exists, should send broadcast', function() {
    ctrl.reservationItem = resItem;
    ctrl.removeReservationItem(true);

    scope.$digest();

    expect(orderService.deleteOrderLineItem).toHaveBeenCalled();
    expect(scope.$parent.$broadcast).toHaveBeenCalled();
  });
});