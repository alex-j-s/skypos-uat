function ActivitiesResolve(CatalogService, $q, $route) {
    var def = $q.defer();
    CatalogService.getActivities($route.current.params.parkUrlSegment).then(function(activities) {
    	console.log(activities)
        def.resolve(activities);
	}, function(err) {
        def.reject(err)
    });

    return def.promise;
}