angular.module("demo").controller("profileController", function ($scope,$rootScope,$timeout, $http) {
    $(".button-collapse").sideNav();
    $("#sideNavProfile").toggleClass("sideNavSelected");
    $scope.$on('$destroy', function iVeBeenDismissed() {
        $("#sideNavProfile").toggleClass("sideNavSelected");
    });
    $scope.isAdmin = $rootScope.isAdmin;
    $scope.loading = false;
    $scope.braintreePlans = [];
    $scope.profile = {}
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

    $scope.getProfile =function() {
      $scope.loading = true;
      $http.get('users/profile')
  		.success(function(data) {
        data.oldpassword="";
        data.newpassword="";
        data.croppedDataUrl = data.croppedDataUrl?data.croppedDataUrl:"";
        data.creditCardNumber = data.creditCardNumber?data.creditCardNumber:"";
  			$scope.profile = data;
        $scope.profile.creditCardNumber1 = "xxxxxxxxxxxx" + $scope.profile.creditCardNumber.toString().slice(-4)
        $scope.profile.securityCode1 = "xxx"
        $scope.loading = false;
        $("#expire_month").val($scope.profile.expire_month);
        $("#expire_year").val($scope.profile.expire_year);
        $("select").material_select();
        $http.post('api/v1/braintree/plans')
    		.success(function(data) {
          $scope.braintreePlans = data.plans;
    		})
    		.error(function(error){
    			alert('Error fetching braintree plan data');
    		});
  		})
  		.error(function(error){
  			alert('Error fetching data');
        $scope.loading = false;
  		});
    }

    // $scope.validate = function(){
    //   if($scope.profile.newpassword && (!$scope.profile.oldpassword || $scope.profile.newpassword == $scope.profile.password))
    //       return false;
    // 	return $scope.profile.name && $scope.profile.email && $scope.profile.oldpassword && $scope.profile.oldpassword == $scope.profile.password;
    // };

    $scope.accountValidate = function(){
    	return $scope.profile.firstname && $scope.profile.lastname && $scope.profile.phoneNumber && $scope.profile.zipcode && $scope.profile.country && $scope.profile.state && $scope.profile.address && $scope.profile.city;
    };

    $scope.accountSubmit = function() {
      $scope.loading = true;
      var data = $scope.profile;
      delete data.newpassword;
      delete data.oldpassword;
      $http.post("/operator/edit", data)
        .success(function(data,status){
          location.reload();
        })
        .error(function(data,status){
          alert("Server Error");
          $scope.loading = false;
        });
    }
    $scope.resetPassword = function() {
        $scope.loading = true;
        $http.get('users/reset/add/'+$scope.profile.email)
        .success(function(data,status){
          alert('Please check your email for a reset password link');
          $scope.loading = false;
        })
        .error(function(data,status){
          alert("Server Error");
          $scope.loading = false;
        });
    }

    $scope.submit = function(){
      $scope.loading = true;
      var data = $scope.profile;
      data.password = data.newpassword?data.newpassword:data.password;
      delete data.newpassword;
      delete data.oldpassword;
      $http.post("/operator/edit", data)
        .success(function(data,status){
          location.reload();
        })
        .error(function(data,status){
          alert("Server Error");
          $scope.loading = false;
        });
    }

    $scope.getProfile();
    //billing info tab

    $scope.message = 'Please use the form below to pay:';
    $scope.isError = false;
    $scope.isPaid = false;
    $scope.showForm = true;

    // $scope.profile.creditCardNumber =4111111111111111;
    // $scope.expirationDate = "2/17";
    // $scope.amount = 10;

    $scope.updatePayment = function () {
      $scope.loading = true;

      $scope.profile.creditCardNumber = $scope.profile.creditCardNumber1.indexOf("x")<0?$scope.profile.creditCardNumber1:$scope.profile.creditCardNumber
      $scope.profile.securityCode = $scope.profile.securityCode1.indexOf("x")<0?$scope.profile.securityCode1:$scope.profile.securityCode

      // $scope.message = 'Processing payment...';
      // $scope.showForm = false;

      // send request to get token, then use the token to tokenize credit card info and process a transaction
      $http({
        method: 'POST',
        url: 'api/v1/braintree/getToken'
      }).success(function (data) {
        // create new client and tokenize card
        var client = new braintree.api.Client({clientToken: data.client_token});
        client.tokenizeCard({
          number: $scope.profile.creditCardNumber,
          expirationDate: $scope.profile.expire_month+'/'+$scope.profile.expire_year
        }, function (err, nonce) {
          if(err) {
              alert('Payment information is not valid');
              $scope.loading = false;
              return;
          }

          $http({
            method: 'POST',
            url: 'api/v1/braintree/paymentMethod',
            data: {
              customerId: $scope.profile.customerId,
              payment_method_nonce: nonce
            }
          }).success(function (paymentMethod) {
            console.log(paymentMethod);
            if(paymentMethod.success) {
                var price = 0;
                for(var i = 0; i < $scope.braintreePlans.length; i++)
                  if($scope.braintreePlans[i].id==$scope.profile.pa_plans) {
                    price = $scope.braintreePlans[i].price;
                    break;
                  }
                $http({
                  method: 'POST',
                  url: 'api/v1/braintree/update-subscription',
                  data: {
                    subscriptionid: $scope.profile.subscriptionId,
                    price: price,
                    planid: $scope.profile.pa_plans,
                    paymentMethodToken: paymentMethod.paymentMethod.token
                  }
                }).success(function (subscription) {
                  if(subscription.success)
                    $scope.accountSubmit();
                }).error(function(error) {})
            } else {
              alert(paymentMethod.message);
              $scope.loading = false;
            }
          }).error(function(error) {})

        });

      }).error(function (error) {
        $scope.message = 'Error: cannot connect to server. Please make sure your server is running.';
        $scope.isError = true;
        $scope.showForm = false;
        $scope.loading = false;
      });

    };
});
