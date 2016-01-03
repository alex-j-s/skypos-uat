function CachedGuestResolve(ProfileService, $q) {
    return $q.when(ProfileService.getCurrentCustomer());
}
