'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services:ReservationService
 * @description
 * # ReservationService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('ReservationService', ['$http', '$q', 'PromiseFactory', 'ParkService','ProfileService', '$filter', 'OrderService', function($http, $q, PromiseFactory, ParkService,ProfileService, $filter, OrderService) {
    var self = this;

    self.RESULT_TYPE_FULL = 'full';
    self.RESULT_TYPE_SUMMARY = 'summary';

    self.getProductAvailability = function(activityType, guests, startDate, endDate, startTime, endTime, includeProduct) {
      var deferred = PromiseFactory.getInstance();

      ParkService.getParkId()
        .success(function(parkId) {

          var baseUrl = '/api/parks/'+parkId+'/availabilityByPark?guests='+guests+'&programType='+activityType; //these are required
          var startDateStr = '&startDate='+startDate;
          var endDateStr = '&endDate='+endDate;
          var startTimeStr = '&startTime='+startTime;
          var endTimeStr = '&endTime='+endTime;
          var includeProductStr = '&productInclude='+includeProduct;

          var url = baseUrl;

          if(startDate && endDate) {
            url += startDateStr + endDateStr;
          }

          // if(startTime) {
          //   url += startTimeStr;
          // }

          // if(endTime) {
          //   url += endTimeStr;
          // }

          if(includeProduct) {
            url += includeProductStr;
          }

          $http.get(url)
            .success(function(availability) {
              angular.forEach(availability.dates, function(dateObj){
                self.treatSlots(dateObj.timeSlots);
              })
              deferred.resolve(availability);
            })
            .error(function(error) {
              deferred.reject(error);
            });
      })
      .error(function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    };

    self.treatSlots = function (timeSlots){
      angular.forEach(timeSlots, function(slot){
        slot.label = self.generateTimeSlotLabel(slot);
        slot.tsIndex = self.generateTimeSlotIndex(slot);
        slot.ticketLabel = self.generateTimeSlotTicketLabel(slot);


      });
    };


    self.generateTimeSlotTicketLabel = function(timeSlot){
        return (timeSlot.availableCapacity > 1) ? timeSlot.availableCapacity + ' tickets':timeSlot.availableCapacity + ' ticket';
    };

    self.generateTimeSlotIndex = function(slot){
      var str = self.formatHourString(slot.startTime);
      return parseInt(str.replace(':', ''));
    };

    self.generateTimeSlotLabel = function(timeSlot){
        return $filter('ampm')(self.formatHourString(timeSlot.startTime)) + ' - ' + $filter('ampm')(self.formatHourString(timeSlot.endTime));
    };

    self.formatHourString = function(hourString){
      var min, hr;
      if(hourString.indexOf(':') > -1){
        min = hourString.split(':')[1]
        min += '0';
        hr = hourString.split(':')[0];
        return hr+':'+min.substring(0,2);
      }
      else{
        return hourString;
      }
    };

    // this takes a product list and gets availability for a specific day
    // needs to check availability for each variant of the product
    self.getProductAndVariantAvailabilityForDate = function(productList, date) {
      var deferred = PromiseFactory.getInstance();

      // guests will be the minimum for this call
      var guests = 1;

      var promiseArray = [];

      productList.forEach(function(product) {

        product.variants.forEach(function(variant) {
          var resourceIds = [variant.id];

          promiseArray.push(self.getProductAvailability(resourceIds, guests, date, date, null, null, self.RESULT_TYPE_SUMMARY));

        });

      });

      var variants = [];
      productList.forEach(function(product){
        product.variants.forEach(function(variant) {
          variants.push(variant);
        });
      });

      $q.all(promiseArray).then(function(availabilityArray){
        for(var i=0; i<availabilityArray.length; i++) {
          variants[i].hasAvailability = availabilityArray[i].dates[0].hasAvailability;
        }

        productList.forEach(function(product) {
          product.hasAvailability = false;
          product.variants.forEach(function(variant) {
            if(variant.hasAvailability === true) {
              product.hasAvailability = true;
            }else{

              // if no availability, set availability flag on product attribute
              self.setDurationAttributeUnavailableFlag(product, variant);
            }
          });
        });

        deferred.resolve(productList);
      },
      function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    };

    self.setDurationAttributeUnavailableFlag = function(product, variant) {
      var attributeId;

      variant.attributes.some(function(attr) {
        if(attr.name === 'Duration') {
          attributeId = attr.value.id;
          return true;
        }
      });

      product.attributes.forEach(function(attr) {
        if(attr.name === 'Duration') {
          attr.values.some(function(value){
            if(value.id === attributeId) {
              value.hasAvailability = false;
              return true;
            }
          });
        }
      });
    };

    self.createReservation = function(resourceMap, startDate, startTime) {

      var deferred = PromiseFactory.getInstance();

      var details = self.createReservationRequest(resourceMap, startDate, startTime);

      ParkService.getParkId()
        .success(function(parkId) {
          $http.post('/api/parks/'+parkId+'/reservations', details)
            .success(function(data) {
              deferred.resolve(data);
            }).error(function(error) {
                deferred.reject(error);
              });
        })
        .error(function(error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };

    self.createReservationRequest = function(resourceMap, startDate, startTime){

      var request = {
        'reservationRequest':[]
      };

      angular.forEach(resourceMap, function(quantity, resourceId){
        request.reservationRequest.push(self.createReservationItem(resourceId, quantity, startDate, startTime));
      });

      return request;
    };

    self.createReservationItem = function(resourceId, guests, startDate, startTime){
      return {
        'resourceId': resourceId,
        'numberOfGuests': guests,
        'startDate': startDate,
        'startTime': startTime //this needs to be in 24hr format HH:mm
      };
    };


      self.findReservation = function(guest) {

        var deferred = PromiseFactory.getInstance();

        ProfileService.customerSearch(guest)
            .success(function(customers) {
              if(customers.length === 1){
                OrderService.orderSearch(OrderService.createOrderSearch({'customerId':customers[0].id}))
                  .then(function(data) {
                    customers[0].reservation = data.data;
                      deferred.resolve(customers[0]);
                    }, function(err){
                      deferred.reject(err);
                    });
              }
              else{
                deferred.reject('Unable to find guest.');
              }
            })
            .error(function(error) {
              deferred.reject(error);
            });

        return deferred.promise
      }


  }]);
