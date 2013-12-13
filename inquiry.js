var GlobalCtrl = function($scope, $location, globals) {

    $scope.isLoggedIn = function () {
        return !!globals.token;
    };

    $scope.logout = function() {
        globals.token = false;
        $location.path('/');
    };
};

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

var MainCtrl = function ($scope, $http, $location, globals) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }
};

angular.module('inquiry', [ 'ngRoute' ])
    .constant('endpoints', {
        publ: 'http://publ.com/Services/Admin.asmx',
        sso : 'https://logon.flippingbook.com/SSOThinClient.asmx'
    })
    .factory('globals', function() {
        var ls = window['localStorage'];
        return {
            get token() { return ls.token && JSON.parse(ls.token); },
            set token(t) { ls.token = JSON.stringify(t); },
            get login() { return ls.login && JSON.parse(ls.login); },
            set login(t) { ls.login = JSON.stringify(t); }
        };
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
    .controller('GlobalCtrl', GlobalCtrl)
    .controller('LoginCtrl', LoginCtrl)
    .controller('MainCtrl', MainCtrl);