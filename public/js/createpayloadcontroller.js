angular.module("demo").controller("createPayloadController",function($routeParams,$rootScope,$scope,$http){
	$scope.eid = $routeParams.id;
	$scope.isAdmin = $rootScope.isAdmin;
	$scope.formInfo={};
	$scope.title = "CREATE A PAYLOAD";
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
		$scope.title = "EDIT PAYLOAD";
		// $scope.formInfo.serialNo = $routeParams.id;
		$http.get('payload/fetch/one/'+$scope.eid)
		.success(function(data) {
			if(data!='error'){
				// if($scope.manufacturers!=null)
				// {
				// 	data.manufacturer =  data.manufacturer.filter(function(elem, index, self) {
				// 		return index == self.indexOf(elem);
				// 	});
				// 	$scope.manufacturers.push(data.manufacturer);
				// 	$scope.conditions.push(data.condition);
				// 	$scope.releaseStats.push(data.releaseStatus);
				// 	$scope.modelTypes.push(data.modelType);
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
		return $scope.formInfo.name && $scope.formInfo.serialNo && $scope.formInfo.status && $scope.formInfo.condition && $scope.formInfo.modelType && $scope.formInfo.serviceDate;
	};
	$scope.changed = function(id){
		if($scope.formInfo[id]=='link' && $scope.isDialog){
			$scope.catergory = id;
			$('#addModal').openModal();
		}
	}
	$scope.loading = false;
	$scope.submit = function(){
		if($scope.eid=="false"){
			$scope.formInfo.operator = {};
			$scope.formInfo.operator.name = $scope.profile.name;
			$scope.formInfo.operator.email = $scope.profile.email;
			$scope.formInfo.operator.image = $scope.profile.image;
			if($scope.formInfo.serialNo){
				$scope.loading = true;
				$http.post("/payload/create",$scope.formInfo)
				.success(function(data,status){
					if(data == 'success'){
						location.href="#/done/payload/"+$scope.formInfo.name;
					}
					else
						alert("Error in inserting");
					$scope.loading = false;
				})
				.error(function(data,status){
					alert("Error in inserting");
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
			if($scope.formInfo.serialNo){
				$scope.loading = true;
				$http.post("/payload/edit",$scope.formInfo)
				.success(function(data,status){
					if(data == 'success'){
						location.href="#/inventory-payload";
					}
					else
						alert("Error in inserting");
					$scope.loading = false;
				})
				.error(function(data,status){
					alert("Error in inserting");
					$scope.loading = false;
				});
			}
			else{
				alert("please fill the required fields");
			}
		}
	};
	$http.get('options/payload/all')
	.success(function(data){
		if(data){
			data.manufacturer =  data.manufacturer.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			});
			$scope.manufacturers = data.manufacturer;
			$scope.conditions = data.condition;
			$scope.releaseStats = data.releaseStatus;
			$scope.modelTypes = data.modelType;
		}
	})
	.error(function(){console.log("error");})

	$scope.addClicked = function(){
		$scope.addValue = $("#addValue").val();
		if($scope.addValue){
			$http.get('options/payload/'+$scope.catergory+'/'+$scope.addValue)
			.success(function(){
				$('#addModal').closeModal();
				$http.get('options/payload/all')
				.success(function(data){
					if(data){
						data.manufacturer =  data.manufacturer.filter(function(elem, index, self) {
							return index == self.indexOf(elem);
						});
						$scope.manufacturers = data.manufacturer;
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
		$http.post('options/delete/payload/'+$scope.deleteOption.id+'/'+$scope.deleteOption.value)
		.success(function(){
			$('#deleteModal').closeModal();
			$http.get('options/payload/all')
			.success(function(data){
				if(data!='error'){
					$scope.manufacturers = data.manufacturer;
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
