function OrderResolve(OrderService, $route, $q) {
    var def = $q.defer();

    OrderService.getOrder($route.current.params.orderId).then(function(result) {
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
