angular.module("demo").controller("subjobMapController", function ($scope, $routeParams, $http, $rootScope) {
    $scope.id = $routeParams.id;
    $scope.loading = false;
    $scope.previousData = 0;
    var start_marker, end_marker;
    $scope.openNav = function () {
        if(document.getElementById("mySidenav").style.width == "55%")
            document.getElementById("mySidenav").style.width = "0";
        else {
            document.getElementById("mySidenav").style.width = "55%";
            document.getElementById("flightData").style.width = "0";
        }
    }

    $scope.flightData = function() {
        if(document.getElementById("flightData").style.width == "250px")
            document.getElementById("flightData").style.width = "0";
        else {
            document.getElementById("mySidenav").style.width = "0";
            document.getElementById("flightData").style.width = "250px";
        }
    }
        /* Set the width of the side navigation to 0 */
    $(".button-collapse").sideNav();
    if($("#sideNavFlights").hasClass("sideNavSelected"))
        $("#sideNavFlights").toggleClass("sideNavSelected");
    if($("#sideNavReplay").hasClass("sideNavSelected"))
        $("#sideNavReplay").toggleClass("sideNavSelected");
    // $("#sideNavFlights").toggleClass("sideNavSelected");
    // $scope.$on('$destroy', function iVeBeenDismissed() {
    //     $("#sideNavFlights").toggleClass("sideNavSelected");
    // });

    $scope.drawData = function(firstTime) {
        var start_time = $scope.flight.flight_starttime?$scope.flight.flight_starttime:(new Date().getTime()/1000);
        $http.get("flight/fetch/gps/"+$scope.flight.assignedPBs.name+"/"+$scope.flight._id+"/"+start_time)
        .success(function(data){
            $scope.loading = false;
            if(data.data != undefined && data.data.length>0){
                $scope.allSensors = data;
                $scope.altitude = data.altitude;
                var flightPlanCoordinates = [];
                for(var i = 0; i < data.altitude.length; i++) {
                    flightPlanCoordinates.push({lat: parseFloat(data.positions[i*2+1]), lng: parseFloat(data.positions[i*2])})
                    data.altitude[i] = data.altitude[i]=="" || data.altitude[i]==null ? 0 : parseFloat(parseFloat(data.altitude[i]).toFixed(4));
                    data.azimut[i] = data.azimut[i]=="" || data.azimut[i]==null ? 0 : parseFloat(parseFloat(data.azimut[i]).toFixed(4));
                    data.humidity[i] = data.humidity[i]=="" || data.humidity[i]==null ? 0 : parseFloat(parseFloat(data.humidity[i]).toFixed(4));
                    data.light[i] = data.light[i]=="" || data.light[i]==null ? 0 : parseFloat(parseFloat(data.light[i]).toFixed(4));
                    data.pitch[i] = data.pitch[i]=="" || data.pitch[i]==null ? 0 : parseFloat(parseFloat(data.pitch[i]).toFixed(4));
                    data.pressure[i] = data.pressure[i]=="" || data.pressure[i]==null ? 0 : parseFloat(parseFloat(data.pressure[i]).toFixed(4));
                    data.roll[i] = data.roll[i]=="" || data.roll[i]==null ? 0 : parseFloat(parseFloat(data.roll[i]).toFixed(4));
                    //data.sound[i] = data.sound[i]=="" || data.sound[i]==null ? 0 : parseFloat(parseFloat(data.sound[i]).toFixed(4));
                    data.battery[i] = data.battery[i]=="" || data.battery[i]==null ? 0 : parseFloat(parseFloat(data.battery[i]).toFixed(4));
                    data.temperature[i] = data.temperature[i]=="" || data.temperature[i]==null ? 0 : parseFloat(parseFloat(data.temperature[i]).toFixed(4));
                    data.yaw[i] = data.yaw[i]=="" || data.yaw[i]==null ? 0 : parseFloat(parseFloat(data.yaw[i]).toFixed(4));
                }
                if($scope.flight.currentStatus == "inactive") {
                    if(end_marker != null)
                        end_marker.setMap(null);
                    start_marker = new google.maps.Marker({
                        position: new google.maps.LatLng(flightPlanCoordinates[0].lat, flightPlanCoordinates[0].lng),
                        map: map,
                        title: "Start Point",
                        icon: {
                            size: new google.maps.Size(50, 58),
                            scaledSize: new google.maps.Size(50, 58),
                            url: "images/greenpin.png"
                        }
                    });

                    end_marker = new google.maps.Marker({
                        position: new google.maps.LatLng(flightPlanCoordinates[flightPlanCoordinates.length-1].lat, flightPlanCoordinates[flightPlanCoordinates.length-1].lng),
                        map: map,
                        title: "End Point",
                        icon: {
                            size: new google.maps.Size(50, 58),
                            scaledSize: new google.maps.Size(50, 58),
                            url: "images/redpin.png"
                        }
                    });

                    var lineSymbol = {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      strokeColor: '#393'
                    };

                    var flightPath = new google.maps.Polyline({
                      path: flightPlanCoordinates,
                      geodesic: true,
                      strokeColor: '#d9df30',
                      strokeOpacity: 1.0,
                      strokeWeight: 2,
                      icons: [{
                        icon: lineSymbol,
                        offset: '100%'
                      }],
                      map: map
                    });

                    animateCircle(flightPath);

                    function animateCircle(line) {
                        var count = 0;
                        window.setInterval(function() {
                          count = (count + 1) % flightPlanCoordinates.length;

                          var icons = line.get('icons');
                          icons[0].offset = (count / flightPlanCoordinates.length * 100) + '%';
                          line.set('icons', icons);
                          if(count % 5 == 0)
                              $scope.pageUpdateInfo(count, data);
                      }, 500);
                    }

                    var lat = flightPlanCoordinates[0].lat;
                    var lng = flightPlanCoordinates[0].lng;

                    var center = new google.maps.LatLng(lat, lng);
                    // using global variable:
                    map.setCenter(center);

                    $scope.mapData= data;
                } else if($scope.flight.currentStatus=="active") {
                    if(firstTime) {
                        start_marker = new google.maps.Marker({
                            position: new google.maps.LatLng(flightPlanCoordinates[0].lat, flightPlanCoordinates[0].lng),
                            map: map,
                            title: "Start Point",
                            icon: {
                                size: new google.maps.Size(50, 58),
                                scaledSize: new google.maps.Size(50, 58),
                                url: "images/greenpin.png"
                            }
                        });

                        end_marker = new google.maps.Marker({
                            position: new google.maps.LatLng(flightPlanCoordinates[flightPlanCoordinates.length-1].lat, flightPlanCoordinates[flightPlanCoordinates.length-1].lng),
                            map: map,
                            title: "End Point",
                            icon: {
                                size: new google.maps.Size(50, 58),
                                scaledSize: new google.maps.Size(50, 58),
                                url: "images/redpin.png"
                            }
                        });
                        var flightPath = new google.maps.Polyline({
                          path: flightPlanCoordinates,
                          geodesic: true,
                          strokeColor: '#d9df30',
                          strokeOpacity: 1.0,
                          strokeWeight: 2,
                          icons: [{
                            icon: lineSymbol,
                            offset: '100%'
                          }],
                          map: map
                        });

                        var lat = flightPlanCoordinates[0].lat;
                        var lng = flightPlanCoordinates[0].lng;

                        var center = new google.maps.LatLng(lat, lng);
                        // using global variable:
                        map.setCenter(center);

                        $scope.trackingTimer = setInterval(function() {
                            $scope.drawData(false);
                        }, 10000);

                        $scope.pageUpdateInfo(flightPlanCoordinates.length - 1, data);

                    } else {
                        end_marker.setMap(null);
                        if($scope.previousData == flightPlanCoordinates.length) {
                            $http.get("flight/fetch/one/"+$scope.id)
                            .success(function(data1){
                                if(data1.rows) {
                                    $scope.flight = data1.rows[0].value;
                                    if($scope.flight.currentStatus == "inactive") {
                                        clearInterval($scope.trackingTimer);
                                        end_marker = new google.maps.Marker({
                                            position: new google.maps.LatLng(flightPlanCoordinates[flightPlanCoordinates.length-1].lat, flightPlanCoordinates[flightPlanCoordinates.length-1].lng),
                                            map: map,
                                            title: "End Point",
                                            icon: {
                                                size: new google.maps.Size(50, 58),
                                                scaledSize: new google.maps.Size(50, 58),
                                                url: "images/redpin.png"
                                            }
                                        });
                                        return;
                                    }
                                }
                            })
                            .error(function(error){
                                console.log(error);
                            });
                        }
                        end_marker = new google.maps.Marker({
                            position: new google.maps.LatLng(flightPlanCoordinates[flightPlanCoordinates.length-1].lat, flightPlanCoordinates[flightPlanCoordinates.length-1].lng),
                            map: map,
                            title: "End Point",
                            icon: {
                                size: new google.maps.Size(50, 58),
                                scaledSize: new google.maps.Size(50, 58),
                                url: "images/redpin.png"
                            }
                        });
                        var flightPath = new google.maps.Polyline({
                          path: flightPlanCoordinates,
                          geodesic: true,
                          strokeColor: '#d9df30',
                          strokeOpacity: 1.0,
                          strokeWeight: 2,
                          icons: [{
                            icon: lineSymbol,
                            offset: '100%'
                          }],
                          map: map
                        });

                        var lat = flightPlanCoordinates[flightPlanCoordinates.length-1].lat;
                        var lng = flightPlanCoordinates[flightPlanCoordinates.length-1].lng;

                        var center = new google.maps.LatLng(lat, lng);
                        // using global variable:
                        map.setCenter(center);

                        $scope.pageUpdateInfo(flightPlanCoordinates.length - 1, data);
                    }

                    $scope.previousData = flightPlanCoordinates.length;
                }
            }
        })
        .error(function(error){
            console.log(error);
        });
    }

    $scope.pageUpdateInfo = function(i, data){
        // var i = parseInt(Cesium.JulianDate.secondsDifference(viewer.clock.currentTime,start));

        // $("#gps-lat").html(data.positions[i*2]);
        // $("#gps-lng").html(data.positions[i*2+1]);
        // $("#AIR_PRESSURE").html(data.pressure[i]);
        $("#HUMIDITY").html(data.humidity[i]);
        $("#ALTITUDE").html(data.altitude[i]);
        $("#TEMPRATURE").html(data.temperature[i]);
        $("#PITCH").html(data.pitch[i]);
        $("#ROLL").html(data.roll[i]);
        $("#YAW").html(data.yaw[i]);
        // $("#SOUND h2").html(data.sound[i]);
        $("#BATTERY").html(data.battery[i]);

    }

    function initialize() {


        // Multiple Markers
        var position = $rootScope.position?$rootScope.position:[55.6468, 37.581];

        var bounds = new google.maps.LatLngBounds();
        var mapOptions = {
            zoom: 16
            , center: new google.maps.LatLng(position[0], position[1]),
            zoomControl: true,

            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            scaleControl: true,
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            fullscreenControl: true
        };
        // Display a map on the page
        map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

        $scope.loading = true;

        $http.get('flight/fetch/one/' + $scope.id).success(function (data) {
            $scope.flight = data.rows[0].value;
            $scope.drawData(true);
        }).error(function (error) {
            console.log(error);
        });
        // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
        var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
            this.setZoom(16);
            google.maps.event.removeListener(boundsListener);
        });
        google.maps.event.addListener(map, 'domready', function () {
            var iwOuter = $('.gm-style-iw');
            var iwBackground = iwOuter.prev();
            iwBackground.children(':nth-child(2)').css({
                'display': 'none'
            });
            iwBackground.children(':nth-child(4)').css({
                'display': 'none'
            });
        });
    }
    initialize();
});
