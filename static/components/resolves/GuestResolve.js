function GuestResolve(ProfileService, $q, $route) {
    var def = $q.defer();

    ProfileService.getCustomerInformation($route.current.params.guestId).then(function(guest) {
        console.log(guest);
        ProfileService.setCurrentCustomer(guest.data);
        def.resolve(guest.data);
    }, function(err) {
        def.reject(err);
    })

    return def.promise;
}
