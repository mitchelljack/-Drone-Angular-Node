angular.module("demo").controller("createUavController", function ($routeParams,$rootScope,$scope, $http) {
    $scope.eid = $routeParams.id;
    $scope.isAdmin = $rootScope.isAdmin;
    $scope.formInfo = {};
    $scope.view = "view1";
    $scope.title = "ADD NEW UAV";
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
    
    if($scope.eid!='false'){
        $scope.title = "EDIT UAV";
        // $scope.formInfo.serialNo = $routeParams.id;
        $http.get('uav/fetch/one/'+$scope.eid)
        .success(function(data) {
            if(data!='error'){
                // if(!$scope.manufacturers)
                // {
                //     $scope.manufacturers.push(data.manufacturer);
                //     $scope.modelTypes.push(data.model);
                //     $scope.uavTypes.push(data.type);
                //     $scope.batteries.push(data.battery);
                //     $scope.conditions.push(data.condition);
                // }
                $scope.formInfo = data;
                $scope.croppedDataUrl = data.image;
            }
            else{
                alert('Error fetching data');
            }
        })
        .error(function(error){
            alert('Error fetching data');
        });
        console.log($scope.formInfo.image)
    }

    $scope.changeView = function (view) {
        $scope.formInfo.image = $scope.croppedDataUrl;
        $scope.view = view;
    };
    $scope.loading = false;
    $scope.submit = function () {
        if($scope.eid=="false"){
            $scope.formInfo.operator = {};
            $scope.formInfo.operator.name = $scope.profile.name;
            $scope.formInfo.operator.email = $scope.profile.email;
            $scope.formInfo.operator.image = $scope.profile.image;
            if ($scope.formInfo.serialNo) {
              $scope.loading = true;
                $http.post("/uav/create", $scope.formInfo).success(function (data, status) {
                    if (data == "success") {
                        location.href = "#/done/uav/" + $scope.formInfo.name;
                    }
                    else alert("Error in Insertion", status);
                    $scope.loading = false;
                }).error(function (data, status) {
                    console.log(data, status);
                    $scope.loading = false;
                });
            }
            else {
                alert("please fill the required fieds");
            }
        }
        else{
            $scope.formInfo.operator = {};
            $scope.formInfo.operator.name = $scope.profile.name;
            $scope.formInfo.operator.email = $scope.profile.email;
            $scope.formInfo.operator.image = $scope.profile.image;
            if ($scope.formInfo.serialNo) {
                $scope.loading = true;
                $http.post("/uav/edit", $scope.formInfo).success(function (data, status) {
                    if (data == "success") {
                        location.href = "#/inventory-uavs/";
                    }
                    else alert("Error in Update", status);
                    $scope.loading = false;
                }).error(function (data, status) {
                    alert("Error in Update", status);
                    $scope.loading = false;
                });
            }
            else {
                alert("please fill the required fieds");
            }
        }

    }
    $scope.validate = function(){
        return $scope.formInfo.name && $scope.formInfo.manufacturermanufacturer && $scope.formInfo.model && $scope.formInfo.serialNo && $scope.formInfo.model;
    };

    $scope.changed = function(id){
        if($scope.formInfo[id]=='link' && $scope.isDialog){
            $scope.catergory = id;
            $('#addModal').openModal();
        }
    };

    $http.get('options/uav/all')
    .success(function(data){
        if(data!='error'){

            $scope.manufacturers = data.manufacturer;
            $scope.modelTypes = data.model;
            $scope.uavTypes = data.type;
            $scope.batteries = data.battery;
            $scope.conditions = data.condition;
        }
    })
    .error(function(){console.log("error");})
    $scope.addClicked = function(){
        $scope.addValue = $("#addValue").val();
        if($scope.addValue){
            $http.get('options/uav/'+$scope.catergory+'/'+$scope.addValue)
            .success(function(){
                $('#addModal').closeModal();
                $http.get('options/uav/all')
                .success(function(data){
                    if(data!='error'){
                        $scope.manufacturers = data.manufacturer;
                        $scope.modelTypes = data.model;
                        $scope.uavTypes = data.type;
                        $scope.batteries = data.battery;
                        $scope.conditions = data.condition;
                        $scope.formInfo[$scope.catergory] = $scope.addValue;
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
        $http.post('options/delete/uav/'+$scope.deleteOption.id+'/'+$scope.deleteOption.value)
        .success(function(){
            $('#deleteModal').closeModal();
            $http.get('options/uav/all')
            .success(function(data){
                if(data!='error'){
                 $scope.manufacturers = data.manufacturer;
                 $scope.modelTypes = data.model;
                 $scope.uavTypes = data.type;
                 $scope.batteries = data.battery;
                 $scope.conditions = data.condition;
             }
         })
            .error(function(){console.log("error");})
        })
        .error(function(){
            alert("error");
        })
    };


});
