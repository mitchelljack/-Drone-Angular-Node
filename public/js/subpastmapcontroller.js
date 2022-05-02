angular.module("demo").controller("subpastMapController",function($scope,$routeParams,$http){
    $scope.id = $routeParams.id;
    $('.slider').slider({height: 250});
    $scope.openNav = function() {
        document.getElementById("mySidenav").style.width = "70%";
        document.getElementById("mainArea").style.marginRight = "70%";
        document.getElementById("mainArea").style.opacity = '0.2';
        document.getElementById("side-nav").style.opacity = '0.2';
        setTimeout(function () {
            Highcharts.chart("statusChart", {
                chart: {
                    type: 'solidgauge'
                    , backgroundColor: '#2b2b2c'
                    , spacingBottom: 5
                    , spacingTop: 5
                    , spacingLeft: 5
                    , spacingRight: 5
                    , height: 230
                    , margin: [0, 0, 0, 0]
                }
                , tooltip: {
                    enabled: false
                }
                , credits: {
                    enabled: false
                }
                , title: {
                    text: ''
                }
                , pane: {
                    size: '150%'
                    , center: ['50%', '50%']
                    , startAngle: 0
                    , endAngle: 360
                        , background: [{ // Track for Stand
                            outerRadius: '60%'
                            , innerRadius: '50%'
                            , backgroundColor: '#eee'
                            , borderWidth: 0
                            , }]
                            , }
                            , yAxis: {
                                min: 0
                                , max: 100
                                , lineWidth: 0
                                , tickPositions: []
                            }
                            , plotOptions: {
                                solidgauge: {
                                    borderWidth: '0'
                                    , dataLabels: {
                                        enabled: false
                                    }
                                    , linecap: 'flat'
                                    , stickyTracking: true
                                }
                                , series: {
                                    shadow: true
                                }
                            }
                            , series: [{
                                name: 'Complete'
                                , borderColor: Highcharts.getOptions().colors[2]
                                , data: [{
                                    color: Highcharts.getOptions().colors[2]
                                    , radius: '50%'
                                    , innerRadius: '60%'
                                    , y: 100
                                }]
                            }]
                        }, function callback() {
                            var chart = this
                            , series = chart.series[0]
                            , shape = series.data[0].shapeArgs
                            , x = shape.x
                            , y = shape.y;
                            chart.renderer.text(series.data[0].y + '<span style="vertical-align:super;font-size:50%">%</span><br><div style="font-size:14">COMPLETE</div>').attr({
                                'y': 10
                                , 'stroke': '#000'
                                , 'align': 'center'
                                , 'font-size': '44px'
                                , 'letterspacing': '1px'
                                , 'zIndex': 10
                            }).css({
                                fontFamily: 'Roboto, sans-serif'
                                , color: '#fff'
                                , }).translate(x, y).add(series.group);
                            chart.renderer.circle(x, y, 20).attr({
                                fill: '#2b2b2c'
                            }).add(series.group);
                        });
        }, 500);
    }

    /* Set the width of the side navigation to 0 */
    $scope.closeNav = function() {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("mainArea").style.marginRight = "0";
        document.getElementById("mainArea").style.opacity = '1';
        document.getElementById("side-nav").style.opacity = '1';
    }
    $(".button-collapse").sideNav();
    $("#sideNavReplay").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavReplay").toggleClass("sideNavSelected");
    });


    $http.get('job/fetch/one/'+$scope.id)
    .success(function(data){
        if(data.rows){
            $scope.job =data.rows[0];
            $scope.percetage = Math.round(data.rows[0].value.activeFlights)/((data.rows[0].value.activeFlights)+(data.rows[0].value.inactiveFlights)+(data.rows[0].value.pendingFlights))*100;
            $scope.assignedFlights = data.rows[0].value.pendingFlights+data.rows[0].value.inactiveFlights+data.rows[0].value.activeFlights;
            $scope.completedFlights = data.rows[0].value.inactiveFlights;
            $scope.assignedPilots=[];
            var counter =0;
            for(var i =0; i < (data.rows[0].value.assignedPilots.length)/3;i++){
                $scope.assignedPilots.push([]);
                for(j=0;j<3;j++){
                    if(data.rows[0].value.assignedPilots[counter])
                        $scope.assignedPilots[i].push(data.rows[0].value.assignedPilots[counter]);
                    counter++;
                }
            }

            $scope.assignedUavs=[];
            var counter =0;
            for(var i =0; i < (data.rows[0].value.assignedUavs.length)/3;i++){
                $scope.assignedUavs.push([]);
                for(j=0;j<3;j++){
                    if (data.rows[0].value.assignedUavs[counter])
                        $scope.assignedUavs[i].push(data.rows[0].value.assignedUavs[counter]);
                    counter++;
                }
            }

            $scope.assignedPBs=[];
            var counter =0;
            for(var i =0; i < (data.rows[0].value.assignedPBs.length)/3;i++){
                $scope.assignedPBs.push([]);
                for(j=0;j<3;j++){
                    if(data.rows[0].value.assignedPBs[counter])
                        $scope.assignedPBs[i].push(data.rows[0].value.assignedPBs[counter]);
                    counter++;
                }
            }
            if(data.rows[0].value.assignedPayloads){
                $scope.assignedPayloads = [];
                var counter =0;
                for(var i =0; i < (data.rows[0].value.assignedPayloads.length)/3;i++){
                    $scope.assignedPayloads.push([]);
                    for(j=0;j<3;j++){
                        if(data.rows[0].value.assignedPayloads[counter])
                            $scope.assignedPayloads[i].push(data.rows[0].value.assignedPayloads[counter]);
                        counter++;
                    }
                }
            }
            setTimeout(function() {
                $('.slider').slider({
                    height: 250
                });
            }, 100);

        }
        else{
            console.log("error in fatching");
        }
    });


    function addCharts(id) {
        Highcharts.chart(id, {
            chart: {
                type: 'solidgauge'
                , spacingBottom: 5
                , spacingTop: 5
                , spacingLeft: 5
                , spacingRight: 5
                , height: 210
                , margin: [0, 0, 0, 0]
            }
            , credits: {
                enabled: false
            }
            , title: {
                text: ''
            }
            , tooltip: {
                borderWidth: 0
                , enabled: false
                , backgroundColor: 'none'
                , shadow: false
                , style: {
                    fontSize: '16px'
                }
                , pointFormat: '<span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span><br><span style="font-size:12">{series.name}</span>'
                , positioner: function (boxWidth, boxHeight, point) {
                    return {
                        x: point.plotX - 27
                        , y: point.plotY - 13
                    };
                }
            }
            , pane: {
                size: '150%'
                , center: ['50%', '50%']
                , startAngle: 0
                , endAngle: 360
                , background: [{ // Track for Stand
                    outerRadius: '60%'
                    , innerRadius: '50%'
                    , backgroundColor: '#eee'
                    , borderWidth: 0
                    , }]
                    , }
                    , yAxis: {
                        min: 0
                        , max: 100
                        , lineWidth: 0
                        , tickPositions: []
                    }
                    , plotOptions: {
                        solidgauge: {
                            borderWidth: '0'
                            , dataLabels: {
                                enabled: false
                            }
                            , linecap: 'flat'
                            , stickyTracking: true
                        }
                    }
                    , series: [{
                        name: 'Complete'
                        , borderColor: '#4caf50'
                        , data: [{
                            color: Highcharts.getOptions().colors[2]
                            , radius: '50%'
                            , innerRadius: '60%'
                            , y: 100
                        }]
                    }]
                }, function callback() {
                    var chart = this
                    , series = chart.series[0]
                    , shape = series.data[0].shapeArgs
                    , x = shape.x
                    , y = shape.y;
                    chart.renderer.text(series.data[0].y + '<span style="vertical-align:super;font-size:50%">%</span><br><div style="font-size:14">COMPLETE</div>').attr({
                        'y': 10
                        , 'stroke': '#303030'
                        , 'align': 'center'
                        , 'font-size': '44px'
                        , 'letterspacing': '1px'
                        , 'zIndex': 10
                    }).css({
                        fontFamily: 'Roboto, sans-serif'
                        , color: '#000'
                        , }).translate(x, y).add(series.group);
                    chart.renderer.circle(x, y, 20).attr({
                        fill: '#FFFFFF'
                    }).add(series.group);
                });
    }
    function initialize() {
        var styles = [
        {
          stylers: [
          { hue: '#00ffe6' },
          { saturation: -20 }
          ]
      },{
          featureType: 'road',
          elementType: 'geometry',
          stylers: [
          { lightness: 100 },
          { visibility: 'simplified' }
          ]
      },{
          featureType: 'road',
          elementType: 'labels',
          stylers: [
          { visibility: 'off' }
          ]
      }
      ];
      // var styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});
      var map;
      var bounds = new google.maps.LatLngBounds();
      var mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(55.6468, 37.581),
        // mapTypeControlOptions: {
        //     mapTypeIds: ['roadmap', 'map_style']
        // },
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
    // map.setTilt(45);
    // map.mapTypes.set('map_style', styledMap);
    // map.setMapTypeId('map_style');

    // Multiple Markers
    $http.get('flight/fetch/' + $scope.id).success(function (data) {
        if (data.rows) {
            $scope.markers = data.rows;
                // Display multiple markers on a map
                var infoWindow = new google.maps.InfoWindow()
                , marker, i;
                // Loop through our array of markers & place each one on the map
                for (i = 0; i < $scope.markers.length; i++) {

                    var position = new google.maps.LatLng($scope.markers[i].value.location[0], $scope.markers[i].value.location[1]);
                    bounds.extend(position);
                    marker = new google.maps.Marker({
                        position: position
                        , map: map
                        , title: $scope.markers[i].key
                        , icon: {
                            size: new google.maps.Size(50, 58)
                            , scaledSize: new google.maps.Size(50, 58)
                            , url: "images/greenpin.png"
                        }
                    });
                    // Allow each marker to have an info window
                    google.maps.event.addListener(marker, 'click', (function (marker, i) {
                        return function () {
                            var infoContent = `<div id='customWindow'>
                            <div class='card' style='width:225px;'>
                            <div class='` + 'green' + `' style='color:white;height:40px;border-radius:5px 5px 0px 0px;'>
                            <h6 class='center' style='padding-left:10px;padding-top:10px'>` + $scope.markers[i].key + "-F" + $scope.markers[i].value.count + `</h6>
                            </div>
                            <div style='height:290px; overflow:hidden'>
                            <div class='row'>
                            <div class='col s12 m12 l12'>
                            <div style='overflow:hidden; margin-top:10px' id='chart'></div>
                            </div>
                            </div>
                            <div class='row'>
                            <div class='col s12 m12 l12'><a href = #past/`+$scope.id+`/`+$scope.markers[i].key + "-F" + $scope.markers[i].value.count+`  class='btn col s12 ` + 'green' + `'>VIEW HIGHLIGHTS</a></div>
                            </div>
                            </div>
                            </div>
                            </div>`;
                            infoWindow.setContent(infoContent);
                            infoWindow.open(map, marker);
                            infoWindow.setOptions({
                                pixelOffset: 0
                            });
                            addCharts("chart");
                            $scope.currentInfo = $scope.markers[i];
                        }
                    })(marker, i));
                    // Automatically center the map fitting all markers on the screen
                    map.fitBounds(bounds);
                }
            }
        }).error(function (error) {
            console.log(error);
        });

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(14);
        google.maps.event.removeListener(boundsListener);
    });

    google.maps.event.addListener(map, 'domready', function() {
        var iwOuter = $('.gm-style-iw');
        var iwBackground = iwOuter.prev();
        iwBackground.children(':nth-child(2)').css({'display' : 'none'});
        iwBackground.children(':nth-child(4)').css({'display' : 'none'});

    });

}
initialize();
});
