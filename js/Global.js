var GlobalCtrl = function($scope, $location, globals) {

    $scope.isLoggedIn = function () {
        return !!globals.token;
    };

    $scope.logout = function() {
        globals.token = false;
        $location.path('/');
    };
};