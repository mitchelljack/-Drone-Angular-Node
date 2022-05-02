angular.module("demo").controller("createOperatorController", function ($rootScope,$routeParams,$scope, $http, Upload) {
    $scope.isAdmin = $rootScope.isAdmin;
    $scope.previous = $routeParams.back;
    $scope.view = "view1";
    $scope.formInfo = {};
    $scope.formInfo.certificates = [];
    $scope.isValid = $scope.formInfo.name & $scope.formInfo.operator;
    $scope.eid = $routeParams.id;
    $scope.minDate =  new Date().toISOString();
    $scope.title = "ADD PILOT";
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
        // $scope.formInfo._id = $routeParams.id;
        $scope.title = "EDIT OPERATOR";
        $http.get('operator/fetch/one/'+$routeParams.id)
        .success(function(data,status){
            if(!($scope.jobTypes)){
                $scope.jobTypes = [];
                $scope.jobTypes.push(data.jobType);
                $scope.rates=[];
                $scope.rates.push(data.pilotRate);
                $scope.country = [];
                $scope.rates.push(data.country);
            }
            $scope.formInfo = data;
            console.log($scope.formInfo);
        })
        .error(function(error){
            alert(error,'There was some error in fetching data');
        })
        $scope.view = 'view2';
    }
    // $scope.profileChanged = function(){
    //     $scope.formInfo.cropedImage = $scope.croppedDataUrl;
    // };
    $scope.addCertificate = function () {
        // $scope.certificates.push($scope.row);
        $scope.formInfo.certificates.push({
            name: $scope.cname
            , expiration: $scope.cdate
        });
    };
    $scope.openView2 = function (name) {
        $scope.formInfo.companyName = name;
        $scope.view = "view2";
    };
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
    $scope.loading = false;
    $scope.submit = function () {
        if($scope.eid == 'false'){
            if ($scope.formInfo.name != null) {
                $scope.formInfo.author = {};
                $scope.formInfo.author.name = $scope.profile.name;
                $scope.formInfo.author.email = $scope.profile.email;
                $scope.formInfo.author.image = $scope.profile.image;
                $scope.loading = true;
                console.log($scope.formInfo);
                $http.post("/operator/create",$scope.formInfo)
                .success(function(data){
                    if(data=='success'){
                        location.href="#done/operator/"+$scope.formInfo.name;
                    }
                    else
                        alert($scope.formInfo.email+" email is already in use");
                    $scope.loading = false;
                })
                .error(function(data){
                    alert($scope.formInfo.email+" email is already in use");
                    $scope.loading = false;
                });
            }
            else {
                alert("please fill the name of Operator");
            }
        }
        else{
            $scope.formInfo.author = {};
            $scope.formInfo.author.name = $scope.profile.name;
            $scope.formInfo.author.email = $scope.profile.email;
            $scope.formInfo.author.image = $scope.profile.image;
            $scope.loading = true;
            console.log($scope.formInfo);
            $http.post("/operator/edit",$scope.formInfo)
            .success(function(data){
                if(data=='success'){
                    location.href="#/inventory-people";
                }
                else
                    alert($scope.formInfo.email+" email is already in use");
                $scope.loading = false;
            })
            .error(function(data){
                alert($scope.formInfo.email+" email is already in use");
                $scope.loading = false;
            });
        }
    }
    $scope.saveProfile = function () {
        $scope.formInfo.cropedImage = $scope.croppedDataUrl;
    };
    $scope.saveCompany = function () {
        $scope.formInfo.croppedCompanyLogo = $scope.croppedCompanyLogo;
    };
    $scope.changeView = function (view) {
        $scope.view = view;
    };
    $scope.upload = function (dataUrl, name) {
        Upload.upload({
            url: '/pilot/create'
            , arrayKey: ''
            , data: {
                file: Upload.dataUrltoBlob(dataUrl, "myfile")
            }
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
            });
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    }
    $http.get('job/fetch/companies')
    .success(function(data){
        $scope.companies = $.map(data, function(value, index) {
            return [value];
        });

    })
    .error(function(error){console.log(error)});



    $scope.addOptionClicked = function(id){
        if($scope.formInfo[id]=='link' && $scope.isDialog){
            $scope.catergory = id;
            $('#addModal').openModal();
        }
    }

    $http.get('options/operator/all')
    .success(function(data){
        if(data.operator && data.jobType && data.pilotRate){
            $scope.roles = data.operator;
            $scope.jobTypes = data.jobType;
            $scope.rates = data.pilotRate;
        }
    })
    .error(function(){console.log("error");})

    $scope.addClicked = function(){
        $scope.addValue = $("#addValue").val();
        if($scope.addValue){
            $http.get('options/operator/'+$scope.catergory+'/'+$scope.addValue)
            .success(function(){
                $('#addModal').closeModal();
                $http.get('options/operator/all')
                .success(function(data){
                    if(data.operator && data.jobType && data.pilotRate){
                        $scope.roles = data.operator;
                        $scope.jobTypes = data.jobType;
                        $scope.rates = data.pilotRate;
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
        $http.post('options/delete/operator/'+$scope.deleteOption.id+'/'+$scope.deleteOption.value)
        .success(function(){
            $('#deleteModal').closeModal();
            $http.get('options/operator/all')
            .success(function(data){
                if(data!='error'){
                    $scope.roles = data.operator;
                    $scope.jobTypes = data.jobType;
                    $scope.rates = data.pilotRate;
                }
            })
            .error(function(){console.log("error");})
        })
        .error(function(){
            alert("error");
        })
    };

});
