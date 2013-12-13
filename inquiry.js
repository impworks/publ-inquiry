var LoginCtrl = function($scope, $http, endpoints) {

    $scope.login = 'tester@test.com';
    $scope.pass = '';
    $scope.hasError = false;
    $scope.working = false;

    // checks if the user is logged in
    $scope.showLogin = function() {
        return !$scope.token || $scope.hasError;
    };

    // checks if the form has been filled in
    $scope.canLogIn = function() {
        return !!$scope.login && !!$scope.pass && !$scope.working;
    }

    // closes error message
    $scope.closeError = function() {
        $scope.hasError = false;
    };

    // gets the caption for login button
    $scope.loginCaption = function() {
        return $scope.working ? 'Working...' : 'Log in';
    };

    // attempts login
    $scope.doLogin = function() {
        $scope.working = true;
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
                if(data.d.Success)
                    $scope.token = data.d.Token;
            });
    };
};

angular.module('inquiry', [])
    .value('endpoints', {
        publ: 'http://publ.com/Services/Admin.asmx',
        sso : 'https://logon.flippingbook.com/SSOThinClient.asmx'
    })
    .controller('LoginCtrl', [ '$scope', '$http', 'endpoints', LoginCtrl ]);