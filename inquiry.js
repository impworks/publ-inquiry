var LoginCtrl = function($scope, $http, $location, globals, endpoints) {

    if(globals.token) {
        $location.path('/main');
        return;
    }

    $scope.login = 'tester@test.com';
    $scope.pass = '';
    $scope.hasError = false;
    $scope.working = false;

    // checks if the form has been filled in
    $scope.canLogIn = function() {
        return !!$scope.login && !!$scope.pass && !$scope.working;
    };

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
                if(data.d.Success) {
                    globals.token = data.d.Token;
                    $location.path('/main');
                }
            });
    };
};

var MainCtrl = function ($scope, $http, $location, globals) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }
};

angular.module('inquiry', [ 'ngRoute' ])
    .value('endpoints', {
        publ: 'http://publ.com/Services/Admin.asmx',
        sso : 'https://logon.flippingbook.com/SSOThinClient.asmx'
    })
    .value('globals', {
        token : ''
    })
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'LoginCtrl',
                templateUrl: 'login.html'
            })
            .when('/main', {
                controller: 'MainCtrl',
                templateUrl: 'main.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .controller('LoginCtrl', LoginCtrl)
    .controller('MainCtrl', MainCtrl);