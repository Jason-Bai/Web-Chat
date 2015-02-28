/**
 * technode.js
 */
angular.module('techNodeApp', [
	'ngRoute',
	'socketService',
	'autoScrollToBottomDirective',
	'ctrlEnterBreakLineDirective',
	'RoomController',
	'LoginController']
)
.run(function  ($window, $rootScope, $http, $location) {

  $http({
    url: '/api/validate',
    method: 'GET'
  }).success(function  (user) {
    $rootScope.me = user;
    $location.path('/');
  }).error(function  (data) {
    $location.path('/login');
  });

  $rootScope.logout = function  () {
    $http({
      url: '/api/logout',
      method: 'GET'
    }).success(function  () {
      $rootScope.me = null;
      $location.path('/login');
    });
  };
  $rootScope.$on('login', function  (evt, me) {
    $rootScope.me = me;
  });
})
.config(function  ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.when('/', {
    templateUrl: '/pages/room.html',
    controller: 'RoomCtrl'
  }).when('/login', {
    templateUrl: '/pages/login.html',
    controller: 'LoginCtrl'
  }).otherwise({
    redirectTo: '/login'
  });
});