'use strict';

angular.module('skyZoneApp')
    .filter('ProductTypes', function(){
    	return function(input, filterTypes) {
    		var out = [];
    		angular.forEach(input, function(p){
    			if(filterTypes.indexOf(p.type) > -1) {
    				out.push(p);
    			}
    		})
    		return out;
    	};
    });