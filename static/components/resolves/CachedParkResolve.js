function CachedParkResolve(ParkService, $q, $route) {
    return $q.when(ParkService.getCurrentPark());
}
