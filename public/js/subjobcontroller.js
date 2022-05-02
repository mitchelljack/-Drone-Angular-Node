angular.module("demo").controller("subjobController", function ($scope,$routeParams,$http,$rootScope) {
    $scope.id = $routeParams.id;
    $scope.isAdmin = $rootScope.isAdmin;
    $scope.percentage =0;

    $scope.closePendingModel = function(){
        $('#pendingFlightModal').closeModal();
    };

    $scope.openNav = function () {
        document.getElementById("mySidenav").style.width = "70%";
        // document.getElementById("mainArea").style.marginRight = "70%";
        document.getElementById("mainArea").style.opacity = '0.2';
        document.getElementById("side-nav").style.opacity = '0.2';
        setTimeout(function () {
            var mapDiv = document.getElementById('statusChart');
            var bounds = new google.maps.LatLngBounds();

            var map = new google.maps.Map(mapDiv, {
                center: {lat: 44.540, lng: -78.546},
                zoom: 14
            });
            var marker = new google.maps.Marker({
                map: map,
                icon: {
                    size: new google.maps.Size(50, 58),
                    scaledSize: new google.maps.Size(50, 58),
                    url: "images/markerblue.png"
                }
            });

            function placeMarker(position, map) {
                // marker.setAnimation(google.maps.Animation.BOUNCE);
                marker.setPosition(position);
            }

            if(!$scope.job || !$scope.job.value.location) return;
            console.log($scope.job);
            bounds.extend({lat:$scope.job.value.location[0], lng: $scope.job.value.location[1]});
            map.fitBounds(bounds);
            zoomChangeBoundsListener =
                google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
                    if (this.getZoom()){
                        this.setZoom(13);
                    }
            });
            setTimeout(function(){google.maps.event.removeListener(zoomChangeBoundsListener)}, 2000);
            placeMarker({lat:$scope.job.value.location[0], lng: $scope.job.value.location[1]},map);
            //
            // var address = $scope.job.value.address;
            // var city = $scope.job.value.city;
            // var territory = $scope.job.value.state;
            // var zipCode = $scope.job.value.zipCode;
            // var country = $scope.job.value.country;
            // $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+','+city+','+territory+','+zipCode+','+country+'&key=AIzaSyDe6galtm6BnVZE-8PfF7v8YtZzSeyO9S0')
            // .success(function(data){
            //     if(data.status == 'OK'){
            //
            //     }
            // })
            // .error(function(error){
            //     console.log('error');
            // });
        }, 500);
    }
    /* Set the width of the side navigation to 0 */
    $scope.closeNav = function () {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("mainArea").style.marginRight = "0";
        document.getElementById("mainArea").style.opacity = '1';
        document.getElementById("side-nav").style.opacity = '1';
    }
    $(".button-collapse").sideNav();
    $("#sideNavFlights").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavFlights").toggleClass("sideNavSelected");
    });
    $http.get('job/fetch/one/'+$scope.id)
    .success(function(data){
        if(data.rows){
            $scope.job =data.rows[0];
            $scope.percentage = Math.round(data.rows[0].value.activeFlights)/((data.rows[0].value.activeFlights)+(data.rows[0].value.inactiveFlights)+(data.rows[0].value.pendingFlights))*100;
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
            $scope.assignedPayloads = [];

            if(data.rows[0].value.assignedPayloads){
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
    $scope.changeStatus = function(id,newStatus)
    {
        $http.post('flight/change-status',{"id":id,"newStatus":newStatus})
        .success(function(data){
            if(data=="success")
            {
                $http.get('flight/fetch/'+$scope.id)
                .success(function(data){
                    if(data.total_rows){
                        $scope.flights = data.rows;
                    }
                    else{
                        console.log("error in fetching past flights");
                    }
                })
                .error(function(){
                    console.log('error');
                });
            }
        })
        .error(function(error){
            console.log(error);
        });
    };

    $http.get('flight/fetch/'+$scope.id)
    .success(function(data){
        if(data.total_rows){
            $scope.flights = data.rows;
        }
        else{
            console.log("error in fetching past flights");
        }
    })
    .error(function(){
        console.log('error');
    });
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        for (var i = 0; i < $scope.flights.length; i++) {
            if($scope.flights[i].value.currentStatus == 'inactive')
                addCharts($scope.flights[i].key +'-'+ $scope.flights[i].value.count, i);
        }
    });

    function addCharts(id, index) {
        Highcharts.chart(id, {
            chart: {
                type: 'solidgauge'
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
                    }
                    , series: [{
                        name: 'Complete'
                        , borderColor: Highcharts.getOptions().colors[2]
                        , data: [{
                            color: '#278b04'
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
                    chart.renderer.text(series.data[0].y + '<span style="vertical-align:super;font-size:30%">%</span><br><div style="font-size:14">COMPLETE</div>').attr({
                        'y': 15
                        , 'stroke': '#303030'
                        , 'align': 'center'
                        , 'font-size': '64px'
                        , 'letterspacing': '1px'
                        , 'zIndex': 10
                    }).css({
                        fontFamily: 'Roboto, sans-serif'
                        , color: '#6a6767'
                        , }).translate(x, y).add(series.group);
                    chart.renderer.circle(x, y, 20).attr({
                        fill: '#FFFFFF'
                    }).add(series.group);
                });
    }

});
