var LoginCtrl = function($scope, $http, $location, globals, endpoints) {

    if(globals.token) {
        $location.path('/main');
        return;
    }

    $scope.login = globals.login || 'tester@test.com';
    $scope.pass = '';
    $scope.hasError = false;
    $scope.working = false;

    $scope.canLogin = function() {
        return !!$scope.login && !!$scope.pass && !$scope.working;
    };

    $scope.closeError = function() {
        $scope.hasError = false;
    };

    $scope.loginCaption = function() {
        return $scope.working ? 'Working...' : 'Log in';
    };

    $scope.doLogin = function() {
        $scope.working = true;
        globals.login = $scope.login;
        var request = {
            authenticationData: {
                PlainTextPassword: $scope.pass,
                SetPersistentCookie: true
            },
            claimedIdentity: {
                Email: $scope.login
            }
        };

        $http.post(endpoints.sso + '/CombinedAuthenticate', request)
            .success(function(data, status) {
                $scope.working = false;
                $scope.hasError = !data.d.Success;
                if(data.d.Success) {
                    globals.token = data.d.Token;
                    $location.path('/main');
                } else {
                    $scope.pass = '';
                }
            });
    };
};
