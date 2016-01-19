angular.module('skyZoneApp')
    .directive('modal', function () {
        return {
            templateUrl:'static/components/common/directives/modal-dialog/modal-dialog.html',
            restrict: 'E',
            transclude: true,
            replace:true,
            scope:true,
            link: function showModal(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function(value){
                    if(value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function(){
                    scope.$apply(function(){
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function(){
                    scope.$apply(function(){
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    });