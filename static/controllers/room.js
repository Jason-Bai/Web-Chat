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
      $scope.messages.push($scope.newMessage);
      socket.emit('createMessage', $scope.newMessage);
    }
    $scope.newMessage = '';
  };
}]);