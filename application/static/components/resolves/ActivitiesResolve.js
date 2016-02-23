function ActivitiesResolve(CatalogService, $q, $route) {
    var def = $q.defer();
    var out = [];
    var addedTypes = [];
    CatalogService.getActivities($route.current.params.parkUrlSegment).then(function(activities) {
    	console.log(activities)
    	angular.forEach(activities, function(activity){
    		if(addedTypes.indexOf(activity.activityType) === -1){
    			out.push(activity);
    			addedTypes.push(activity.activityType)
    		}
    	})
        def.resolve(out);
	}, function(err) {
        def.reject(err)
    });

    return def.promise;
}