function CatalogResolve(CatalogService, ParkService, $q, $route) {
    var def = $q.defer();
    ParkService.getParks($route.current.params.parkUrlSegment).then(function(parksResp) {
	    CatalogService.getCatalog(parksResp.data[0].id).then(function(catResp) {
	    	console.log(catResp)
	        def.resolve(catResp);
	    }, function(err) {
	        def.reject(err)
	    });
	}, function(err) {
        def.reject(err)
    });

    return def.promise;
}