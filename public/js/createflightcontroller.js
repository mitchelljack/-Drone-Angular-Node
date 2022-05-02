angular.module("demo").controller("createFlightController", function ($routeParams,$scope, $http,$rootScope) {
    $scope.eid = $routeParams.id;
    $scope.isMapLoaded = false;
    $scope.flightRadiusVisibility = false;
    $scope.required = true;
    $scope.formInfo = {};
    $scope.titles = {
                    'view1':'SELECT A JOB',
                    'view2':'ASSIGN PILOTS',
                    'view3':'ASSIGN UAVS',
                    'view4':'ASSIGN PURPLEBOXES',
                    'view5':'SELECT PAYLOADS',
                    'view6':'SELECT FLIGHT RADIUS',
                    'view7':'SET FLIGHT PARAMETER VALUES'
                };
    $('select').material_select();
    $scope.getNumber = function(num) {
        return new Array(20);
    }
    $scope.view = "view1";
    var screenWidth = $(window).width();

    if (screenWidth > 968) {
        $scope.width = $(".getsize").width() / 3 - 50;
    }
    else if (screenWidth > 600) {
        $scope.width = $(".getsize").width() / 2 - 50;
    }

    $http.get('users/profile')
    .success(function(data) {
        $scope.profile = data;
        console.log($scope.profile);
    })
    .error(function(error){
      alert('Error fetching data');
      $scope.loading = false;
    });

    $scope.openView2 = function (data) {
        $scope.formInfo.job = data;
        $http.get('job/fetch/one/'+data)
        .success(function(data){
            if(data.rows[0]){
                $scope.unAssignedPilots = data.rows[0].value.assignedPilots;
                $scope.unAssignedUavs = data.rows[0].value.assignedUavs;
                $scope.unAssignedPBs = data.rows[0].value.assignedPBs;
                $scope.unAssignedPayloads=data.rows[0].value.assignedPayloads;
                $scope.location = data.rows[0].value.location;
            }
            else{
                console.log("error in fatching");
            }
        })
        .error(function(error){
            console.log(error);
        });
        $scope.view = "view2";
    };
    if($scope.eid!='false'){
        $scope.formInfo.name = $scope.eid;
        var job = $scope.eid;
        job = job.substring(0, job.indexOf('-F'));
        $http.get('flight/fetch/one/'+$scope.eid)
        .success(function(data){
            if(data!='error'){
                $scope.formInfo = data.rows[0].value;

            }
            else{
                alert('There was some error feching flight data');
            }
        })
        .error(function(error) {
            alert('There was some error feching flight data');
        })
        $scope.openView2(job);
    }
    $scope.uAllPilotClicked = function() {

    }
    $scope.aAllPilotClicked = function() {

    }
    $scope.uPilotClicked = function (data) {
        if($scope.assignedPilots) return;
        var plt = $scope.unAssignedPilots[data];
        $scope.unAssignedPilots.splice(data, 1);
        $scope.assignedPilots = plt;
    };
    $scope.aPilotClicked = function (data) {
        var plt = $scope.assignedPilots;
        // $scope.assignedPilots.splice(data, 1);
        $scope.unAssignedPilots.push(plt);
        $scope.assignedPilots = null;
    };
    $scope.uUavClicked = function (data) {
        var plt = $scope.unAssignedUavs[data];
        $scope.unAssignedUavs.splice(data, 1);
        $scope.assignedUavs.push(plt)
    };
    $scope.aUavClicked = function (data) {
        var plt = $scope.assignedUavs[data];
        $scope.assignedUavs.splice(data, 1);
        $scope.unAssignedUavs.push(plt)
    };
    $scope.uPBClicked = function (data) {
        if($scope.assignedPBs) return;
        var plt = $scope.unAssignedPBs[data];
        $scope.unAssignedPBs.splice(data, 1);
        $scope.assignedPBs = plt
    };
    $scope.aPBClicked = function (data) {
        var plt = $scope.assignedPBs;
        // $scope.assignedPBs.splice(data, 1);
        $scope.unAssignedPBs.push(plt);
        $scope.assignedPBs = null;
    };
    $scope.uPayloadClicked = function (data) {
        var plt = $scope.unAssignedPayloads[data];
        $scope.unAssignedPayloads.splice(data, 1);
        $scope.assignedPayloads.push(plt)
    };
    $scope.aPayloadClicked = function (data) {
        var plt = $scope.assignedPayloads[data];
        $scope.assignedPayloads.splice(data, 1);
        $scope.unAssignedPayloads.push(plt)
    };

    $scope.next = function (view) {
        $scope.view = view;
    };
    $scope.view5 = function (view) {
        $scope.view = view;
        $scope.loadMap();
    };
    var map;
    $scope.loadMap = function (view) {
        $scope.view = view;
        if ($scope.isMapLoaded == false) {
            setTimeout(initMap, 500);
            $scope.isMapLoaded = true;
        }
    }

    $scope.changeRadius = function () {
        circle.setRadius = $scope.mapRadius;
    };

    $scope.assignAll = function(data,other){
        for(var i =0;i< $scope[data].length;i++){
            var plt = $scope[data][0];
            $scope[data].splice(0, 1);
            $scope[data].push(plt)
        }
    };

    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#createJobMap").html("");
    });
    function initMap() {
        var mapDiv = document.getElementById('createJobMap');
        var map = new google.maps.Map(mapDiv, {
            center: {
                lat: 44.540
                , lng: -78.546
            }
            , zoom: 14
        });
        google.maps.event.addListener(map, 'click', function (e) {
            placeMarker(e.latLng, map);
        });
        var marker = new google.maps.Marker({
            map: map
            , icon: {
                size: new google.maps.Size(60, 72)
                , scaledSize: new google.maps.Size(60, 72)
                , url: "images/pin.png"
            }
        });
        var circle = new google.maps.Circle({
            path: google.maps.SymbolPath.CIRCLE
            , map: map
            , radius: $scope.formInfo.mapRadius
            , fillColor: '#616161'
            , strokeOpacity: 0
            , fillOpacity: 0.35
            , scale: 0.5
        });
        $("#range").on('change', function () {
            circle.setRadius($scope.formInfo.mapRadius * 10);
        });
        circle.bindTo('center', marker, 'position');

        function placeMarker(position, map) {
            marker.setPosition(position);
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(position);
            map.fitBounds(bounds);
            map.setZoom(15);
            // $scope.formInfo.location = [position.lat(), position.lng()];
        }
        if($scope.location)
            placeMarker({"lat":$scope.location[0],"lng":$scope.location[1]},map);
    }
    $http.get('job/fetch/all').success(function (data) {
        if (data.rows) $scope.jobs = data.rows;
    }).error(function (error) {
        console.log(error);
    });

    $scope.assignedPilots = null;
    $scope.assignedUavs = [];
    $scope.assignedPBs = null;
    $scope.assignedPayloads = [];
    $scope.loading = false;
    $scope.submit = function () {
        if($scope.eid=='false'){
            $scope.formInfo.operator = {};
            $scope.formInfo.operator.name = $scope.profile.name;
            $scope.formInfo.operator.email = $scope.profile.email;
            $scope.formInfo.operator.image = $scope.profile.image;
            $scope.formInfo.assignedPilots = $scope.assignedPilots;
            $scope.formInfo.location = $scope.location;

            $scope.formInfo.assignedPBs = $scope.assignedPBs;

            $scope.formInfo.assignedUavs = $scope.assignedUavs;

            $scope.formInfo.assignedPayloads = $scope.assignedPayloads;
            $scope.loading = true;
            $http.post('/flight/create', $scope.formInfo).
            success(function (data, status) {
                if(data.success)
                    location.href = "#/done/flight/" + data.success;
                $scope.loading = false;
            }).error(function (data, status) {
                console.log(data, status);
                $scope.loading = false;
            });
        }
        else{
            $scope.formInfo.operator = {};
            $scope.formInfo.operator.name = $scope.profile.name;
            $scope.formInfo.operator.email = $scope.profile.email;
            $scope.formInfo.operator.image = $scope.profile.image;
            $scope.formInfo.assignedPilots = $scope.assignedPilots;
            $scope.formInfo.location = $scope.location;

            $scope.formInfo.assignedPBs = $scope.assignedPBs;

            $scope.formInfo.assignedUavs = $scope.assignedUavs;

            $scope.formInfo.assignedPayloads = $scope.assignedPayloads;

            $scope.loading = true;
            $http.post('/flight/edit', $scope.formInfo).
            success(function (data, status) {
                if(data.success)
                    location.href = "#/done/flight/" + data.success;
                $scope.loading = false;
            }).error(function (data, status) {
                console.log(data, status);
                $scope.loading = false;
            });
        }
    }
    function setVisible() {
        $scope.flightRadiusVisibility = true;
    }
    // $scope.formInfo.airPressure = [[0,0],[0,0],[0,0]];
    // $scope.formInfo.altitude = [[0,0],[0,0],[0,0]];
    // $scope.formInfo.humidity = [[0,0],[0,0],[0,0]];
    // $scope.formInfo.temparature = [[0,0],[0,0],[0,0]];
    // $scope.formInfo.sound = [[0,0],[0,0],[0,0]];
    // function addRangeInputs() {
    //     var airPressure = document.getElementById('airPressure');
    //     noUiSlider.create(airPressure, {
    //         start: [20, 180]
    //         , connect: true
    //         , step: 1
    //         , range: {
    //             'min': 0
    //             , 'max': 200
    //         },
    //         format: wNumb({
    //             decimals: 0,
    //         })

    //     });
    //     airPressure.noUiSlider.on('update', function (values, handle) {
    //         $scope.formInfo.airPressure = values;
    //         document.getElementById('airPressure1').innerHTML = values[0]+' psi';
    //         document.getElementById('airPressure2').innerHTML = values[1] + ' psi';
    //         if($scope.formInfo.airPressure[0]<33 || $scope.formInfo.airPressure[1]>177){
    //             $("#airPressureDiv").attr('class', 'redSlider');
    //         }
    //         else if($scope.formInfo.airPressure[0]<66 || $scope.formInfo.airPressure[1]>144){
    //             $("#airPressureDiv").attr('class', 'yellowSlider');
    //         }
    //         else {
    //             $("#airPressureDiv").attr('class', 'greenSlider');
    //         }
    //     });
    //     var altitude = document.getElementById('altitude');
    //     noUiSlider.create(altitude, {
    //         start: [20, 180]
    //         , connect: true
    //         , step: 1
    //         , range: {
    //             'min': 0
    //             , 'max': 200
    //         }
    //         , format: wNumb({
    //             decimals: 0,
    //         })
    //     });
    //     altitude.noUiSlider.on('update', function (values, handle) {
    //         $scope.formInfo.altitude = values;
    //         document.getElementById('altitude1').innerHTML = values[0] + ' m';
    //         document.getElementById('altitude2').innerHTML = values[1] + ' m';
    //         if($scope.formInfo.altitude[0]<33 || $scope.formInfo.altitude[1]>177){
    //             $("#altitudeDiv").attr('class', 'redSlider');
    //         }
    //         else if($scope.formInfo.altitude[0]<66 || $scope.formInfo.altitude[1]>144){
    //             $("#altitudeDiv").attr('class', 'yellowSlider');
    //         }
    //         else {
    //             $("#altitudeDiv").attr('class', 'greenSlider');
    //         }
    //     });
    //     var humidity = document.getElementById('humidity');
    //     noUiSlider.create(humidity, {
    //         start: [20, 180]
    //         , connect: true
    //         , step: 1
    //         , range: {
    //             'min': 0
    //             , 'max': 200
    //         }
    //         , format: wNumb({
    //             decimals: 0,
    //         })
    //     });
    //     humidity.noUiSlider.on('update', function (values, handle) {
    //         $scope.formInfo.humidity = values;
    //         document.getElementById('humidity1').innerHTML = values[0] +'%';
    //         document.getElementById('humidity2').innerHTML = values[1] +'%';
    //         if($scope.formInfo.humidity[0]<33 || $scope.formInfo.humidity[1]>177){
    //             $("#humidityDiv").attr('class', 'redSlider');
    //         }
    //         else if($scope.formInfo.humidity[0]<66 || $scope.formInfo.humidity[1]>144){
    //             $("#humidityDiv").attr('class', 'yellowSlider');
    //         }
    //         else {
    //             $("#humidityDiv").attr('class', 'greenSlider');
    //         }
    //     });
    //     var temparature = document.getElementById('temparature');
    //     noUiSlider.create(temparature, {
    //         start: [20, 180]
    //         , connect: true
    //         , step: 1
    //         , range: {
    //             'min': 0
    //             , 'max': 200
    //         }
    //         , format: wNumb({
    //             decimals: 0,
    //         })
    //     });
    //     temparature.noUiSlider.on('update', function (values, handle) {
    //         $scope.formInfo.temparature = values;
    //         document.getElementById('temparature1').innerHTML = values[0] + '&deg C';
    //         document.getElementById('temparature2').innerHTML = values[1] + '&deg C';
    //         if($scope.formInfo.temparature[0]<33 || $scope.formInfo.temparature[1]>177){
    //             $("#temparatureDiv").attr('class', 'redSlider');
    //         }
    //         else if($scope.formInfo.temparature[0]<66 || $scope.formInfo.temparature[1]>144){
    //             $("#temparatureDiv").attr('class', 'yellowSlider');
    //         }
    //         else {
    //             $("#temparatureDiv").attr('class', 'greenSlider');
    //         }
    //     });
    //     var sound = document.getElementById('sound');
    //     noUiSlider.create(sound, {
    //         start: [20, 180]
    //         , connect: true
    //         , step: 1
    //         , range: {
    //             'min': 0
    //             , 'max': 200
    //         }
    //         , format: wNumb({
    //             decimals: 0,
    //         })
    //     });
    //     sound.noUiSlider.on('update', function (values, handle) {
    //         $scope.formInfo.sound = values;
    //         document.getElementById('sound1').innerHTML = values[0] + ' db';
    //         document.getElementById('sound2').innerHTML = values[1] + ' db';
    //         if($scope.formInfo.sound[0]<33 || $scope.formInfo.sound[1]>177){
    //             $("#soundDiv").attr('class', 'redSlider');
    //         }
    //         else if($scope.formInfo.sound[0]<66 || $scope.formInfo.sound[1]>144){
    //             $("#soundDiv").attr('class', 'yellowSlider');
    //         }
    //         else {
    //             $("#soundDiv").attr('class', 'greenSlider');
    //         }
    //     });
    // }
    // addRangeInputs();
    // $scope.sliderClass = function(option){
    //     if($scope.formInfo[option]){
    //         if($scope.formInfo[option][0]<33 || $scope.formInfo[option][1]>177){
    //             return 'redSlider';
    //         }
    //         else if($scope.formInfo[option][0]<66 || $scope.formInfo[option][1]>144){
    //             return 'yellowSlider';
    //         }
    //         else {
    //             return 'greenSlider';
    //         }
    //     }
    // }
});
