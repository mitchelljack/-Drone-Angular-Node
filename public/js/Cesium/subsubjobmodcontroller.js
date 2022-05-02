angular.module("demo").controller("jobmapController",function($scope,$http, $rootScope){
    var map;
    var bounds = new google.maps.LatLngBounds();
    var position = $rootScope.position?$rootScope.position:[55.6468, 37.581];
    $scope.loading=false;
    $scope.jobTypes = [];
    $scope.Uavs = [];
    $scope.Pilots = [];
    $scope.searchText = "";
    $scope.keyJobs = {};
    $scope.flights = [];
    $scope.jobs = [];
    $scope.filterJobs = [];
    $scope.filterFlights = [];
    $scope.gmarkers = [];
    $scope.jobView = true;

    $scope.notificationClicked = function () {
        document.getElementById("notificationMenu").style.width = "300";
        document.getElementById("mainContent").style.opacity = "0.2";
    };
    $(".button-collapse").sideNav();
    $("#sideNavFlights").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavFlights").toggleClass("sideNavSelected");
    });

      function initialize() {
      var mapOptions = {
        zoom: 3,
        center: new google.maps.LatLng(12.0393205, -165.234375),

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
    $scope.loading=true;
    $http.get('job/fetch/active')
    .success(function(data){
        if(data.rows){
            for (var i = 0; i < data.rows.length; i++) {
                $scope.jobs.push(data.rows[i].value);
                $scope.keyJobs[data.rows[i].value.name] = data.rows[i].value;

                for(var j in data.rows[i].value.Pilots)
                    if(jQuery.inArray(data.rows[i].value.Pilots[j], $scope.Pilots) < 0)
                        $scope.Pilots.push(data.rows[i].value.Pilots[j]);

                for(var j in data.rows[i].value.Uavs)
                    if(jQuery.inArray(data.rows[i].value.Uavs[j], $scope.Uavs) < 0)
                        $scope.Uavs.push(data.rows[i].value.Uavs[j]);
                // addCharts($scope.jobs[i].value, i);
            }

            $scope.Pilots.sort();
            $scope.Uavs.sort();
            $scope.filterJobs = $scope.jobs;

            $http.get('flight/inventory')
            .success(function(data){
              for (var i = 0; i < data.length; i++) {
                  data[i].name = data[i].job+'-F'+data[i].count;

                  if($scope.keyJobs[data[i].job] && $scope.keyJobs[data[i].job].location) {
                      data[i].location = $scope.generateGeo($scope.keyJobs[data[i].job].location,data[i].count);
                      $scope.flights.push(data[i]);
                  }
              }

              $scope.loading = false;
              $scope.filterFlights = $scope.flights;
              $("select").material_select();
              $scope.mapDraw($scope.filterJobs, 'Job');
            })
            .error(function(error){ console.log(error); });
            // Display multiple markers on a map

        }
    })
    .error(function(error){ console.log(error); });

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(3);
        google.maps.event.removeListener(boundsListener);
    });

    google.maps.event.addListener(map, 'domready', function() {
        var iwOuter = $('.gm-style-iw');
        var iwBackground = iwOuter.prev();
        iwBackground.children(':nth-child(2)').css({'display' : 'none'});
        iwBackground.children(':nth-child(4)').css({'display' : 'none'});

    });

  }

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
          if($scope.searchText && $scope.jobs[i].name.indexOf($scope.searchText) < 0)
              continue;
          if($scope.jobFilter && $scope.jobFilter != $scope.jobs[i].jobType)
              continue;
          if($scope.statusFilter && $scope.statusFilter != "Pending")
              continue;
          if($scope.pilotFilter && jQuery.inArray($scope.pilotFilter, $scope.jobs[i].Pilots) < 0)
              continue;
          if($scope.uavFilter && jQuery.inArray($scope.uavFilter, $scope.jobs[i].Uavs) < 0)
              continue;
          $scope.filterJobs.push($scope.jobs[i]);
      }

      $scope.filterFlights = [];
      for(i = 0; i < $scope.flights.length; i++) {
          var uavArray = [];
          for(j = 0; j < $scope.flights[i].assignedUavs; j++)
              uavArray.push($scope.flights[i].assignedUavs[j].nickname);
          if($scope.searchText && $scope.flights[i].name.indexOf($scope.searchText) < 0)
              continue;
          if($scope.jobFilter && $scope.jobFilter != $scope.keyJobs[$scope.flights[i].job].jobType)
              continue;
          // if($scope.statusFilter && $scope.statusFilter != "Pending")
          //     continue;
          if($scope.pilotFilter && $scope.pilotFilter!=$scope.flights[i].assignedPilots.name)
               continue;
          if($scope.uavFilter && jQuery.inArray($scope.uavFilter, uavArray) < 0)
               continue;
          $scope.filterFlights.push($scope.flights[i]);
      }

      for(i = 0; i < $scope.gmarkers.length; i++) {
          $scope.gmarkers[i].setMap(null);
      }
      if($scope.jobView) {
        $scope.mapDraw($scope.filterJobs, 'Job');
      } else {
        $scope.mapDraw($scope.filterFlights, 'Flight');
      }
  }

  initialize();

  $scope.generateGeo = function(location, radius) {
      var y0 = parseFloat(location[0]);
      var x0 = parseFloat(location[1]);
      var rd = radius / 1000; //about 111300 meters in one degree

      var u = Math.random();
      var v = Math.random();

      var w = rd * Math.sqrt(u);
      var t = 2 * Math.PI * v;
      var x = w * Math.cos(t);
      var y = w * Math.sin(t);

      var newlat = y + y0;
      var newlon = x + x0;
      return [newlat, newlon];
  }

  $scope.mapDraw = function(data, type) {
      var infoWindow = new google.maps.InfoWindow(), marker, i;
      $scope.gmarkers = [];

      // Loop through our array of markers & place each one on the map
      for( i = 0; i < data.length; i++ ) {
          if(data[i].location){
              var position = new google.maps.LatLng(data[i].location[0], data[i].location[1]);
              bounds.extend(position);
              var pin = "images/yellowpin.png";
              if(type == 'Flight') {
                  if(data[i].currentStatus == 'active')
                    pin = "images/greenpin.png"
                  else if(data[i].currentStatus == 'pending')
                    pin = 'images/blackpin.png';
                  else
                    pin = 'images/redpin.png';
              }

              // if($scope.markers[i].value.color=='#EA5F50'){
              //     pin = 'images/redpin.png';
              // }
              // else if($scope.markers[i].value.color=='#dda722'){
              //     pin = 'images/yellowpin.png';
              // }
              // else if($scope.markers[i].value.color=='#278b04'){
              //     pin = "images/greenpin.png"
              // }
              marker = new google.maps.Marker({
                  position: position,
                  map: map,
                  title: data[i].name,
                  icon: {
                      size: new google.maps.Size(50, 58),
                      scaledSize: new google.maps.Size(50, 58),
                      url: pin
                  }
              });

              $scope.gmarkers.push(marker);
              // marker.setAnimation(google.maps.Animation.BOUNCE);
          }
          // Allow each marker to have an info window
          if(!marker) continue;
          google.maps.event.addListener(marker, 'click', (function(marker, i) {
              return function() {
                  var infoContent = `<div id='customWindow'>
                  <div class='card' style='width:450px;'>
                  <div style='color:white;height:40px;border-radius:5px 5px 0px 0px;background-color: orange'>
                  <h6 class='center' style='padding-left:10px;padding-top:10px;'>`+data[i].name+`</h6>
                  </div>
                  <div style='overflow:hidden'>
                  <div class='row'>
                  <div class='col s6 m6 l6'>
                  <div style='margin-bottom:20px;margin-top:30px;'><h5 class='center'><b>`+data[i].percentage+`% COMPLETE</b></h5></div>
                  </div>
                  <div class='col s6 m6 l6'>
                  <div class='col s12 m12 l12'>
                  <div style='border-bottom: 2px solid black;padding:5px;margin-top: 10px;text-align:center'>JOB TYPE</div>
                  <div style='margin-bottom:20px;;margin-top:20px;'><h6 class='center'><b>`+data[i].jobType+`</b></h6></div>
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>`;
                  if(type=="Flight") {
                    data[i].color = 'red';
                    var jobLink = `<a href="#/job-map/`+data[i].name+`" class='btn' style = 'background-color:`+data[i].color+`'>VIEW HIGHLIGHTS</a>`;
                    if(data[i].currentStatus == 'active') {
                      data[i].color = "green"
                      var jobLink = `<a href="#/job-map/`+data[i].name+`" class='btn' style = 'background-color:`+data[i].color+`'>VIEW HIGHLIGHTS</a>`;
                    }
                    else if(data[i].currentStatus == 'pending') {
                      data[i].color = 'gray';
                      jobLink = `<a class='btn' style = 'background-color:`+data[i].color+`'>VIEW HIGHLIGHTS</a>`;
                    }
                    infoContent = `<div id='customWindow'>
                    <div class='card' style='width:450px;'>
                    <div style='color:white;height:40px;border-radius:5px 5px 0px 0px;background-color: `+data[i].color+`'>
                    <h6 class='center' style='padding-left:10px;padding-top:10px;'>`+data[i].name+`</h6>
                    </div>
                    <div style='overflow:hidden'>
                    <div class='row'>
                    <div class='col s6 m6 l6' style="padding-top:30px;">`+jobLink+`</div>
                    <div class='col s6 m6 l6'>
                    <div class='col s12 m12 l12'>
                    <div style='border-bottom: 2px solid black;padding:5px;margin-top: 10px;text-align:center'>FLIGHT STATUS</div>
                    <div style='margin-bottom:20px;;margin-top:20px;'><h6 class='center'><b>`+(data[i].currentStatus=='pending'?"Pending":data[i].currentStatus=='active'?"Active":"Complete")+`</b></h6></div>
                    </div>
                    </div>
                    </div>
                    </div>
                    </div>
                    </div>`;
                  }
                  // <div style='border-bottom: 2px solid black;padding:5px;margin-top: 10px;text-align:center'>Planned Flights</div>
                  // <div style='margin-bottom:20px;;margin-top:20px;'><h4 class='center'><b>77</b></h4></div>

                  // <div class='row'>
                  // <div class='col s3 m3 l3'>.</div>
                  // <div class='col s6 m6 l6'><a href="#/job-map/`+data[i].name+`" class='btn' style = 'background-color:`+data[i].color+`'>VIEW HIGHLIGHTS</a></div>
                  // </div>
                  infoWindow.setContent(infoContent);
                  infoWindow.open(map, marker);
                  infoWindow.setOptions({pixelOffset: 0});
                  // addCharts("chart",i);
                  $scope.currentInfo = data[i];
              }
          })(marker, i));

      // Automatically center the map fitting all markers on the screen
      // map.fitBounds(bounds);
      }
  }
  $(document).ready(function () {
      // $("select").material_select();
      $("#searchAreaCard").hide();
  });
});
