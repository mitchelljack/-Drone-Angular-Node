angular.module("demo").controller("createPurpleboxController",function($routeParams,$rootScope,$scope,$http){
	$scope.eid = $routeParams.id;
	$scope.isAdmin = $rootScope.isAdmin;
	$scope.formInfo={};
  $scope.title = "CREATE A PURPLE BOX ";
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
	//$scope.formInfo.customer = "Option1";
	// $('select').material_select();
	// $('.datepicker').pickadate({
	// 	selectMonths: true,
	// 	selectYears: 15
	// });
	if($scope.eid!='false'){
        $scope.title = "EDIT PURPLE BOX ";
        // $scope.formInfo.serialNo = $routeParams.id;
        $http.get('purplebox/fetch/one/'+$scope.eid)
        .success(function(data) {
        	if(data!='error'){
        		// if($scope.stats==null)
        		// {
        		// 	$scope.stats.push(data.manufacturer);
        		// 	$scope.conditions.push(data.condition);
        		// 	$scope.releaseStats.push(data.releaseStatus);
        		// 	$scope.modelTypes.push(data.modelType);
						//
        		// }
        		$scope.formInfo = data;
        	}
        	else{
        		alert('Error fetching data');
        	}
        })
        .error(function(error){
        	alert('Error fetching data');
        });
    }
    $scope.validate = function(){
    	return $scope.formInfo.serialNo && $scope.formInfo.name && $scope.formInfo.condition && $scope.formInfo.modelType && $scope.formInfo.serviceDate;
    };
    $scope.changed = function(id){
    	if($scope.formInfo[id]=='link' && $scope.isDialog){
    		$scope.catergory = id;
    		$('#addModal').openModal();
    	}
    }
		$scope.loading = false;
    $scope.submit = function(){
    	if($scope.eid == 'false'){
    		$scope.formInfo.operator = {};
    		$scope.formInfo.operator.name = $scope.profile.name;
    		$scope.formInfo.operator.email = $scope.profile.email;
    		$scope.formInfo.operator.image = $scope.profile.image;
    		if($scope.formInfo.serialNo && $scope.formInfo.name && $scope.formInfo.condition
    			&& $scope.formInfo.modelType && $scope.formInfo.serviceDate){
						$scope.loading = true;
    			$http.post("/purplebox/create",$scope.formInfo)
        		.success(function(data,status){
        			if(data == 'success'){
        				location.href="#/done/purplebox/"+$scope.formInfo.serialNo;
        			}
        			else
        				alert("IoT Registered Device Limit, please delete devices or increase limit");
							$scope.loading = false;
        		})
        		.error(function(data,status){
        			alert("IoT Registered Device Limit, please delete devices or increase limit");
							$scope.loading = false;
        		});
        	}
        	else{
        		alert("please fill the required fields");
        	}
    }
    else{
    	$scope.formInfo.operator = {};
    	$scope.formInfo.operator.name = $scope.profile.name;
    	$scope.formInfo.operator.email = $scope.profile.email;
    	$scope.formInfo.operator.image = $scope.profile.image;
    	if($scope.formInfo.serialNo && $scope.formInfo.name && $scope.formInfo.condition
    		&& $scope.formInfo.modelType && $scope.formInfo.serviceDate){
					$scope.loading = true;
    		$http.post("/purplebox/edit",$scope.formInfo)
    	.success(function(data,status){
    		if(data == 'success'){
    			location.href="#/inventory-purpleboxes";
    		}
    		else
    			alert("Error in update");
				$scope.loading = false;
    	})
    	.error(function(data,status){
    		alert("Error in update");
				$scope.loading = false;
    	});
    }
    else{
    	alert("please fill the required fields");
    }
}

};
$http.get('options/purplebox/all')
.success(function(data){
	if(data!='error'){
		$scope.stats = data.status;
		$scope.conditions = data.condition;
		$scope.releaseStats = data.releaseStatus;
		$scope.modelTypes = data.modelType;
	}
})
.error(function(){console.log("error");})

$http.get('appservice/get-version')
.success(function(data){
	if(data!='error' && data.docs.length>0){
		$scope.formInfo.appversion = data.docs[0].version
	} else {
		$scope.formInfo.appversion = "1.0.0"
	}
})
.error(function(){console.log("error");})


$scope.formInfo.serialNo = new Date().getTime();

$scope.addClicked = function(){
	$scope.addValue = $("#addValue").val();
	if($scope.addValue){
		$http.get('options/purplebox/'+$scope.catergory+'/'+$scope.addValue)
		.success(function(){
			$('#addModal').closeModal();
			$http.get('options/purplebox/all')
			.success(function(data){
				if(data!='error'){
					$scope.stats = data.status;
					$scope.conditions = data.condition;
					$scope.releaseStats = data.releaseStatus;
					$scope.modelTypes = data.modelType;
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
	$http.post('options/delete/purplebox/'+$scope.deleteOption.id+'/'+$scope.deleteOption.value)
	.success(function(){
		$('#deleteModal').closeModal();
		$http.get('options/purplebox/all')
		.success(function(data){
			if(data!='error'){
				$scope.stats = data.status;
				$scope.conditions = data.condition;
				$scope.releaseStats = data.releaseStatus;
				$scope.modelTypes = data.modelType;
			}
		})
		.error(function(){console.log("error");})
	})
	.error(function(){
		alert("error");
	})
};

});
