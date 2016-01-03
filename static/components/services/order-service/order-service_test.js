'use strict';

describe('Service: OrderService', function () {

  // load the controller's module
  beforeEach(module('skyZoneApp'));

  var rootScope, q, mockBackend, orderService, parkService, storageService;

  var parkId = '12345';
  var customerId = '1';

  var order = {
    'id': '1234',
    'numberOfProducts': 0,
    'signature': 'TicketOrderSignature',
    'orderItems': [
      {
        'id': '1234'
      },
      {
        'id': '1211',
        'reservation': {
          'id': '12'
        }
      }
    ]
  };

  var orders = [];
  orders.push(order);
  orders.push(order);

  var expectUpdateLocalOrder = function(_order) {
    var orderId;
    if(_order) {
      orderId = _order.id;
    }

    var localOrder = orderService.getLocalOrder();
    expect(localOrder).toEqual(_order);
    expect(storageService.setOrderId).toHaveBeenCalledWith(orderId);
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($rootScope, $httpBackend, $q, _OrderService_, _ParkService_, _StorageService_) {
    q = $q;
    rootScope = $rootScope;
    mockBackend = $httpBackend;

    orderService = _OrderService_;
    parkService = _ParkService_;

    storageService = _StorageService_;
    spyOn(storageService, 'setOrderId');
  }));

  it('createLineItem: should return a valid line item', function() {
    var lineItem = {
      'variantId': '12345',
      'quantity': 2,
      'reservationId': 'abcd'
    };

    var result = orderService.createLineItem(lineItem.variantId, lineItem.quantity, lineItem.reservationId);
    expect(result).toEqual(lineItem);
  });

  it('getOrders: get all orders for customer', function() {
    var orderStatus = '';

    mockBackend.expectGET('/api/orders?customerId='+customerId).respond(orders);

    var promise = orderService.getOrders(customerId, true, true, orderStatus);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orders);
  });

  it('getOrders: get incomplete orders for customer', function() {
    var orderStatus = 'incomplete';

    mockBackend.expectGET('/api/orders?customerId='+customerId+'&type=order&status=incomplete').respond(orders);

    var promise = orderService.getOrders(customerId, true, false, orderStatus);
    var result;
    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orders);
  });

  it('getOrders: get completed orders for customer', function() {
    var orderStatus = 'complete';

    mockBackend.expectGET('/api/orders?customerId='+customerId+'&type=order&status=complete').respond(orders);

    var promise = orderService.getOrders(customerId, true, false, orderStatus);
    var result;
    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orders);
  });

  it('getOrders: get all event orders for customer', function() {
    var orderStatus = '';

    mockBackend.expectGET('/api/orders?customerId='+customerId+'&type=event').respond(orders);

    var promise = orderService.getOrders(customerId, false, true, orderStatus);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orders);
  });

  it('getOrders: get incomplete event orders for customer', function() {
    var orderStatus = 'incomplete';

    mockBackend.expectGET('/api/orders?customerId='+customerId+'&type=event&status=incomplete').respond(orders);

    var promise = orderService.getOrders(customerId, false, true, orderStatus);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orders);
  });

  it('getOrders: get completed event orders for customer', function() {
    var orderStatus = 'complete';

    mockBackend.expectGET('/api/orders?customerId='+customerId+'&type=event&status=complete').respond(orders);

    var promise = orderService.getOrders(customerId, false, true, orderStatus);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orders);
  });

  it('deleteLocalOrder: should update current order to null', function() {
    orderService.deleteLocalOrder();
    expectUpdateLocalOrder(null);
  });

  it('getOrder: returns a promise', function() {
    mockBackend.expectGET('/api/orders/'+order.id).respond(order);

    var promise = orderService.getOrder(order.id);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
  });

  it('getCurrentOrder -- no order id: should update current order to null and return a promise', function() {
    spyOn(storageService, 'getOrderId').and.returnValue(null);

    var promise = orderService.getCurrentOrder();
    var result;

    promise.success( function(data) {
      result = data;
    });

    expect(result).toBeUndefined();
    expectUpdateLocalOrder(null);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('getCurrentOrder: should get and update current order to null and return a promise', function() {
    mockBackend.expectGET('/api/orders/'+order.id)
                            .respond(404);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.getCurrentOrder();
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toBeUndefined();
    // expectUpdateLocalOrder(null);

    // expect(storageService.getOrderId).toHaveBeenCalledWith();
    // expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('getCurrentOrder: should get and update current order and return a promise', function() {

    mockBackend.expectGET('/api/orders/'+order.id)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.getCurrentOrder();
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('getOrderLineItems -- no order id: should return null', function() {
    spyOn(storageService, 'getOrderId').and.returnValue(null);
    var promise = orderService.getOrderLineItems();
    var result;

    promise.success( function(data) {
      result = data;
    });

    expect(result).toBeUndefined();

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('getOrderLineItems -- error: should return null', function() {
    mockBackend.expectGET('/api/orders/'+order.id+'/line-items')
                            .respond(404);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.getOrderLineItems();
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toBeUndefined();

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('getOrderLineItems -- no order id: should return null', function() {
    mockBackend.expectGET('/api/orders/'+order.id+'/line-items')
                            .respond(order.orderItems);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.getOrderLineItems();
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order.orderItems);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addLineItemToOrder -- no order id: creates order then adds order item', function() {
    var orderObj = {
      'parkId': parkId
    };

    spyOn(storageService, 'getOrderId').and.returnValue(null);

    var lineItem = orderService.createLineItem('asdf',1,'asdff');

    spyOn(parkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));

    mockBackend.expectPOST('/api/orders', orderObj).respond(order);
    mockBackend.expectPOST('/api/orders/'+order.id+'/line-items', lineItem).respond(order);

    var promise = orderService.addLineItemToOrder(lineItem);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addLineItemToOrder -- no order id, error getting park info: creates order then adds order item', function() {
    var lineItem = orderService.createLineItem('asdf',1,'asdff');

    spyOn(storageService, 'getOrderId').and.returnValue(null);
    spyOn(parkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, false, 'error'));

    var promise = orderService.addLineItemToOrder(lineItem);
    var result;

    promise.error( function(error) {
      result = error;
    });

    rootScope.$digest();

    expect(result).toEqual('error');

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addLineItemToOrder -- no order id, error creating order: sets order to null', function() {
    var orderObj = {
      'parkId': parkId
    };

    var lineItem = orderService.createLineItem('asdf',1,'asdff');

    spyOn(storageService, 'getOrderId').and.returnValue(null);
    spyOn(parkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));

    mockBackend.expectPOST('/api/orders', orderObj).respond(404, 'error');

    var promise = orderService.addLineItemToOrder(lineItem);
    var result;

    rootScope.$digest();

    promise.error( function(error) {
      result = error;
    });

    mockBackend.flush();

    expect(result).toEqual('error');

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addLineItemToOrder -- no order id, error creating line item: sets order to null', function() {
    var orderObj = {
      'parkId': parkId
    };

    var lineItem = orderService.createLineItem('asdf',1,'asdff');

    spyOn(storageService, 'getOrderId').and.returnValue(null);
    spyOn(parkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));

    mockBackend.expectPOST('/api/orders', orderObj).respond(order);
    mockBackend.expectPOST('/api/orders/'+order.id+'/line-items', lineItem).respond(404, 'error');

    var promise = orderService.addLineItemToOrder(lineItem);
    var result;

    promise.error( function(error) {
      result = error;
    });

    mockBackend.flush();
    rootScope.$digest();

    expect(result).toEqual('error');
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addLineItemToOrder -- no order id: sets local order to order', function() {
    var orderObj = {
      'parkId': parkId
    };

    var lineItem = orderService.createLineItem('asdf',1,'asdff');

    spyOn(storageService, 'getOrderId').and.returnValue(null);
    spyOn(parkService, 'getParkId').and.returnValue(getPromiseObject(q, parkId, true));

    mockBackend.expectPOST('/api/orders', orderObj).respond(order);
    mockBackend.expectPOST('/api/orders/'+order.id+'/line-items', lineItem).respond(order);

    var promise = orderService.addLineItemToOrder(lineItem);
    var result;

    rootScope.$digest();

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addLineItemToOrder -- order exists: sets local order to new order', function() {
    var lineItem = orderService.createLineItem('asdf',1,'asdff');

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);
    mockBackend.expectPOST('/api/orders/'+order.id+'/line-items', lineItem).respond(order);

    var promise = orderService.addLineItemToOrder(lineItem);
    var result;

    rootScope.$digest();

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addLineItemToOrder -- order exists: error adding item results in error', function() {
    var lineItem = orderService.createLineItem('asdf',1,'asdff');

    mockBackend.expectPOST('/api/orders/'+order.id+'/line-items', lineItem).respond(404, 'error');

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.addLineItemToOrder(lineItem);
    var result;

    rootScope.$digest();

    promise.error( function(error) {
      result = error;
    });

    mockBackend.flush();

    expect(result).toEqual('error');

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('getOrderLineItem: return lineItem obj', function() {
    var lineItemId = 'adfadf';
    var lineItem = orderService.createLineItem('asdf',1,'asdff');
    mockBackend.expectGET('/api/orders/'+order.id+'/line-items/'+lineItemId)
                            .respond(lineItem);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.getOrderLineItem(lineItemId);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(lineItem);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('updateOrderLineItem: return order obj and updates local order', function() {
    var lineItemId = 'adfadf';
    var lineItem = orderService.createLineItem('asdf',1,'asdff');
    mockBackend.expectPUT('/api/orders/'+order.id+'/line-items/'+lineItemId, lineItem)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.updateOrderLineItem(lineItemId, lineItem);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('deleteOrderLineItem: return order obj and updates local order', function() {
    var lineItemId = 'adfadf';
    mockBackend.expectDELETE('/api/orders/'+order.id+'/line-items/'+lineItemId)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.deleteOrderLineItem(lineItemId);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addGiftCardPayment: return order obj and updates local order', function() {
    var payment = {
      'id':'adfadf'
    };
    mockBackend.expectPOST('/api/orders/'+order.id+'/payments/gift-card', payment)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.addGiftCardPayment(payment);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addCreditCardPayment: return order obj and updates local order', function() {
    var payment = {
      'id':'adfadf'
    };
    mockBackend.expectPOST('/api/orders/'+order.id+'/payments/credit-card', payment)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.addCreditCardPayment(payment);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('deleteOrderPayment: return order obj and updates local order', function() {
    var paymentId = 'adfadf';
    mockBackend.expectDELETE('/api/orders/'+order.id+'/payments/'+paymentId)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.deleteOrderPayment(paymentId);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('addOrderPromoCode: return order obj and updates local order', function() {
    var promoCode = {
      'discountCode':'adfadf'
    };
    mockBackend.expectPOST('/api/orders/'+order.id+'/promo-codes', promoCode)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.addOrderPromoCode(promoCode.discountCode);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('deleteOrderPromoCode: return order obj and updates local order', function() {
    var promoCode = 'adfadf';
    mockBackend.expectDELETE('/api/orders/'+order.id+'/promo-codes/'+promoCode)
                            .respond(order);

    spyOn(storageService, 'getOrderId').and.returnValue(order.id);

    var promise = orderService.deleteOrderPromoCode(promoCode);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(order);
    expectUpdateLocalOrder(order);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('processOrder - fully paid: returns order object with updated status and updates local order', function() {
    var orderCopy = angular.copy(order);
    orderCopy.status = 'Fully Paid';

    var orderStatus = {
      'status':'Fully Paid'
    };
    var isFullyPaid = true;

    mockBackend.expectPATCH('/api/orders/'+order.id, orderStatus)
                             .respond(orderCopy);

    spyOn(storageService, 'getOrderId').and.returnValue(orderCopy.id);

    var promise = orderService.processOrder(isFullyPaid);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orderCopy);
    expectUpdateLocalOrder(orderCopy);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('processOrder - not fully paid: returns order object with updated status and updates local order', function() {
    var orderCopy = angular.copy(order);
    orderCopy.status = 'Deposit Paid';

    var orderStatus = {
      'status':'Deposit Paid'
    };
    var isFullyPaid = false;

    mockBackend.expectPATCH('/api/orders/'+order.id, orderStatus)
                             .respond(orderCopy);

    spyOn(storageService, 'getOrderId').and.returnValue(orderCopy.id);

    var promise = orderService.processOrder(isFullyPaid);
    var result;

    promise.success( function(data) {
      result = data;
    });

    mockBackend.flush();

    expect(result).toEqual(orderCopy);
    expectUpdateLocalOrder(orderCopy);

    expect(storageService.getOrderId).toHaveBeenCalledWith();
    expect(storageService.getOrderId.calls.count()).toEqual(1);
  });

  it('isCartEmpty: return true if order is null', function() {
    var result = orderService.isCartEmpty(order);
    expect(result).toEqual(true);
  });

  it('isCartEmpty: return true if order has no products', function() {
    var result = orderService.isCartEmpty(order);
    expect(result).toEqual(true);
  });

  it('isCartEmpty: return false if order has products', function() {
    var tmp = order;
    tmp.numberOfProducts = 10;

    var result = orderService.isCartEmpty(tmp);
    expect(result).toEqual(false);
  });
});