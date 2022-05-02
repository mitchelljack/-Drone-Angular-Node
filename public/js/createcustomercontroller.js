angular.module("demo").controller("createCustomerController",function($rootScope,$scope,$http,$routeParams){
    $scope.previous = $routeParams.back;
	  $scope.view = 'view1';
    $scope.loading = false;

    $http.get('users/profile')
    .success(function(data) {
        $scope.profile = data;
        console.log($scope.profile);
    })
    .error(function(error){
      alert('Error fetching data');
      $scope.loading = false;
    });

    $scope.submit = function(){
        $scope.formInfo.operator = {};
        $scope.formInfo.operator.name = $scope.profile.name;
        $scope.formInfo.operator.email = $scope.profile.email;
        $scope.formInfo.operator.image = $scope.profile.image;
        $scope.loading = true;
        $http.post('/customer/create',$scope.formInfo)
        .success(function(data){
            if(data=='success')
                location.href="#/"+$scope.previous;
            else{
                alert("Error in Insertion");
            }
            $scope.loading = false;
        })
        .error(function(data){
            console.log("data");
            $scope.loading = false;
        });
    };
    $scope.formInfo = {};
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
});
