function ProductResolve(ProductService, $q, $route) {
    var def = $q.defer();

    ProductService.getProductByParkAndId($route.current.params.parkUrlSegment, $route.current.params.templateId).then(function(result) {
        console.log(result);
        ProductService.setCurrentProduct(result)
        def.resolve(result.variants[0]);
    }, function(err) {
        def.reject('Product not found.');
    })

    return def.promise;
}
