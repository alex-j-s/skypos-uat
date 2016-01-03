'use strict';

/**
 * @ngdoc function
 * @name skyZoneApp.components.services.print-service:print-service
 * @description
 * # PrintService
 * Service of the skyZoneApp
 */


angular.module('skyZoneApp')
  .service('PrintService', ['$rootScope', '$http', '$compile', '$timeout', function($rootScope, $http, $compile, $timeout) {
    var self = this;

    self.printFromTemplate = function(templateUrl, data) {
      $http.get(templateUrl)
        .success(function(template) {
          var printScope = angular.extend($rootScope.$new(), data);
          var element = $compile(template)(printScope);

          var waitForRenderAndPrint = function() {
            if(printScope.$$phase || $http.pendingRequests.length) {
                $timeout(waitForRenderAndPrint);
            } else {
              self.printHtml(element.html());
              printScope.$destroy(); // To avoid memory leaks from scope create by $rootScope.$new()
            }
          };
          waitForRenderAndPrint();
        });
    };

    self.printHtml = function(html) {
      var body = angular.element(document.getElementsByTagName('body'));
      var iframeHtml = document.getElementById('print-iframe');
      var hiddenIframe;
      if(iframeHtml) {
        hiddenIframe = angular.element(iframeHtml);
      }else{
        hiddenIframe = angular.element('<iframe id="print-iframe" style="display:none;"></iframe>');
        body.append(hiddenIframe);
      }

      var head = angular.element(document.getElementsByTagName('head')).html();
      var htmlDocument = '<!doctype html>'+
                  '<html>'+
                      '<head>'+
                        head +
                      '</head>'+
                      '<body onload="window.print();">' + // Print only after document is loaded
                        html +
                      '</body>'+
                  '</html>';
      hiddenIframe.html(htmlDocument);
      var doc = hiddenIframe.contents()[0].open('text/html', 'replace');
      doc.write(htmlDocument);
      doc.close();
    };

  }]);