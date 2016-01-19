angular.module('skyZoneApp')
    .directive('currencyInputField', ['$filter', '$browser', function($filter, $browser) {
        return {
            require: 'ngModel',
            link: function($scope, $element, $attrs, ngModelCtrl) {
                
                var listener = function() {
                    var value = Number($element.val().replace(/[^0-9\.]+/g,""))
                    console.log('value: ', value, $element.val());
                    $element.val($filter('number')(value))
                }

                // This runs when we update the text field
                ngModelCtrl.$parsers.push(function(viewValue) {
                    var value = viewValue.replace(/[^0-9\.]+/g,"")
                    console.log('***viewvalue: ', value, $element.val());
                    //return viewValue.replace(/,/g, '');
                    return value
                });

                // This runs when the model gets updated on the scope directly and keeps our view in sync
                ngModelCtrl.$render = function() {
                    console.log('*** elementL ', $element.val(), ngModelCtrl.$viewValue);
                    $element.val($filter('currency')(ngModelCtrl.$viewValue));
                }

                $element.bind('change', listener)
                $element.bind('keydown', function(event) {
                    var key = event.keyCode
                        // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                        // This lets us support copy and paste too
                    if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40))
                        return
                    $browser.defer(listener) // Have to do this or changes don't get picked up properly
                })

                $element.bind('paste cut', function() {
                    $browser.defer(listener)
                })
            }
        };
    }]);
