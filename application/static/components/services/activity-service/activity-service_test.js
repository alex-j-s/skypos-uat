'use strict';

describe('Service: CatalogService', function () {

    // load the controller's module
    beforeEach(module('skyZoneApp'));

    var mockBackend, q, scope, service, mockParkService;

    var parkId = '2';

    var activities = [
        {   "id":5,
            "sfId":"a0C17000002ud26EAA",
            "name":"Default Open Jump Activity - Jump Zones",
            "startTime":"2015-10-15",
            "endTime":null,
            "activityType":"Open Jump",
            "parkSfId":"0011700000F7Y6QAAV",
            "parkId":2,
            "zoneId":null,
            "zoneSfId":null,
            "recordType":{"id":"28","name":"Default SZ Zone Activity"}
        },
        {   "id":4,
            "sfId":"a0C17000002ud21EAA",
            "name":"Default Open Activity - Event Zones",
            "startTime":"2015-10-15",
            "endTime":null,
            "activityType":"Open",
            "parkSfId":"0011700000F7Y6QAAV",
            "parkId":2,
            "zoneId":null,
            "zoneSfId":null,
            "recordType":{ "id":"28","name":"Default SZ Zone Activity"}
        }
    ];

    var mockGetActivityList = function() {
        mockBackend.whenGET('/api/parks/'+parkId+'/activities').respond(activities);

        var promise = service.getActivityList(),
            activityList;
        promise.success(function(response){
            activityList = response;
        });

        mockBackend.flush();

        return activityList;
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function (ActivityService, $rootScope, $httpBackend, ParkService, $q) {
        q = $q;
        mockParkService = ParkService;

        scope = $rootScope.$new();

        service = ActivityService;
        mockBackend = $httpBackend;
    }));


});