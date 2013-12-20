var GlobalCtrl = function GlobalCtrl($scope, $location, globals) {

    $scope.$on('saved-increment', function() { $scope.savedCount++; });
    $scope.$on('saved-reset', function () { $scope.savedCount = 0; });

    $scope.savedCount = 0;
    $scope.showSaved = function () {
        return $scope.savedCount > 0;
    };

    $scope.isLoggedIn = function () {
        return !!globals.token;
    };

    $scope.logout = function() {
        globals.token = false;
        $location.path('/');
    };
};