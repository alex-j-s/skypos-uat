'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.factories:PaginationFactory
 * @description
 * # PaginationFactory
 * Factory of the skyZoneApp
 */


angular.module('skyZoneApp')
  .factory('PaginationFactory', [ function() {

    var maxSize = 5;
    var itemsPerPage = 5;

    var PaginationObj = function(items, _itemsPerPage) {
      this.totalItems = (items) ? items.length : 0;
      this.currentPage = 1;
      this.itemsPerPage = (_itemsPerPage) ? _itemsPerPage : itemsPerPage;
      this.maxSize = 5;
      this.rotate = true;
    };

    return {
      getInstance: function(items, _itemsPerPage) {
        return new PaginationObj(items, _itemsPerPage);
      }
    };

  }]);
