angular.module("demo").controller("doneController",function($scope,$routeParams){
	$scope.category = $routeParams.category;
	$scope.id = $routeParams.id;
});