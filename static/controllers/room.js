angular.module('RoomController', [
  'socketService'
])
.controller('RoomCtrl', ['$scope', '$routeParams', 'socket', function ($scope, socket) {
  _roomId = $routeParams._roomId;

  socket.emit('getAllRooms', {
    _roomId: _roomId
  });

  socket.on('roomData.' + _roomId, function  (room) {
    $scope.room = room;
  });

  socket.on('messageAdded', function (message) {
    $scope.room.messages.push(message);
  });

  socket.on('joinRoom', function  (join) {
    $scope.room.users.push(join.user);
  });



  socket.on('allMessages', function (messages) {

    $scope.messages = messages;

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
        content: $scope.newMessage,
        creator: $scope.me
      };
      socket.emit('createMessage', msgObj);
    }
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
