var app = angular.module("myApp",[]);
var rawData;
app.controller("jobController",function($scope){
	console.log("Job");
});

app.controller('homeController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
      
  }]);
app.controller("replayController",function($scope){
	console.log("replay");
});
app.controller("profileController",function($scope){
	console.log("profile");
});
app.controller("vaultController",function($scope){
	console.log("vault");
});