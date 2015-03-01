angular.module('RoomController', [
  'socketService'
])
.controller('RoomCtrl', ['$scope', 'socket', function ($scope, socket) {

  $scope.messages = [];

  socket.emit('getAllMessages');

  socket.on('allMessages', function (messages) {

    $scope.messages = messages;

  });

  socket.on('messageAdded', function (message) {
    $scope.messages.push(message);
  });

  $scope.createMessage = function  () {
    var flag = true;
    if ($scope.messages.length > 0) {
       angular.forEach($scope.messages, function (value) {
          if(value === $scope.newMessage) {
            flag = false;
          }
       });
    }

    if(flag) {
      var msgObj = {
        message: $scope.newMessage,
        creator: $scope.me
      };
      $scope.messages.push(msgObj);
      socket.emit('createMessage', msgObj);
    }
    $scope.newMessage = '';
  };

  socket.on('roomData', function (room) {
    $scope.room = room;  
  });

  socket.emit('getRoom');

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
