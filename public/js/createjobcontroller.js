angular.module("demo").controller("createJobController",function($routeParams,$rootScope,$scope,$http,$timeout){
    $scope.isAdmin = $rootScope.isAdmin;
    $scope.formInfo = {};
    $scope.formInfo.customer ="customer 1";
    $scope.customers = [];
    $scope.jobTypes = [];
    $scope.isDialog = false;
  	setTimeout(function() {
  		$scope.isDialog = true;
  	}, 1000);

    $http.get('users/profile')
    .success(function(data) {
        $scope.profile = data;
        console.log($scope.profile);
    })
    .error(function(error){
      alert('Error fetching data');
      $scope.loading = false;
    });

    $scope.minDate =  new Date().toISOString();
    $scope.validateCost = function(){
        if($scope.formInfo.cost)
            $scope.formInfo.cost = parseFloat($scope.formInfo.cost.toFixed(2));
        // if($scope.formInfo.cost!=1.00)
        //     $("#cost").val(parseFloat($scope.formInfo.cost));
    }
    // $scope.formInfo.jobType ="select";
    $scope.eid = $routeParams.id;
    if($scope.eid!='false'){
        $http.get('job/fetch/one/'+$scope.eid)
        .success(function(data,status){
            if(data!='error' && data.rows[0]){
                var temp = data.rows[0].value.startDate;
                // data.rows[0].value.startDate = "";
                // data.rows[0].value.endDate = "";
                delete data.rows[0].value.customer;
                if(!$scope.jobTypes[data.rows[0].value.jobType])
                    $scope.jobTypes.push(data.rows[0].value.jobType);
                $scope.formInfo = data.rows[0].value;
                $scope.formInfo.name = $routeParams.id;
            }
        })
        .error(function(error){
            alert('there was some error in fetching');
        });
    }
    $scope.titles = {'view1':'CREATE A MISSION',
    'view2':'SET MISSION LOCATION',
    'view3':'ASSIGN PILOTS',
    'view4':'ASSIGN UAVS',
    'view5':'ASSIGN PURPLEBOXES',
    'view6':'ASSIGN PAYLOADS',
    'view7':'NOTES'};
    $scope.changed = function(){
        if($scope.formInfo.customer=='link')
            location.href = "#/create-customer/create-job";
    }
    $scope.createPilot = function(){
        if($scope.customer=="add"){
            location.href = "#/create-pilot"
        }
    };
    $scope.addOptionClicked = function(id){
        if($scope.formInfo[id]=='link' && $scope.isDialog){
            $scope.catergory = id;
            $('#addModal').openModal();
        }
    }

    $("#customer").change(function(){
        $scope.formInfo.customer=document.getElementById("customer").value;
    });
    $("#jobType").change(function(){
        $scope.formInfo.jobType = document.getElementById("jobType").value;
    });
    $scope.formInfo.country = "USA";
    $scope.states = {
        "USA":[
        "Alabama",
        "Alaska",
        "American Samoa",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District Of Columbia",
        "Federated States Of Micronesia",
        "Florida",
        "Georgia",
        "Guam",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Marshall Islands",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Northern Mariana Islands",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Palau",
        "Pennsylvania",
        "Puerto Rico",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virgin Islands",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming"
        ],
        "Australia":
        ["New South Wales",
        "Queensland",
        "South Australia",
        "Tasmania",
        "Victoria",
        "Western Australia",
        "Australian Capital Territory",
        "Northern Territory"]
    };





    $http.get('operator/fetch/pilots')
    .success(function(data){
        if(data.rows)
            $scope.unAssignedPilots = data.rows;
    })
    .error(function(error){
        console.log(error);
    });

    $http.get('uav/fetch')
    .success(function(data){
        if(data.rows)
            $scope.unAssignedUavs = data.rows;
    })
    .error(function(error){
        console.log(error);
    });

    $http.get('purplebox/fetch')
    .success(function(data){
        if(data.rows)
            $scope.unAssignedPBs = data.rows;
    })
    .error(function(error){
        console.log(error);
    });

    $http.get('payload/fetch')
    .success(function(data){
        if(data.rows)
            $scope.unAssignedPayloads = data.rows;
    })
    .error(function(error){
        console.log(error);
    });

    setTimeout(function(){
        var softSlider = document.getElementById('priority');
        var lUpdate = document.getElementById('l-update');
        var label = function(){
            return "High";
        }
        noUiSlider.create(softSlider, {
            start: 0,
            step : 1,
            range: {
                min: 0,
                max: 3
            },
            format: {
                to: function ( value ) {
                    if(value==0)
                        return "Low";
                    else if(value==1)
                        return "Medium";
                    else if(value==2)
                        return "High";
                    else
                        return "Urgent"
                },
                from: function ( value ) {
                    return value;
                }
            }

        });
        softSlider.noUiSlider.on('update', function(){
            $scope.formInfo.priority = softSlider.noUiSlider.get();
        });

    },10);
    $scope.isMapLoaded=false;
    $scope.view = "view1";


    $scope.changeView = function(view){
        $scope.view = view;
    };
    var screenWidth = $(window).width();
    if(screenWidth>968){
        $scope.width = $(".getsize").width()/3-50;
    }
    else if(screenWidth>600)
    {
        $scope.width = $(".getsize").width()/2-50;
    }
    $scope.openView2 = function(data){
        $scope.selectedJob = data;
        $scope.view = "view2";
    };
    $scope.uPilotClicked = function(data){
        var plt = $scope.unAssignedPilots[data];
        $scope.unAssignedPilots.splice(data, 1);
        $scope.assignedPilots.push(plt)
    };
    $scope.aPilotClicked = function(data){
        var plt = $scope.assignedPilots[data];
        $scope.assignedPilots.splice(data, 1);
        $scope.unAssignedPilots.push(plt)
    };

    $scope.uUavClicked = function(data){
        var plt = $scope.unAssignedUavs[data];
        $scope.unAssignedUavs.splice(data, 1);
        $scope.assignedUavs.push(plt)
    };
    $scope.aUavClicked = function(data){
        var plt = $scope.assignedUavs[data];
        $scope.assignedUavs.splice(data, 1);
        $scope.unAssignedUavs.push(plt)
    };

    $scope.uPBClicked = function(data){
        var plt = $scope.unAssignedPBs[data];
        $scope.unAssignedPBs.splice(data, 1);
        $scope.assignedPBs.push(plt)
    };

    $scope.aPBClicked = function(data){
        var plt = $scope.assignedPBs[data];
        $scope.assignedPBs.splice(data, 1);
        $scope.unAssignedPBs.push(plt)
    };

    $scope.uPayloadsClicked = function(data){
        var plt = $scope.unAssignedPayloads[data];
        $scope.unAssignedPayloads.splice(data, 1);
        $scope.assignedPayloads.push(plt)
    };

    $scope.aPayloadsClicked = function(data){
        var plt = $scope.assignedPayloads[data];
        $scope.assignedPayloads.splice(data, 1);
        $scope.unAssignedPayloads.push(plt)
    };

    $scope.openMap = function(view){
        $scope.view = view;
        document.getElementById("view2").style.display = "block";
        if($scope.isMapLoaded==false)
        {
            $timeout(initMap,1000);
            $scope.isMapLoaded=true;
        }
    };
    $scope.assignAll = function(data,other){
        var length = $scope[data].length;
        for(var i =0;i< length;i++){
            var plt = $scope[data][0];
            $scope[data].splice(0, 1);
            $scope[other].push(plt)
        }
    };

    function initMap() {
        var mapDiv = document.getElementById('mapForJob');
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);

        var bounds = new google.maps.LatLngBounds();
        var map = new google.maps.Map(mapDiv, {
            center: {lat: 44.540, lng: -78.546},
            zoom: 14
        });
        google.maps.event.trigger(map,'resize');
        google.maps.event.addListener(map, 'click', function(e) {
            placeMarker(e.latLng, map);
            $scope.formInfo.location = [e.latLng.lat(),e.latLng.lng()];

        });
        var marker = new google.maps.Marker({
            map: map,
            icon: {
                size: new google.maps.Size(50, 58),
                scaledSize: new google.maps.Size(50, 58),
                url: "images/markerblue.png"
            }
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // For each place, get the icon, name and location.
          // var bounds = new google.maps.LatLngBounds();
          // places.forEach(function(place) {
          //   if (!place.geometry) {
          //     console.log("Returned place contains no geometry");
          //     return;
          //   }
          //
          //   if (place.geometry.viewport) {
          //     // Only geocodes have viewport.
          //     bounds.union(place.geometry.viewport);
          //   } else {
          //     placeMarker(place.geometry.location,map);
          //     bounds.extend(place.geometry.location);
          //   }
          // });

          placeMarker(places[0].geometry.location,map);
          $scope.formInfo.location = [places[0].geometry.location.lat(),places[0].geometry.location.lng()];
          $scope.formInfo.address = $("#pac-input").val();
          map.setCenter(places[0].geometry.location);
          map.setZoom(17);
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
            // marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setPosition(position);
        }
        // $scope.locate = function(){
        //     var address = $scope.formInfo.address;
        //     var city = $scope.formInfo.city;
        //     var territory = $scope.formInfo.state;
        //     var zipCode = $scope.zipCode;
        //     var country = $scope.formInfo.country;
        //     $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+','+city+','+territory+','+zipCode+','+country+'&key=AIzaSyDe6galtm6BnVZE-8PfF7v8YtZzSeyO9S0')
        //     .success(function(data){
        //         if(data.status == 'OK'){
        //             bounds.extend(data.results[0].geometry.location);
        //             map.fitBounds(bounds);
        //             map.setZoom(17);
        //             placeMarker(data.results[0].geometry.location,map);
        //             $scope.formInfo.location = [data.results[0].geometry.location.lat,data.results[0].geometry.location.lng];
        //         }
        //     })
        //     .error(function(error){
        //         console.log('error');
        //     });
        // }
    }
    $scope.assignedPilots = [];
    $scope.assignedUavs = [];
    $scope.assignedPBs=[];
    $scope.assignedPayloads=[];

    $scope.loading = false;
    $scope.submit = function(){
        console.log($scope.formInfo);
        if($scope.eid == 'false'){
            $scope.formInfo.operator = {};
            $scope.formInfo.operator.name = $scope.profile.name;
            $scope.formInfo.operator.email = $scope.profile.email;
            $scope.formInfo.operator.image = $scope.profile.image;
            $scope.formInfo.assignedPilots = [];
            for (var i in $scope.assignedPilots) {
                $scope.formInfo.assignedPilots.push({
                    "name": $scope.assignedPilots[i].value.name,
                    "email": $scope.assignedPilots[i].value.email,
                    "image": $scope.assignedPilots[i].value.croppedDataUrl
                });
            }
            $scope.formInfo.assignedPBs = [];
            for (var i in $scope.assignedPBs) {
                $scope.formInfo.assignedPBs.push({
                    "name": $scope.assignedPBs[i].value.serialNo,
                    "nickname":$scope.assignedPBs[i].value.name,
                    "image":$scope.assignedPBs[i].value.image
                });
            }
            $scope.formInfo.assignedUavs = [];
            for (var i in $scope.assignedUavs) {
                $scope.formInfo.assignedUavs.push({
                    "name": $scope.assignedUavs[i].value.serialNo,
                    "nickname": $scope.assignedUavs[i].value.name,
                    "image":$scope.assignedUavs[i].value.image

                });
            }
            $scope.formInfo.assignedPayloads = [];
            for (var i in $scope.assignedPayloads) {
                $scope.formInfo.assignedPayloads.push({
                    "name": $scope.assignedPayloads[i].value.serialNo,
                    "nickname": $scope.assignedPayloads[i].value.name,
                    "image":$scope.assignedPayloads[i].value.image

                });
            }
            $scope.loading = true;
            $http.post("/job/create",$scope.formInfo)
            .success(function(data,status){
                if(data=='success'){
                    location.href="#/done/job/"+$scope.formInfo.customer;
                }
                else{
                    alert("There was some error in insertion");
                }
                $scope.loading = false;
            })
            .error(function(data,status){
                console.log(data,error);
                $scope.loading = false;
            });
        }
        else{
            $scope.formInfo.operator = {};
            $scope.formInfo.operator.name = $scope.profile.name;
            $scope.formInfo.operator.email = $scope.profile.email;
            $scope.formInfo.operator.image = $scope.profile.image;
            $scope.formInfo.assignedPilots = [];
            for (var i in $scope.assignedPilots) {
                $scope.formInfo.assignedPilots.push({
                    "name": $scope.assignedPilots[i].value.name,
                    "email": $scope.assignedPilots[i].value.email,
                    "image": $scope.assignedPilots[i].value.croppedDataUrl
                });
            }
            $scope.formInfo.assignedPBs = [];
            for (var i in $scope.assignedPBs) {
                $scope.formInfo.assignedPBs.push({
                    "name": $scope.assignedPBs[i].value.serialNo,
                    "nickname": $scope.assignedPBs[i].value.name,
                    "image":$scope.assignedPBs[i].value.image
                });
            }
            $scope.formInfo.assignedUavs = [];
            for (var i in $scope.assignedUavs) {
                $scope.formInfo.assignedUavs.push({
                    "name": $scope.assignedUavs[i].value.serialNo,
                    "nickname": $scope.assignedUavs[i].value.name,
                    "image":$scope.assignedUavs[i].value.image

                });
            }
            $scope.formInfo.assignedPayloads = [];
            for (var i in $scope.assignedPayloads) {
                $scope.formInfo.assignedPayloads.push({
                    "name": $scope.assignedPayloads[i].value.serialNo,
                    "nickname": $scope.assignedPayloads[i].value.name,
                    "image":$scope.assignedPayloads[i].value.image

                });
            }
            $http.post("/job/edit",$scope.formInfo)
            .success(function(data,status){
                if(data=='success'){
                    location.href="#/invetory";
                }
                else{
                    alert("There was some error in insertion");
                }
            })
            .error(function(data,status){
                console.log(data,error);
            });
        }
    }


    $http.get("/customer/fetch")
    .success(function(data){
        $scope.customers = data.rows;
    })
    .error(function(data){
        console.log(data);
    });

    $http.get('options/job/all')
    .success(function(data){
        if(data!='error' && data.jobType){
            $scope.jobTypes = data.jobType;
        }
    })
    .error(function(){console.log("error");})


    $scope.addClicked = function(){
        $scope.addValue = $("#addValue").val();
        if($scope.addValue){
            $http.get('options/job/'+$scope.catergory+'/'+$scope.addValue)
            .success(function(){
                $('#addModal').closeModal();
                $http.get('options/job/all')
                .success(function(data){
                    if(data!='error' && data.jobType){
                        $scope.jobTypes = data.jobType;
                        $scope.formInfo.jobType = $scope.addValue;
                    }
                })
                .error(function(){console.log("error");})
            })
            .error(function(){
                alert("error");
            })
        }
    };

    $scope.closeAddModal = function(){
        $('#addModal').closeModal();
    };

    $scope.closeDeleteModal = function(){
        $('#deleteModal').closeModal();
    };


    $scope.openDelete = function(id){
        $("#deleteModal").openModal();
        $scope.deleteOption = {};
        $scope.deleteOption.id = id;
        $scope.deleteOption.value = $scope.formInfo[id];
    }


    $scope.deleteClicked = function(){
        $http.post('options/delete/job/'+$scope.deleteOption.id+'/'+$scope.deleteOption.value)
        .success(function(){
            $('#deleteModal').closeModal();
            $http.get('options/job/all')
            .success(function(data){
                if(data!='error'){
                    $scope.jobTypes = data.jobType;
                }
            })
            .error(function(){console.log("error");})
        })
        .error(function(){
            alert("error");
        })
    };

    $scope.changeRadius = function () {
        circle.setRadius = $scope.mapRadius;
    };

    $scope.getNumber = function(num) {
        return new Array(20);
    }

});
