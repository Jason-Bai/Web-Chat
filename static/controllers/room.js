angular.module('RoomController', [
  'ngRoute',
  'socketService'
])
.controller('RoomCtrl', ['$scope', '$routeParams', 'socket', function ($scope, $routeParams, socket) {
  socket.emit('getAllRooms', {
    _roomId: $routeParams._roomId
  });

  socket.on('roomData.' + $routeParams._roomId, function  (room) {
    $scope.room = room;
  });

  socket.on('messageAdded', function (message) {
    $scope.room.messages.push(message);
  });

  socket.on('joinRoom', function  (join) {
    $scope.room.users.push(join.user);
  });

  $scope.createMessage = function  () {
    socket.emit('createMessage', {
      content: $scope.newMessage,
      creator: $scope.me,
      _roomId: $routeParams._roomId
    });
    $scope.newMessage = '';
  };

  socket.on('online', function (user) {
    $scope.room.users.push(user);
  });

  socket.on('offline', function (user) {
    _userId = user._userId;
    $scope.room.users = $scope.room.users.filter(function (user) {
        return user._id != _userId;
    });
  });
}]);
