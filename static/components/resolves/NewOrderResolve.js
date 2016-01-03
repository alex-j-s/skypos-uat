function NewOrderResolve(OrderService, $route, $q, $rootScope) {
    var def = $q.defer();

    OrderService.createOrder({parkId:$rootScope.park.id}).then(function(result) {
        console.log(result);
        if(result.id){
        	def.resolve(result);
        }
        else{
	        def.resolve(result.data);
        	
        }
    }, function(err) {
    	console.log('order error: ', err);
        def.reject(err);
    });

    return def.promise;
}
