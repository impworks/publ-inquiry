var LoginCtrl = function($scope, $http, $location, globals, endpoints) {

    if(globals.token && globals.token != 'invalid') {
        $location.path('/main');
        return;
    }

    $scope.login = globals.login || 'tester@test.com';
    $scope.pass = '';
    $scope.working = false;
    $scope.error = false;

    if(globals.token == 'invalid')
        $scope.error = 'Your access token has expired. Please relogin!';

    $scope.canLogin = function() {
        return !!$scope.login && !!$scope.pass && !$scope.working;
    };

    $scope.closeError = function() {
        $scope.error = false;
    };

    $scope.loginCaption = function() {
        return $scope.working ? 'Working...' : 'Log in';
    };

    $scope.doLogin = function() {
        $scope.working = true;
        $scope.error = false;
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
                if(data.d.Success) {
                    globals.token = data.d.Token;
                    $location.path('/main');
                } else {
                    $scope.pass = '';
                    $scope.error = 'Looks like your password is incorrect.';
                }
            });
    };
};
