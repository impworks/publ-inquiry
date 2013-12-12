var mainCtrl = function($scope, $http) {

    var token = false;

    $scope.login = 'tester@test.com';
    $scope.pass = '';

    // checks if the user is logged in
    $scope.showLogin = function() {
        return !token;
    };

    // attemps login
    $scope.doLogin = function() {

    };
};

angular.module('inquiry')
       .controller('MainCtrl', [ '$scope', '$http', mainCtrl ]);