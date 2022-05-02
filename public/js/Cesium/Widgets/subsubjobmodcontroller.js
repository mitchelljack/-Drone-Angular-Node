angular.module("demo").controller("subsubjobController",function($scope,$routeParams,$http,$timeout){
    $scope.id = $routeParams.id;
    $scope.subid = $routeParams.subid;
    $scope.showGrids = false;
    $("#sideNavFlights").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavFlights").toggleClass("sideNavSelected");
    });
    $scope.viewGrids = function(){
        if($scope.showGrids==true){
            return 'col s8';
        }
        else
            return 'col s12';
    }
    $scope.buttonClicked = function(id){
        if($scope.currentGraph == id){
            $("#"+id).toggleClass('buttonSelected');
            $("#graphArea,#nonGraphArea").toggle();
        }
        else{
            $(".toggleMe").removeClass('buttonSelected');
            $("#"+id).addClass('buttonSelected');
            $("#graphArea").show();
            $("#nonGraphArea").hide();
        }

        var graphData=[];
        switch($(".buttonSelected").attr('id')) {
          case "AIR_PRESSURE":
              graphData = $scope.mapData.pressure;
              break;
          case "HUMIDITY":
              graphData = $scope.mapData.humidity;
              break;
          case "ALTITUDE":
              graphData = $scope.mapData.altitude;
              break;
          case "TEMPRATURE":
              graphData = $scope.mapData.temperature;
              break;
          case "PITCH":
              graphData = $scope.mapData.pitch;
              break;
          case "ROLL":
              graphData = $scope.mapData.roll;
              break;
          case "YAW":
              graphData = $scope.mapData.yaw;
              break;
          // case "SOUND":
          //     graphData = $scope.mapData.sound;
          //     break;
          case "BATTERY":
              graphData = $scope.mapData.battery;
              break;
        }

        $('#graphArea').highcharts({
             chart: {
                type: 'area'
                , width: this.plotWidth
                , height: 250,
                backgroundColor: '#4A4A4A'
            }
            , xAxis: {
                title:'',
                allowDecimals: false
                , labels: {
                   formatter: function () {
                        return this.value; // clean, unformatted number for year
                    }
                }
            }, credits: {
                enabled: false
            },

            title:{
                style:{
                    color:'white'
                }
                ,text:id}
                , yAxis: {
                   title: {
                      text: ''
                  }
                  , labels: {
                  }
             }
            // , tooltip: {
            //     pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
            // }
            , plotOptions: {
            	area: {
            		pointStart: 0
            		, marker: {
            			enabled: false
            			, symbol: 'circle'
            			, radius: 2
            			, states: {
            				hover: {
            					enabled: true
            				}
            			}
            		}
            	}
            }
            , series: [{
            	name: ' '
            	, data: graphData,
            	color: '#848484'
            }]

        });
        $scope.currentGraph = id;
    }
    $http.get("flight/fetch/one/"+$scope.subid)
    .success(function(data){
        if(data.rows)
            $scope.flight = data.rows;
        $scope.drawData(true);
    })
    .error(function(error){
        console.log(error);
    });
$scope.previousData = 0;
$scope.drawData = function(firstTime) {
    var start_time = $scope.flight[0].value.flight_starttime?$scope.flight[0].value.flight_starttime:(new Date().getTime()/1000);
    $http.get("flight/fetch/gps/"+$scope.flight[0].value.assignedPBs.name+"/"+$scope.flight[0].id+"/"+start_time)
    .success(function(data){
        if(data.data != undefined && data.data.length>0){
            $scope.allSensors = data;
            $scope.lat = data.positions[0];
            $scope.lng = data.positions[1];
            $scope.altitude = data.altitude;

            for(var i = 0; i < data.altitude.length; i++) {
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

            $scope.mapData= data;
            var pinBuilder = new Cesium.PinBuilder();

            if(firstTime) {
                $scope.greenPin = viewer.entities.add({
                    name : 'start green pin',
                    position : Cesium.Cartesian3.fromDegrees(data.data[0],data.data[1]),
                    billboard : {
                        image : pinBuilder.fromColor(Cesium.Color.GREEN, 24).toDataURL(),
                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                    }
                });
                if($scope.flight[0].value.currentStatus == 'inactive') {
                    $scope.redPin = viewer.entities.add({
                        name : 'end red pin',
                        position : Cesium.Cartesian3.fromDegrees(data.data[data.data.length - 2],data.data[data.data.length - 1]),
                        billboard : {
                            image : pinBuilder.fromColor(Cesium.Color.RED, 24).toDataURL(),
                            verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                        }
                    });
                    viewer.flyTo($scope.greenPin);
                }
                else {
                    $scope.redPin = viewer.entities.add({
                        name : 'end red pin',
                        position : Cesium.Cartesian3.fromDegrees(data.data[data.data.length - 2],data.data[data.data.length - 1]),
                        billboard : {
                            image : "images/ripple.png",
                            verticalOrigin : Cesium.VerticalOrigin.CENTER
                        }
                    });
                    viewer.flyTo($scope.greenPin);
                }
            } else {
                viewer.entities.remove($scope.redPin);
                if($scope.previousData == data.data.length) {
                    $http.get("flight/fetch/one/"+$scope.subid)
                    .success(function(data1){
                        if(data1.rows) {
                            $scope.flight = data1.rows;
                            if($scope.flight[0].value.currentStatus == "inactive") {
                                clearInterval($scope.trackingTimer);
                                $scope.redPin = viewer.entities.add({
                                    name : 'end red pin',
                                    position : Cesium.Cartesian3.fromDegrees(data.data[data.data.length - 2],data.data[data.data.length - 1]),
                                    billboard : {
                                        image : pinBuilder.fromColor(Cesium.Color.RED, 24).toDataURL(),
                                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM
                                    }
                                });
                                return;
                            }
                        }
                    })
                    .error(function(error){
                        console.log(error);
                    });
                } else {
                      $scope.redPin = viewer.entities.add({
                          name : 'end red pin',
                          position : Cesium.Cartesian3.fromDegrees(data.data[data.data.length - 2],data.data[data.data.length - 1]),
                          billboard : {
                              image : "images/ripple.gif",
                              verticalOrigin : Cesium.VerticalOrigin.CENTER
                          }
                      });
                }
                // viewer.flyTo($scope.greenPin);
            }

            //Set bounds of our simulation time
            var during = (new Date(data.timestamp[data.timestamp.length - 1]) - new Date(data.timestamp[0]))/1000;
            var start = Cesium.JulianDate.fromDate(new Date(data.timestamp[0]));
            start = Cesium.JulianDate.addHours(start, -5, new Cesium.JulianDate());
            var stop = Cesium.JulianDate.addSeconds(start, during, new Cesium.JulianDate());

            //Make sure viewer is at the desired time.
            viewer.clock.startTime = start.clone();
            viewer.clock.stopTime = stop.clone();
            viewer.clock.currentTime = start.clone();
            viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
            viewer.clock.multiplier = 1;

            //Set timeline to simulation bounds
            viewer.timeline.zoomTo(start, stop);

            var property = new Cesium.SampledPositionProperty();
            for (var i = $scope.previousData / 2; i < data.positions.length / 2; i++) {
                var radians = Cesium.Math.toRadians(i);
                var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
                var position = Cesium.Cartesian3.fromDegrees(data.positions[i*2], data.positions[i*2+1], 0);
                property.addSample(time, position);

                //Also create a point for each sample we generate.
                viewer.entities.add({
                    position : position,
                    point : {
                        pixelSize : 5,
                        color : Cesium.Color.TRANSPARENT,
                        outlineColor : Cesium.Color.YELLOW,
                        outlineWidth : 3
                    }
                });
            }

            //Actually create the entity
            var entity = viewer.entities.add({

                //Set the entity availability to the same interval as the simulation time.
                availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start : start,
                    stop : stop
                })]),

                //Use our computed positions
                position : property,

                //Automatically compute orientation based on position movement.
                orientation : new Cesium.VelocityOrientationProperty(property),

                //Load the Cesium plane model to represent the entity
                billboard : {
                    image : "images/drone-icon.png", //pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
                    verticalOrigin : Cesium.VerticalOrigin.CENTER
                },

                //Show the path as a pink line sampled in 1 second increments.
                path : {
                    resolution : 1,
                    material : new Cesium.PolylineGlowMaterialProperty({
                        glowPower : 0.1,
                        color : Cesium.Color.YELLOW
                    }),
                    width : 10
                }
            });
            $scope.previousData = data.data.length;
            if(firstTime && $scope.flight[0].value.currentStatus == "active") {
                $scope.trackingTimer = setInterval(function() {
                    $scope.drawData(false);
                }, 5000);
            }
            var tracking = setInterval(function () {
                $scope.pageUpdateInfo();
            }, 500);


            $scope.pageUpdateInfo = function(){
                var i = parseInt(Cesium.JulianDate.secondsDifference(viewer.clock.currentTime,start));

                $("#gps-lat").html(data.positions[i*2]);
                $("#gps-lng").html(data.positions[i*2+1]);
                $("#AIR_PRESSURE h2").html(data.pressure[i]);
                $("#HUMIDITY h2").html(data.humidity[i]);
                $("#ALTITUDE h2").html(data.altitude[i]);
                $("#TEMPRATURE h2").html(data.temperature[i]);
                $("#PITCH h2").html(data.pitch[i]);
                $("#ROLL h2").html(data.roll[i]);
                $("#YAW h2").html(data.yaw[i]);
                // $("#SOUND h2").html(data.sound[i]);
                $("#BATTERY h2").html(data.battery[i]);

                // $("#gps-lat").html(data.data[data.data.length - 2]);
                // $("#gps-lng").html(data.data[data.data.length - 1]);
                // $("#AIR_PRESSURE h2").html(data.pressure[data.data.length/2]);
                // $("#HUMIDITY h2").html(data.humidity[data.data.length/2]);
                // $("#ALTITUDE h2").html(data.altitude[data.data.length/2]);
                // $("#TEMPRATURE h2").html(data.temperature[data.data.length/2]);
                // $("#PITCH h2").html(data.pitch[data.data.length/2]);
                // $("#ROLL h2").html(data.roll[data.data.length/2]);
                // $("#YAW h2").html(data.yaw[data.data.length/2]);
                // // $("#SOUND h2").html(data.sound[i]);
                // $("#BATTERY h2").html(data.battery[data.data.length/2]);
            }
        }
    })
    .error(function(error){
        console.log(error);
    });
}

$scope.getClass = function(limits,value){
    if(limits && value!=null){
        if(value<limits[2][0] || value>limits[2][1]){
            return 'red';
        }
        else if(value<limits[1][0] || value>limits[1][1]){
            return 'yellow';
        }
        else if(value<limits[0][0] || value>limits[0][1]){
            return 'green';
        }
    }
}





$scope.fullScreen = function(){
    if($scope.showGrids==false)
        return "{height:100%}"
    else
        return "{}"
}

Cesium.BingMapsApi.defaultKey = 'AqzV1M_9YQDSZOG7dw03eFj6m_gWikdq_71LU-zleTYWmaWInfYyS8JUZMu4Dfz-';
var viewer = new Cesium.Viewer('googleMap',{timeline:true,animation:true,infoBox : false,selectionIndicator : false});


});
