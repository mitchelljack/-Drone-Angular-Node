angular.module("demo").controller("inventoryJobsController",function($scope,$http, $rootScope){
    $(".button-collapse").sideNav();
    $("#linkResourceImg").toggleClass("sideNavSelected");
    $("#resourceImg").attr('src', 'images/resources_white2.png');
    $scope.isAdmin = $rootScope.isAdmin;
    $('#linkResourceImg').off('mouseleave');
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#linkResourceImg").toggleClass("sideNavSelected");
        $("#resourceImg").attr('src', 'images/resources_gray.png');
        $('#linkResourceImg').on('mouseleave', function() {
            $("#resourceImg").attr('src', 'images/resources_gray.png');
        });
    });
    $scope.isSearching = false;

    $scope.$watch('isSearching', function() {
        if($scope.isSearching) {
            setTimeout(function() {
                $("#inventory-search").focus();
            }, 100);
        }
    });
    // $scope.order
    $scope.prevOrder = '';
    $scope.setOrder = function (order) {
      $scope.order = order;
      if ($scope.prevOrder == order) {
        $scope.flag = !$scope.flag;
        if ($scope.flag) {
          $scope.arrow = 'keyboard_arrow_up';
        } else {
          $scope.arrow = 'keyboard_arrow_down';
        }
      } else {
        $scope.flag = false;
        $scope.arrow = 'keyboard_arrow_down';
      }
      $scope.prevOrder = order;
    };

    $(".button-collapse").sideNav();
    $http.get('/job/fetch/inventory')
    .success(function(data){
        $scope.jobs = data;
        var x;
        for(x in data)
        {
            if((data[x].inactiveFlights/(data[x].inactiveFlights+data[x].activeFlights+data[x].pendingFlights))>0){
                $scope.completedJobs++;
                $scope.jobs[x].currentStatus = "Completed";
            }
            else{
                $scope.activejobs++;
                $scope.jobs[x].currentStatus = "Active";
            }
        }
    }).
    error(function(error){
        console.log(error);
    });
    $scope.activejobs = 0;
    $scope.completedJobs = 0;
    $scope.uniqueCustomers = 0;
    $scope.closeDeleteModel = function(){
        $('#deleteModal').closeModal();
    };
    $scope.deleteClicked = function(){
        $http.get('job/fetch/one/'+$scope.deleteJob.id)
        .success(function(data,status){
            if(data!='error' && data.rows[0]){
                $scope.deleteJob.id = data.rows[0].id;
                $http.post('job/delete',{"id":$scope.deleteJob.id,"rev":$scope.deleteJob.rev, "name": data.rows[0].key})
                .success(function(data){
                    if(data=="success"){
                        $('#deleteModal').closeModal();
                        $scope.jobs.splice($scope.deleteJob.index, 1);
                    }
                    else{
                        $('#deleteModal').closeModal();
                        alert("error deleting");
                    }
                })
                .error(function(){

                })
            }
        })
        .error(function(error){
            alert('error deleting');
        });
    };
    $scope.assignDelete = function(id,rev,index){
        $scope.deleteJob = {};
        $scope.deleteJob.id = id;
        $scope.deleteJob.rev = rev;
        $scope.deleteJob.index= index;
    };

}).
controller("inventoryFlightsController",function($scope,$http){
    $("#resourceImg").attr('src', 'images/resources_white2.png');+-
    $(".button-collapse").sideNav();
    $("#linkResourceImg").toggleClass("sideNavSelected");
    $('#linkResourceImg').off('mouseleave');
    $scope.isSearching = false;

    $scope.$watch('isSearching', function() {
        if($scope.isSearching) {
            setTimeout(function() {
                $("#inventory-search").focus();
            }, 100);
        }
    });

    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#linkResourceImg").toggleClass("sideNavSelected");
        $("#resourceImg").attr('src', 'images/resources_gray.png');
        $('#linkResourceImg').on('mouseleave', function() {
            $("#resourceImg").attr('src', 'images/resources_gray.png');
        });
    });

    $scope.closeDeleteModel = function(){
        $('#deleteModal').closeModal();
    };

    $scope.prevOrder = '';
    $scope.setOrder = function (order) {
      $scope.order = order;
      if ($scope.prevOrder == order) {
        $scope.flag = !$scope.flag;
        if ($scope.flag) {
          $scope.arrow = 'keyboard_arrow_up';
        } else {
          $scope.arrow = 'keyboard_arrow_down';
        }
      } else {
        $scope.flag = false;
        $scope.arrow = 'keyboard_arrow_down';
      }
      $scope.prevOrder = order;
    };

    $scope.deleteClicked = function(){
        $http.post('flight/delete',{"id":$scope.deleteFlight.id,"rev":$scope.deleteFlight.rev,"job":$scope.deleteFlight.job,"currentStatus":$scope.deleteFlight.currentStatus})
        .success(function(data){
            if(data=="success"){
                $('#deleteModal').closeModal();
                $scope.flights.splice($scope.deleteFlight.index, 1);
            }
            else{
                $('#deleteModal').closeModal();
                alert("error deleting");

            }
        })
        .error(function(){

        })
    };
    $scope.assignDelete = function(id,rev,job,currentStatus,index){
        console.log(index);
        $scope.deleteFlight = {};
        $scope.deleteFlight.id = id;
        $scope.deleteFlight.rev = rev;
        $scope.deleteFlight.job = job;
        $scope.deleteFlight.currentStatus = currentStatus;
        $scope.deleteFlight.index= index;
    };


    $(".button-collapse").sideNav();
    $scope.activeFlights = 0;
    $scope.completedFlights = 0;
    $scope.uniqueCustomers = 0;
    $scope.flights=[];
    $http.get("flight/inventory")
    .success(function(data){
        $scope.flights = data;
        var x;
        for(x in data)
        {
            if(data[x].currentStatus=="active"){
                $scope.activeFlights = $scope.activeFlights + 1;
            }
            else if(data[x].currentStatus=="inactive"){
                $scope.completedFlights = $scope.completedFlights+1;
            }

            data[x].assignedUavs = data[x].assignedUavs && data[x].assignedUavs[0].name ? data[x].assignedUavs[0].name:"";
            data[x].assignedPBs = !data[x].assignedPBs || Array.isArray(data[x].assignedPBs) || !data[x].assignedPBs.hasOwnProperty('nickname') ? "":data[x].assignedPBs.nickname;
            data[x].assignedPilots = !data[x].assignedPilots || Array.isArray(data[x].assignedPilots) || !data[x].assignedPilots.hasOwnProperty('name') ? "":data[x].assignedPilots.name;
        }
    })
    .error(function(error){
        console.log(error);
    });
}).
controller("inventoryPeopleController",function($scope,$http){
    $("#resourceImg").attr('src', 'images/resources_white2.png');
    $('#linkResourceImg').off('mouseleave');
    $(".button-collapse").sideNav();
    $("#linkResourceImg").toggleClass("sideNavSelected");
    $scope.isSearching = false;

    $scope.$watch('isSearching', function() {
        if($scope.isSearching) {
            setTimeout(function() {
                $("#inventory-search").focus();
            }, 100);
        }
    });

    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#linkResourceImg").toggleClass("sideNavSelected");
        $("#resourceImg").attr('src', 'images/resources_gray.png');
        $('#linkResourceImg').on('mouseleave', function() {
            $("#resourceImg").attr('src', 'images/resources_gray.png');
        });
    });
    $(".button-collapse").sideNav();
    $scope.totalPersons = 0;
    $scope.pilots = 0;
    $scope.operators = 0;
    $http.get('operator/fetch/inventory')
    .success(function(data){
        if(data){
            $scope.persons = data;
            $scope.totalPersons = $scope.persons.length;
            for(var i in $scope.persons){
                if($scope.persons[i].operator=="Pilot in Charge"){
                    $scope.pilots++;
                }
                else if($scope.persons[i].operator=="Flight Operator"){
                    $scope.operators++;
                }
            }
        }
    })
    .error(function(error){console.log(error);});
    $scope.assignDelete = function(id,rev,index,email){
        console.log(index);
        $scope.deleteOperator = {};
        $scope.deleteOperator.id = id;
        $scope.deleteOperator.rev = rev;
        $scope.deleteOperator.index= index;
        $scope.deleteOperator.email = email;
    };
    $scope.closeDeleteModel = function(){
        $('#deleteModal').closeModal();
    };

    $scope.prevOrder = '';
    $scope.setOrder = function (order) {
      $scope.order = order;
      if ($scope.prevOrder == order) {
        $scope.flag = !$scope.flag;
        if ($scope.flag) {
          $scope.arrow = 'keyboard_arrow_up';
        } else {
          $scope.arrow = 'keyboard_arrow_down';
        }
      } else {
        $scope.flag = false;
        $scope.arrow = 'keyboard_arrow_down';
      }
      $scope.prevOrder = order;
    };

    $scope.deleteClicked = function(){
        $http.post('operator/delete',{"id":$scope.deleteOperator.id,"rev":$scope.deleteOperator.rev,"email":$scope.deleteOperator.email})
        .success(function(data){
            if(data=="success"){
                $('#deleteModal').closeModal();
                $scope.persons.splice($scope.deleteOperator.index, 1);
            }
            else{
                $('#deleteModal').closeModal();
                alert("error deleting");

            }
        })
        .error(function(){

        })
    };
}).
controller("inventoryUavsController",function($scope,$http){
    $("#resourceImg").attr('src', 'images/resources_white2.png');
    $('#linkResourceImg').on('mouseleave', function() {
        $("#resourceImg").attr('src', 'images/resources_white2.png');
    });
    $('#linkResourceImg').off('mouseleave');
    $(".button-collapse").sideNav();
    $("#linkResourceImg").toggleClass("sideNavSelected");
    $scope.isSearching = false;

    $scope.$watch('isSearching', function() {
        if($scope.isSearching) {
            setTimeout(function() {
                $("#inventory-search").focus();
            }, 100);
        }
    });

    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#linkResourceImg").toggleClass("sideNavSelected");
        $("#resourceImg").attr('src', 'images/resources_gray.png');
        $('#linkResourceImg').on('mouseleave', function() {
            $("#resourceImg").attr('src', 'images/resources_gray.png');
        });
    });

    $scope.assignDelete = function(id,rev,index){
        console.log(index);
        $scope.deleteUav = {};
        $scope.deleteUav.id = id;
        $scope.deleteUav.rev = rev;
        $scope.deleteUav.index= index;
    };
    $scope.closeDeleteModel = function(){
        $('#deleteModal').closeModal();
    };
    $scope.deleteClicked = function(){
        $http.post('uav/delete',{"id":$scope.deleteUav.id,"rev":$scope.deleteUav.rev})
        .success(function(data){
            if(data=="success"){
                $('#deleteModal').closeModal();
                $scope.uavs.splice($scope.deleteUav.index, 1);
            }
            else{
                $('#deleteModal').closeModal();
                alert("error deleting");

            }
        })
        .error(function(){

        })
    };

    $(".button-collapse").sideNav();
    $scope.totaluavs = 0;
    $scope.readyuavs = 0;
    $scope.uavtypes = [];
    $http.get('uav/fetch/inventory')
    .success(function(data){
        $scope.uavs = data;
        $scope.totaluavs = data.length;
        var x;

        for(x in data)
        {
            if($scope.uavtypes.indexOf(data[x].type) === -1){
                $scope.uavtypes.push(data[x].type);
            }

        }
    })
    .error(function(error){
        console.log(error);
    });

    $scope.prevOrder = '';
    $scope.setOrder = function (order) {
      $scope.order = order;
      if ($scope.prevOrder == order) {
        $scope.flag = !$scope.flag;
        if ($scope.flag) {
          $scope.arrow = 'keyboard_arrow_up';
        } else {
          $scope.arrow = 'keyboard_arrow_down';
        }
      } else {
        $scope.flag = false;
        $scope.arrow = 'keyboard_arrow_down';
      }
      $scope.prevOrder = order;
    };

}).
controller("inventoryPayloadController",function($scope,$http){
    $("#resourceImg").attr('src', 'images/resources_white2.png');
    $('#linkResourceImg').off('mouseleave');
    $(".button-collapse").sideNav();
    $("#linkResourceImg").toggleClass("sideNavSelected");
    $scope.isSearching = false;

    $scope.$watch('isSearching', function() {
        if($scope.isSearching) {
            setTimeout(function() {
                $("#inventory-search").focus();
            }, 100);
        }
    });

    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#linkResourceImg").toggleClass("sideNavSelected");
        $("#resourceImg").attr('src', 'images/resources_gray.png');
        $('#linkResourceImg').on('mouseleave', function() {
            $("#resourceImg").attr('src', 'images/resources_gray.png');
        });
    });
    $(".button-collapse").sideNav();
    $scope.totalPayloads = 0;
    $scope.readyPayloads = 0;
    $scope.types = [];
    $http.get('payload/fetch/inventory')
    .success(function(data){
        $scope.payloads = data;
        $scope.totalPayloads = data.length;
        var x;

        for(x in data)
        {
            if($scope.types.indexOf(data[x].modelType) === -1){
                $scope.types.push(data[x].modelType);
            }

        }
    })
    .error(function(error){
        console.log(error);
    });
    $scope.assignDelete = function(id,rev,index){
        console.log(index);
        $scope.deletePayload = {};
        $scope.deletePayload.id = id;
        $scope.deletePayload.rev = rev;
        $scope.deletePayload.index= index;
    };
    $scope.closeDeleteModel = function(){
        $('#deleteModal').closeModal();
    };
    $scope.deleteClicked = function(){
        $http.post('payload/delete',{"id":$scope.deletePayload.id,"rev":$scope.deletePayload.rev})
        .success(function(data){
            if(data=="success"){
                $('#deleteModal').closeModal();
                $scope.payload.splice($scope.deletePayload.index, 1);
            }
            else{
                $('#deleteModal').closeModal();
                alert("error deleting");

            }
        })
        .error(function(){

        })
    };

    $scope.prevOrder = '';
    $scope.setOrder = function (order) {
      $scope.order = order;
      if ($scope.prevOrder == order) {
        $scope.flag = !$scope.flag;
        if ($scope.flag) {
          $scope.arrow = 'keyboard_arrow_up';
        } else {
          $scope.arrow = 'keyboard_arrow_down';
        }
      } else {
        $scope.flag = false;
        $scope.arrow = 'keyboard_arrow_down';
      }
      $scope.prevOrder = order;
    };

}).
controller("inventoryPurpleBoxesController",function($scope,$http){
    $("#resourceImg").attr('src', 'images/resources_white2.png');
    $('#linkResourceImg').off('mouseleave');
    $(".button-collapse").sideNav();
    $("#linkResourceImg").toggleClass("sideNavSelected");
    $scope.isSearching = false;

    $scope.$watch('isSearching', function() {
        if($scope.isSearching) {
            setTimeout(function() {
                $("#inventory-search").focus();
            }, 100);
        }
    });

    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#linkResourceImg").toggleClass("sideNavSelected");
        $("#resourceImg").attr('src', 'images/resources_gray.png');
        $('#linkResourceImg').on('mouseleave', function() {
            $("#resourceImg").attr('src', 'images/resources_gray.png');
        });
    });
    $(".button-collapse").sideNav();
    $scope.totalPBs = 0;
    $scope.readyPBs = 0;
    $scope.types = [];
    $http.get('purplebox/fetch/inventory')
    .success(function(data){
        $scope.PBs = data;
        $scope.totalPBs = data.length;
        var x;

        for(x in data)
        {
            if($scope.types.indexOf(data[x].modelType) === -1){
                $scope.types.push(data[x].modelType);
            }

        }
    })
    .error(function(error){
        console.log(error);
    });
    $scope.assignDelete = function(id,rev,index){
        console.log(index);
        $scope.deletePB = {};
        $scope.deletePB.id = id;
        $scope.deletePB.rev = rev;
        $scope.deletePB.index= index;
    };

    $scope.assignUnregister = function(id,rev,index){
        $scope.unregisterPB = {};
        $scope.unregisterPB.id = id;
        $scope.unregisterPB.rev = rev;
        $scope.unregisterPB.index= index;
        console.log($scope.unregisterPB);
    };

    $scope.closeDeleteModel = function(){
        $('#deleteModal').closeModal();
    };

    $scope.closeUnregisterModel = function(){
        $('#unregisterModal').closeModal();
    };
    $scope.unregisterClicked = function(){
        $http.get('purplebox/unregister/'+$scope.unregisterPB.id)
        .success(function(data){
            console.log(data);
            if(data=="success"){
                $('#unregisterModal').closeModal();
                location.reload();
                //$scope.PBs$scope.unregisterPB.index, 1);
            }
            else{
                $('#deleteModal').closeModal();
                alert("error deleting");
            }
        })
        .error(function(){
        })
    }
    $scope.deleteClicked = function(){
        $http.post('purplebox/delete',{"id":$scope.deletePB.id,"rev":$scope.deletePB.rev})
        .success(function(data){
            if(data=="success"){
                $('#deleteModal').closeModal();
                $scope.PBs.splice($scope.deletePB.index, 1);
            }
            else{
                $('#deleteModal').closeModal();
                alert("error deleting");

            }
        })
        .error(function(){
        })
    };

    $scope.setOrder = function (order) {
        $scope.order = order;
    };

});
