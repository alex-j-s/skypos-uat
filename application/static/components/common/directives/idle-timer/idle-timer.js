'use strict';

angular.module('skyZoneApp')
    .directive('idleTimer', ['$timeout', '$location', '$route', function($timeout, $location, $route) {
        var timeKeeper = [];

        function startTimer(delayS) {
            // console.log('timer starting!!')
            timeKeeper.push($timeout(function() {
            	if($location.path() !== '/idle/'+$route.current.params.parkUrlSegment){
            		// console.log('Routing to idle!', $route);
	                $location.path('/idle/'+$route.current.params.parkUrlSegment)
            	}
            }, delayS * 1000));
        }

        function interrupt() {
            $timeout.cancel(timeKeeper.pop());
        }
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {
                'timeoutSeconds': '=idleTimer'
            }, // {} = isolate, true = child, false/undefined = no change
            link: function(scope, element, attrs, controller) {
                element.on('mousedown', function() {
                    // console.log('mouse down!')
                    interrupt();
                    startTimer(scope.timeoutSeconds);
                })
                element.on('keydown', function() {
                    // console.log('key down!')
                    interrupt();
                    startTimer(scope.timeoutSeconds);
                })
                scope.$on('$destroy', function(event) {
                	angular.forEach(timeKeeper, function(timer){
	                    $timeout.cancel(timer);
                	})
                	timeKeeper.length = 0;
                });

                startTimer(scope.timeoutSeconds);
            }
        };
    }]);
