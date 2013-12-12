var MainCtrl = function($scope, $http, endpoints) {

    var token = false;

    $scope.login = 'tester@test.com';
    $scope.pass = '';
    $scope.loginError = false;

    // checks if the user is logged in
    $scope.showLogin = function() {
        return !token || $scope.loginError;
    };

    // attempts login
    $scope.doLogin = function() {

        var request = {
            claimedIdentity: {
                Email: $scope.login,
                authenticationData:{
                    PlainTextPassword: $scope.pass,
                    SetPersistentCookie: true
                }
            }
        };

        $http.post(endpoints.sso + '/CombinedAuthenticate', request)
            .success(function(data, status) {
                $scope.loginError = data.d.Success;
                if(data.d.Success)
                    token = data.d.Token;
            })
            .error(function(data, status) {
                $scope.loginError = true;
            });
    };
};

angular.module('inquiry')
    .var('endpoints',
        {
            publ : 'http://publ.com/Services/Admin.asmx',
            sso : 'https://logon.flippingbook.com/SSOThinClient.asmx'
        })
    .controller('MainCtrl', [ '$scope', '$http', 'endpoints', MainCtrl ]);