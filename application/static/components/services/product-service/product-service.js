'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.products:ProductService
 * @description
 * # ProductService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('ProductService', ['$http', 'ParkService', 'PromiseFactory', function($http, ParkService, PromiseFactory) {
    var self = this;
    
    self.currentProduct = {};

    self.getCurrentProduct = function(){
      return self.currentProduct;
    };

    self.setCurrentProduct = function(cp){
      self.currentProduct = cp;
    };

    self.setFilterableAttributesOnProduct = function(productList) {
      productList.forEach( function(product) {
        // for each product, set a filterable attributes list at top level
        var filterableAttributes = [];
        product.attributes.forEach( function(attribute) {
          if(attribute.type.toLowerCase() === 'filterable'){
            // var tempAttribute = {'name': attribute.name};
            // tempAttribute.values = [];
            attribute.values.forEach( function(value) {
              filterableAttributes.push(value);
            });
            // filterableAttributes.push(tempAttribute);
          }
        });
        product.filterableAttributes = filterableAttributes;
      });
    };

    self.findDurationOfProduct_MIN = function(p){
      var dur_min = 0;
      if(p.attributes){
        angular.forEach(p.attributes, function(attr, index){
          if(attr.name === 'Duration'){
            dur_min = parseInt(attr.value.value);
          }
        })
      }

      return dur_min;
    };

    self.findDurationOfProduct_MS = function(p){
      var dur_min = 0;
      if(p.attributes){
        angular.forEach(p.attributes, function(attr, index){
          if(attr.name === 'Duration'){
            dur_min = parseInt(attr.value.value);
          }
        })
      }

      return dur_min*60*1000;
    };

    self.getProductList = function(categoryId) {
      var deferred = PromiseFactory.getInstance();

      ParkService.getParkId()
        .success(function(parkId) {

          $http.get('/api/parks/'+parkId+'/catalog/productsFromTopCategory?categoryId='+categoryId)
            .success(function(list) {
              deferred.resolve(list);
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

    self.getProductByParkAndId = function(parkUrlSegment, productId) {
      var deferred = PromiseFactory.getInstance();

      ParkService.getParks(parkUrlSegment)
        .success(function(parkResp) {

          if(parkResp.length === 1){
            $http.get('/api/parks/'+parkResp[0].id+'/catalog/products/'+productId)
              .success(function(product) {
                deferred.resolve(product);
              })
              .error(function(error) {
                deferred.reject(error);
              });
          }else{
            deferred.reject('Could not find park');
          }

        })
        .error(function(error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };

    self.getProductsByActivityType = function(activityType) {
      var deferred = PromiseFactory.getInstance();

      ParkService.getParkId()
        .success(function(parkId) {

          $http.get('/api/parks/'+parkId+'/activities/products?activity='+activityType)
            .success(function(products) {
              angular.forEach(products, function(p){
                p.quantity = 0;
              })
              deferred.resolve(products);
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

    self.getProductById = function(productId) {
      var deferred = PromiseFactory.getInstance();

      ParkService.getParkId()
        .success(function(parkId) {

          $http.get('/api/parks/'+parkId+'/catalog/products/'+productId)
            .success(function(product) {
              deferred.resolve(product);
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

    self.getProductVariantByAttributes = function(product, attributeArray, attributeObject) {
      /**
        attributeArray should be an object array with
        attribute name and value defined for each
      **/
      var selectedProductAttributes = attributeObject;

      if( !selectedProductAttributes && attributeArray) {
        attributeArray.map(function(a) {
          if(!selectedProductAttributes) {
            selectedProductAttributes = {};
          }
          selectedProductAttributes[a.name] = a.value;
        });
      }

      console.log(selectedProductAttributes);

      var selectedVariant;
      // only execute if a product is selected
      if(selectedProductAttributes) {

        product.variants.some(function(variant) {

          var isVariantMatch = true;

          variant.attributes.forEach(function(attr) {
            var attributeId = parseInt(selectedProductAttributes[attr.name],10);
            if( attributeId &&
                attributeId === attr.value.id) {
              // if match, do nothing
            }else{
              isVariantMatch = false;
            }
          });

          if(isVariantMatch) {
            selectedVariant = variant;

            // break 'some' loop
            return true;
          }

        });

      }else if(product.variants.length === 1){
        selectedVariant = product.variants[0];
      }

      return selectedVariant;
    };

    self.getVariantPrice = function(product, variant) {
      console.log(product, variant);
      return (variant) ? variant.priceBook.priceBookEntries[0].standardPrice : product.priceBook.priceBookEntries[0].standardPrice;
    };

  }]);