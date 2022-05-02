angular.module("demo", ["ngRoute",'ui.materialize','ngFileUpload', 'ngImgCrop',"highcharts-ng"]).config(['$routeProvider'
	, function ($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'view/jobs.html'
            , controller: 'jobController'
        }).
        when('/home', {
            templateUrl: '../view/home.html'
            , controller: 'homeController'
        }).
				when('/insured-home', {
            templateUrl: '../view/insured-home.html'
            , controller: 'insuredHomeController'
        }).
        when('/past', {
            templateUrl: 'view/past.html'
            , controller: 'pastController'
        }).
        when('/past/:id', {
            templateUrl: 'view/subpast.html'
            , controller: 'subpastController'
        }).
        when('/past/:id/:subid', {
            templateUrl: 'view/subsubpast.html'
            , controller: 'subsubpastController'
        }).
        when('/profile', {
            templateUrl: 'view/profile.html'
            , controller: 'profileController'
        }).
        when('/job-map', {
            templateUrl: 'view/jobmap.html'
            ,controller: 'jobmapController'
        }).
        when('/past-map', {
            templateUrl: 'view/pastmap.html'
            ,controller: 'pastmapController'
        }).
        when('/job/:id',{
            templateUrl: 'view/subjob.html'
            ,controller: 'subjobController'
        }).
        when('/job/:id/:subid',{
            templateUrl: 'view/subsubjob.html'
            ,controller: 'subsubjobController'
        }).
        when('/job-map/:id',{
            templateUrl: 'view/subjobmap.html'
            ,controller: 'subjobMapController'
        }).
        when('/past-map/:id',{
            templateUrl: 'view/subpastmap.html'
            ,controller: 'subpastMapController'
        }).
        when('/inventory',{
            templateUrl: 'view/inventory.html'
            ,controller: 'inventoryJobsController'

        }).
        when('/inventory-flights',{
            templateUrl: 'view/inventoryflights.html'
            ,controller: 'inventoryFlightsController'

        }).
        when('/inventory-people',{
            templateUrl: 'view/inventorypeople.html'
            ,controller: 'inventoryPeopleController'

        }).
        when('/inventory-uavs',{
            templateUrl: 'view/inventoryuavs.html'
            ,controller: 'inventoryUavsController'

        }).
        when('/inventory-payload',{
            templateUrl: 'view/inventorypayload.html'
            ,controller: 'inventoryPayloadController'

        }).
        when('/inventory-purple-boxes',{
            templateUrl: 'view/inventorypurpleboxes.html'
            ,controller: 'inventoryPurpleBoxesController'

        }).
        when('/create-job/:id',{
            templateUrl: 'view/createjob.html'
            ,controller: 'createJobController'

        }).
        when('/create-flight/:id',{
            templateUrl: 'view/createflight.html'
            ,controller: 'createFlightController'
        }).
        when('/create-uav/:id',{
            templateUrl: 'view/createuav.html'
            ,controller: 'createUavController'
        }).
        when('/create-purplebox/:id',{
            templateUrl: 'view/createpurplebox.html'
            ,controller: 'createPurpleboxController'
        }).
        when('/create-operator/:id',{
            templateUrl: 'view/createoperator.html'
            ,controller: 'createOperatorController'
        }).
        when('/create-pilot/:id',{
            templateUrl: 'view/createpilot.html'
            ,controller: 'createPilotController'
        }).
        when('/create-customer/:back',{
            templateUrl: 'view/createcustomer.html'
            ,controller: 'createCustomerController'
        }).
        when('/done/:category/:id',{
            templateUrl: 'view/done.html'
            ,controller: 'doneController'
        }).
        when('/create-payload/:id',{
            templateUrl: 'view/createpayload.html'
            ,controller: 'createPayloadController'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]).
controller("replayController", function ($scope) {
    $(".button-collapse").sideNav();
    $("#sideNavReplay").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavReplay").toggleClass("sideNavSelected");
    });
    $scope.$on('$destroy',function(){
        console.log("Destroyed");
    });
}).
directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
}).
run(function ($rootScope,$http) {
    $http.post('isAdmin')
    .success(function(data){
        $rootScope.isAdmin = data;
    })
    .error(function(error){
        console.log(error);
    });

		if (!navigator.geolocation){
	    	$rootScope.position = [55.6468, 37.581];
	  } else {
			function success(position) {
				$rootScope.position = [position.coords.latitude, position.coords.longitude];
			}

			function error() {
				$rootScope.position = [55.6468, 37.581];
			}
			navigator.geolocation.getCurrentPosition(success, error);
		}

}).
directive('phoneInput', function($filter, $browser) {
    return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
            var listener = function() {
                var value = $element.val().replace(/[^0-9]/g, '');
                $element.val($filter('tel')(value, false));
            };

            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function(viewValue) {
                return viewValue.replace(/[^0-9]/g, '').slice(0,10);
            });

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function() {
                $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
            };

            $element.bind('change', listener);
            $element.bind('keydown', function(event) {
                var key = event.keyCode;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)){
                    return;
                }
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            });

            $element.bind('paste cut', function() {
                $browser.defer(listener);
            });
        }

    };
})
.filter('tel', function () {
    return function (tel) {

        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 1:
            case 2:
            case 3:
                city = value;
                break;

            default:
                city = value.slice(0, 3);
                number = value.slice(3);
        }

        if(number){
            if(number.length>3){
                number = number.slice(0, 3) + '-' + number.slice(3,7);
            }
            else{
                number = number;
            }

            return ("(" + city + ") " + number).trim();
        }
        else{
            return "(" + city;
        }

    };
});
;
