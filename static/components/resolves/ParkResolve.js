function ParkResolve(ParkService, $q, $route) {
    var def = $q.defer();
    ParkService.getParks($route.current.params.parkUrlSegment).then(function(parksResp) {
    	console.log(parksResp)
        ParkService.setPark(parksResp.data[0]);
        def.resolve(ParkService.getCurrentPark());
    }, function(err) {
        def.reject(err)
    });

    return def.promise;
}
