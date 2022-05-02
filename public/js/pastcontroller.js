angular.module("demo").controller("pastController",function($scope,$http){
		$scope.jobTypes = [];
		$scope.Uavs = [];
		$scope.Pilots = [];
		$scope.searchText = "";
		$scope.filterJobs = [];
		$scope.flights = [];
    $scope.keyJobs = [];

		$(".button-collapse").sideNav();
    $("#sideNavReplay").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavReplay").toggleClass("sideNavSelected");
    });
		// $http.get('users/profile')
    // .success(function(data){
    //     $scope.profile = data;
    // });
    $http.get('job/fetch/past')
    .success(function(data){
        if(data.total_rows){
            $scope.jobs = data.rows;
            for (var i = 0; i < $scope.jobs.length; i++) {
								$scope.jobs[i].name = $scope.jobs[i].value.name;
								$scope.keyJobs[data.rows[i].value.name] = data.rows[i].value;
                // addCharts($scope.jobs[i].value, i);

								for(var j in $scope.jobs[i].value.Pilots)
                    if(jQuery.inArray($scope.jobs[i].value.Pilots[j], $scope.Pilots) < 0)
                        $scope.Pilots.push($scope.jobs[i].value.Pilots[j]);

                for(var j in $scope.jobs[i].value.Uavs)
                    if(jQuery.inArray($scope.jobs[i].value.Uavs[j], $scope.Uavs) < 0)
                        $scope.Uavs.push($scope.jobs[i].value.Uavs[j]);
            }

						$scope.Pilots.sort();
            $scope.Uavs.sort();
            $scope.filterJobs = $scope.jobs;
            setTimeout(function () {
                $("select").material_select();
            },100);

						$http.get('flight/inventory')
            .success(function(data){
              for (var i = 0; i < data.length; i++) {
                  data[i].name = data[i].job+'-F'+data[i].count;

                  if($scope.keyJobs[data[i].job] && $scope.keyJobs[data[i].job].location) {
                      $scope.flights.push(data[i]);
                  }
              }
            })
            .error(function(error){ console.log(error); });
        }
        else{
            console.log("error in fetching past jobs");
        }
    })
    .error(function(){
        console.log('error');
    });
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        for (var i = 0; i < $scope.filterJobs.length; i++) {
            addCharts($scope.filterJobs[i].value.name, i);
        }
    });

		$http.get('options/job/all')
    .success(function(data){
        if(data!='error' && data.jobType){
            $scope.jobTypes = data.jobType;
            setTimeout(function () {
                $("select").material_select();
            },100);
        }
    })
    .error(function(){console.log("error");})

    $scope.updateFilter = function() {
        $scope.filterJobs = [];
        for(var i = 0; i < $scope.jobs.length; i++) {
            if($scope.searchText && $scope.jobs[i].value.name.indexOf($scope.searchText) < 0)
                continue;
            if($scope.jobFilter && $scope.jobFilter != $scope.jobs[i].value.jobType)
                continue;
            if($scope.statusFilter && $scope.statusFilter != "Complete")
                continue;

						if($scope.dateFrom) {
                var start_time = new Date($scope.dateFrom).getTime();
                var flag = false;
                for(var j = 0; j < $scope.flights.length; j++)
                    if($scope.jobs[i].value.name==$scope.flights[j].job && $scope.flights[j].flight_starttime && $scope.flights[j].date > start_time) {
                        flag = true;
                        break;
                    }
                if(!flag)
                    continue;
            }

            if($scope.dateTo) {
                var end_time = new Date($scope.dateTo).getTime();

                var flag = false;
                for(var j = 0; j < $scope.flights.length; j++)
                    if($scope.jobs[i].value.name==$scope.flights[j].job && $scope.flights[j].flight_starttime && $scope.flights[j].date < end_time) {
                        flag = true;
                        break;
                    }
                if(!flag)
                    continue;
            }

            if($scope.pilotFilter && jQuery.inArray($scope.pilotFilter, $scope.jobs[i].value.Pilots) < 0)
                continue;
            if($scope.uavFilter && jQuery.inArray($scope.uavFilter, $scope.jobs[i].value.Uavs) < 0)
                continue;
            $scope.filterJobs.push($scope.jobs[i]);
        }

    }

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

		$(document).ready(function () {
				$("#searchAreaCard").hide();
    });
});
