function WaiverResolve(WaiverService, ParkService, $q, $route){
	var def = $q.defer();
    
    ParkService.getParks($route.current.params.parkUrlSegment).then(function(parksResp) {
	    WaiverService.getParkWaiverContent(parksResp.data[0].id).then(function(catResp) {
	    	console.log(catResp)
	    	if(catResp.data && catResp.data.length > 0){
		        def.resolve(catResp.data[0]);
	    	}
	    	else{
	    		def.resolve({});
	    	}
	    }, function(err) {
	        def.reject(err)
	    });
	}, function(err) {
        def.reject(err)
    });

    return def.promise;
	
}
