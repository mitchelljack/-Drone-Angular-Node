angular.module("demo").controller("homeController", function ($scope,$http) {
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
    $http.get('uav/fetch/date').success(function(data) {
    	if (data.length) {
    		$scope.totalUavs = data;
    		$('#totalUAVs').highcharts({
    			chart: {
    				type: 'area',
    				width: this.plotWidth,
    				height: 250
    			},
    			xAxis: {
    				title: '',
    				allowDecimals: false,
    				type: 'datetime',
    				dateTimeLabelFormats: {
    					day: '%e of %b'
    				}
    			},
    			credits: {
    				enabled: false
    			},
    			title: {
    				text: ''
    			},
    			yAxis: {
    				gridLineWidth: 0,
    				title: {
    					text: ''
    				}
    			},
    			tooltip: {
    				formatter: function() {
    					return this.y + ' UAV created on ' + Highcharts.dateFormat('%e of %b', new Date(this.x));
    				}
    			},
    			plotOptions: {
    				area: {
    					pointStart: 0,
    					marker: {
    						enabled: false,
    						symbol: 'circle',
    						radius: 2,
    						states: {
    							hover: {
    								enabled: true
    							}
    						}
    					}
    				}
    			},
    			series: [{
    				name: 'Last 90 Days',
    				data: $scope.totalUavs,
    				color: '#F79989',
    				pointInterval: 24 * 3600 * 1000
    			}]
    		});
    	}
    }).error(function(error) {
    	console.log(error);
    });
    $http.get('operator/fetch/date').success(function(data) {
    	if (data.length) {
    		$scope.totalPilots = data;
    		$('#totalPilots').highcharts({
    			chart: {
    				type: 'area',
    				width: this.plotWidth,
    				height: 250
    			},
    			xAxis: {
    				title: '',
    				allowDecimals: false,
    				type: 'datetime',
    				dateTimeLabelFormats: {
    					day: '%e of %b'
    				}
    			},
    			credits: {
    				enabled: false
    			},
    			title: {
    				text: ''
    			},
    			yAxis: {
    				gridLineWidth: 0,
    				title: {
    					text: ''
    				}
    			},
    			tooltip: {
    				formatter: function() {
    					return this.y + ' Pilots created on ' + Highcharts.dateFormat('%e of %b', new Date(this.x));
    				}
    			},
    			plotOptions: {
    				area: {
    					pointStart: 0,
    					marker: {
    						enabled: false,
    						symbol: 'circle',
    						radius: 2,
    						states: {
    							hover: {
    								enabled: true
    							}
    						}
    					}
    				}
    			},
    			series: [{
    				name: 'Last 90 Days',
    				data: $scope.totalPilots,
    				color: '#F79989',
    				pointInterval: 24 * 3600 * 1000
    			}]
    		});
    	}
    }).error(function(data) {
    	console.log(data);
    });
    $http.get('payload/fetch/date').success(function(data) {
    	if (data.length) {
    		$scope.totalPayloads = data;
    		$('#totalPayloads').highcharts({
    			chart: {
    				type: 'area',
    				width: this.plotWidth,
    				height: 250
    			},
    			xAxis: {
    				title: '',
    				allowDecimals: false,
    				type: 'datetime',
    				dateTimeLabelFormats: {
    					day: '%e of %b'
    				}
    			},
    			title: {
    				text: ''
    			},
    			credits: {
    				enabled: false
    			},
    			yAxis: {
    				gridLineWidth: 0,
    				title: {
    					text: ''
    				}
    			},
    			tooltip: {
    				formatter: function() {
    					return this.y + ' Payloads created on ' + Highcharts.dateFormat('%e of %b', new Date(this.x));
    				}
    			},
    			plotOptions: {
    				area: {
    					pointStart: 0,
    					marker: {
    						enabled: false,
    						symbol: 'circle',
    						radius: 2,
    						states: {
    							hover: {
    								enabled: true
    							}
    						}
    					}
    				}
    			},
    			series: [{
    				name: 'Last 90 Days',
    				data: $scope.totalPayloads,
    				color: '#F79989',
    				pointInterval: 24 * 3600 * 1000
    			}]
    		});
    	}
    }).error(function(error) {
    	console.log(error);
    });
    $http.get('purplebox/fetch/date').success(function(data) {
    	if (data.length) {
    		$scope.totalPurpleBoxes = data;
    		$('#totalPurpleBoxes').highcharts({
    			chart: {
    				type: 'area',
    				width: this.plotWidth,
    				height: 250
    			},
    			xAxis: {
    				title: '',
    				allowDecimals: false,
    				type: 'datetime',
    				dateTimeLabelFormats: {
    					day: '%e of %b'
    				}
    			},
    			title: {
    				text: ''
    			},
    			credits: {
    				enabled: false
    			},
    			yAxis: {
    				gridLineWidth: 0,
    				title: {
    					text: ''
    				}
    			},
    			tooltip: {
    				formatter: function() {
    					return this.y + ' Purple Boxes created on ' + Highcharts.dateFormat('%e of %b', new Date(this.x));
    				}
    			},
    			plotOptions: {
    				area: {
    					pointStart: 0,
    					marker: {
    						enabled: false,
    						symbol: 'circle',
    						radius: 2,
    						states: {
    							hover: {
    								enabled: true
    							}
    						}
    					}
    				}
    			},
    			series: [{
    				name: 'Last 90 Days',
    				data: $scope.totalPurpleBoxes,
    				color: '#F79989',
    				pointInterval: 24 * 3600 * 1000
    			}]
    		});
    	}
    })
    $http.get('job/fetch/active/type').success(function(data) {
    	$scope.activeJobsByType = data;
    	$('#activeJobsByType').highcharts({
    		chart: {
    			type: 'column',
    			height: 275
    		},
    		title: {
    			text: ''
    		},
    		xAxis: {
    			gridLineWidth: 0,
    			categories: $scope.activeJobsByType.categories
    		},
    		yAxis: {
    			gridLineWidth: 0,
    			gridLineWidth: 0,
    			stackLabels: {
    				style: {
    					color: 'black'
    				},
    				enabled: true,
    				formatter: function() {
    					return this.total;
    				}
    			},
    			min: 0,
    			max: 20
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
    			data: $scope.activeJobsByType.data
    		}]
    	});
    }).error(function(error) {
    	console.log(error);
    });
    $http.get('job/fetch/past/type').success(function(data) {
    	$scope.jobsCompletedByType = data;
    	$('#jobsCompletedByType').highcharts({
    		chart: {
    			type: 'column',
    			height: 275
    		},
    		title: {
    			text: ''
    		},
    		xAxis: {
    			gridLineWidth: 0,
    			categories: $scope.jobsCompletedByType.categories
    		},
    		yAxis: {
    			gridLineWidth: 0,
    			gridLineWidth: 0,
    			stackLabels: {
    				style: {
    					color: 'black'
    				},
    				enabled: true,
    				formatter: function() {
    					return this.total;
    				}
    			},
    			min: 0,
    			max: 10
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
    			data: $scope.jobsCompletedByType.data
    		}]
    	});
    }).error(function(error) {
    	console.log(error);
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
    		categories: ['REAL ESTATE', 'TURBINS', 'AGRICULTURE', 'SPOERTS', 'DAMS', 'CATTLE']
    	},
    	yAxis: {
    		gridLineWidth: 0,
    		stackLabels: {
    			style: {
    				color: 'black'
    			},
    			enabled: true,
    			formatter: function() {
    				return this.total;
    			}
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
    			color: '#4A4A4A',
    			y: 123
    		}, {
    			color: '#656565',
    			y: 127
    		}, {
    			color: '#787878',
    			y: 130
    		}, {
    			color: '#8A8A8A',
    			y: 129
    		}, {
    			color: '#9C9C9C',
    			y: 131
    		}, {
    			color: '#ABABAB',
    			y: 135
    		}],
    	}]
    });
    $(document).ready(function() {
    	google.charts.setOnLoadCallback(drawChart);

    	function drawChart() {
    		var data = google.visualization.arrayToDataTable([
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
    		// var chart = new google.visualization.PieChart(document.getElementById('buisness30'));
    		// chart.draw(data, options);
    	}
    });
    $scope.planned = 107;
    $scope.inFlight = 32;
    $scope.alerts = "--";
    $scope.warnings = 2;
    $scope.normal = 32;
    $scope.b30days = {
    	"newClients": {
    		amount: 4,
    		percentage: 28
    	},
    	"newPilots": {
    		amount: 12,
    		percentage: 17
    	},
    	"jobRevenue": {
    		percentage: 17,
    		amount: 124309
    	}
    };
    $scope.b60days = $scope.b30days = {
    	"newClients": {
    		amount: 4,
    		percentage: 28
    	},
    	"newPilots": {
    		amount: 12,
    		percentage: 17
    	},
    	"jobRevenue": {
    		percentage: 17,
    		amount: 124309
    	}
    };
    $scope.b90days = $scope.b30days = {
    	"newClients": {
    		amount: 4,
    		percentage: 28
    	},
    	"newPilots": {
    		amount: 12,
    		percentage: 17
    	},
    	"jobRevenue": {
    		percentage: 17,
    		amount: 124309
    	}
    };
    $scope.current = $scope.b30days;
});
