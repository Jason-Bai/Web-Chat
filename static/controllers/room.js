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

  $scope.$on('$routeChangeStart', function  () {
    socket.emit('leaveRoom', {
      user: $scope.me,
      room: $scope.room
    });
  });

  socket.on('leaveRoom', function  (leave) {
    _userId = leave.user._id;
    $scope.room.users = $scope.room.users.filter(function  (user) {
      return user._id != _userId;
    });
  });
}]);
