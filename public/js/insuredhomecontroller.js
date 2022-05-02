angular.module("demo").controller("insuredHomeController", function ($scope,$http) {
    $(".button-collapse").sideNav();
    $("#sideNavHome").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavHome").toggleClass("sideNavSelected");
    });
    var width = $(window).width();
    if (width <= 600) {
        $("#live").height(width * 1.25 + 30);
        $("#flights").height(width * 1.25);
        $('.slider').slider({
            height: 400,
            interval:10000000000
        });
    }
    else if (width > 1366) {
        $('.slider').slider({
            height: 400,
            interval:10000000000
        });
    }
    else {
        $('.slider').slider({
            height: 400,
            interval:10000000000
        });
    }
    $scope.menuClicked = function () {
        $(".btn-menu").fadeToggle("slow");
        $("#menuBtn").toggleClass("white");
        $("#menuBtn").toggleClass("red-text");
        $('.blur').toggleClass("blurredElement");
    };

    $scope.nextSlide = function(id) {
        $(id).slider('next');
    };

    $scope.previousSlide = function(id) {
        $(id).slider('prev');
    };

    $http.get('flight/graph/total')
    .success(function(data){
        $scope.planned = data[0];
        $scope.inFlight = data[1];
    })
    .error(function(error){
        console.log(error);
    })

    Highcharts.chart('container', {
    	chart: {
    		type: 'solidgauge',
    		spacingBottom: 5,
    		spacingTop: 5,
    		spacingLeft: 5,
    		spacingRight: 5,
    		height: 300,
    		margin: [0, 0, 0, 0]
    	},
    	tooltip: {
    		enabled: false
    	},
    	credits: {
    		enabled: false
    	},
    	title: {
    		text: ''
    	},
    	pane: {
    		size: '150%',
    		center: ['50%', '50%'],
    		startAngle: 0,
    		endAngle: 360,
    		background: [{ // Track for Stand
    			outerRadius: '60%',
    			innerRadius: '45%',
    			backgroundColor: '#eee',
    			borderWidth: 0,
    		}],
    	},
    	yAxis: {
    		min: 0,
    		max: 100,
    		lineWidth: 0,
    		tickPositions: []
    	},
    	plotOptions: {
    		solidgauge: {
    			borderWidth: '0',
    			dataLabels: {
    				enabled: false
    			},
    			linecap: 'flat',
    			stickyTracking: true
    		},
    		series: {
    			shadow: true
    		}
    	},
    	series: [{
    		name: 'Complete',
    		borderColor: Highcharts.getOptions().colors[2],
    		data: [{
    			color: 'green',
    			radius: '45%',
    			innerRadius: '60%',
    			y: 50
    		}]
    	}]
    }, function callback() {
    	var chart = this,
    		series = chart.series[0],
    		shape = series.data[0].shapeArgs,
    		x = shape.x,
    		y = shape.y;
    	chart.renderer.text(series.data[0].y + '<span style="vertical-align:super;font-size:30%">%</span><br><div style="font-size:18">COMPLETE</div>').attr({
    		'y': 20,
    		'stroke': '#303030',
    		'align': 'center',
    		'font-size': '74px',
    		'letterspacing': '1px',
    		'zIndex': 10
    	}).css({
    		fontFamily: 'Roboto, sans-serif',
    		color: '#000',
    	}).translate(x, y).add(series.group);
    	chart.renderer.circle(x, y, 20).attr({
    		fill: '#FFFFFF'
    	}).add(series.group);
    });

    $('#flightsCompletedByType1').highcharts({
    	chart: {
    		type: 'column',
    		height: 275
    	},
    	title: {
    		text: ''
    	},
    	xAxis: {
    		categories: ['BROKER1', 'BROKER2', 'BROKER3', 'BROKER4', 'BROKER5', 'BROKER6']
    	},
    	yAxis: {
    		gridLineWidth: 0,
    		stackLabels: {
    			style: {
    				color: 'black'
    			},
    			enabled: true
    		},
    		min: 120,
    		max: 136
    	},
    	credits: {
    		enabled: false
    	},
    	plotOptions: {
    		column: {
    			stacking: 'normal',
    			pointPadding: 0,
    			groupPadding: 0.1,
    			dataLabels: {
    				enabled: false
    			}
    		}
    	},
    	series: [{
    		data: [{
    			color: '#F79989',
    			y: 123
    		}, {
    			color: '#f7a496',
    			y: 127
    		}, {
    			color: '#f6ada0',
    			y: 130
    		}, {
    			color: '#f6b7ad',
    			y: 129
    		}, {
    			color: '#f7c1b8',
    			y: 131
    		}, {
    			color: '#f8c1b8',
    			y: 135
    		}]
    	}]
    });

    $('#flightsCompletedByType').highcharts({
    	chart: {
    		type: 'column',
    		height: 275
    	},
    	title: {
    		text: ''
    	},
    	xAxis: {
    		categories: ['0-2kg', '2-5kg', '5-10kg', '10-20kg', '20-30kg', '30+kg']
    	},
    	yAxis: {
    		gridLineWidth: 0,
    		stackLabels: {
    			style: {
    				color: 'black'
    			},
    			enabled: true
    		},
    		min: 50,
    		max: 450
    	},
    	credits: {
    		enabled: false
    	},
    	plotOptions: {
    		column: {
    			stacking: 'normal',
    			pointPadding: 0,
    			groupPadding: 0.1,
    			dataLabels: {
    				enabled: false
    			}
    		}
    	},
    	series: [{
    		data: [{
    			color: '#4A4A4A',
    			y: 83
    		}, {
    			color: '#656565',
    			y: 427
    		}, {
    			color: '#787878',
    			y: 180
    		}, {
    			color: '#8A8A8A',
    			y: 329
    		}, {
    			color: '#9C9C9C',
    			y: 280
    		}, {
    			color: '#ABABAB',
    			y: 195
    		}]
    	}]
    });
    $(document).ready(function() {
    	google.charts.setOnLoadCallback(drawChart);

    	function drawChart() {
    		var data30 = google.visualization.arrayToDataTable([
    			['Task', 'Hours per Day'],
    			['DJI Inspire Series: 0-15days', 43],
    			['DJI Phantom Series: 15-30days', 54],
    			['Yuneec: 45-60days', 43],
    			['3DR: 60-90days', 13],
    			['Parrot: 90-100', 63],
    			['Other: 100+', 37]
    		]);

        var data60 = google.visualization.arrayToDataTable([
    			['Task', 'Hours per Day'],
    			['Sports Entertainement', 43],
    			['Real Estate', 54],
    			['Wind Turbines', 43],
    			['Agriculture', 13],
    			['Public Municiplalities', 63],
    			['Oil & Gas', 37]
    		]);

    		var options = {
    			'title': 'How Much Pizza I Ate Last Night',
    			pieHole: 0.5,
    			pieSliceText: '',
    			chartArea: {
    				width: '100%',
    				height: '100%'
    			},
    		};
    		var chart30 = new google.visualization.PieChart(document.getElementById('buisness30'));
        var chart60 = new google.visualization.PieChart(document.getElementById('buisness60'));
    		chart30.draw(data30, options);
        chart60.draw(data60, options);
    	}
    });

});
