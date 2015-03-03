/**
 * technode.js
 */
angular.module('techNodeApp', [
	'ngRoute',
  'angularMoment',
	'socketService',
	'autoScrollToBottomDirective',
	'ctrlEnterBreakLineDirective',
  'RoomsController',
	'RoomController',
	'LoginController'
])
.run(function  ($window, $rootScope, $http, $location) {

  $http({
    url: '/api/validate',
    method: 'GET'
  }).success(function  (user) {
    $rootScope.me = user;
    $location.path('/rooms');
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
  $routeProvider
  .when('/rooms', {
    templateUrl: '/pages/rooms.html',
    controller: 'RoomsCtrl'
  }).when('/rooms/:_roomId', {
    templateUrl: '/pages/room.html',
    controller: 'RoomCtrl'
  }).when('/login', {
    templateUrl: '/pages/login.html',
    controller: 'LoginCtrl'
  }).otherwise({
    redirectTo: '/login'
  });
});
