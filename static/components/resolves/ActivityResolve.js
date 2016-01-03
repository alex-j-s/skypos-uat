function ActivityResolve(ActivityService, $q, $route) {
    var def = $q.defer();

   def.resolve( ActivityService.getActivity());

  /*  ActivityService.getActivityList($route.current.params.parkUrlSegment).then(function(activityResponse) {
        console.log(activityResponse)
        ParkService.setPark(activityResponse.data[0]);
        def.resolve(activityResponse.data[0]);
    }, function(err) {
        def.reject(err)
    });*/

    return def.promise;
}
