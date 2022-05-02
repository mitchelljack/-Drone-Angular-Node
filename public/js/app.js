var app = angular.module('app', [
  'ngRoute',
  'myApp'
]);
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'view/jobs.html',
        controller: 'jobController'
      }).
      when('/home', {
        templateUrl: 'view/home.html',
        controller: 'homeController'
      }).
      when('/replay', {
        templateUrl: 'view/replay.html',
        controller: 'replayController'
      }).
      when('/profile', {
        templateUrl: 'view/profile.html',
        controller: 'profileController'
      }).
      when('/vault', {
        templateUrl: 'view/vault.html',
        controller: 'vaultController'
      }).
      when('/insured-home', {
        templateUrl: 'view/insured-home.html',
        controller: 'insuredHomeController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
