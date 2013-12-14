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

var MainCtrl = function ($scope, $http, $location, globals, model, tools) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }

    var resetList = function() {
        // reset conditions when they are
    };

    resetList();

    $scope.inquiryType = model.inquiryTypes[0];
    $scope.inquiryTypes = model.inquiryTypes;
    var groupFields = model.groupFields;

    $scope.getGroupFields = function() {
        return groupFields[$scope.inquiryType.type];
    };

    $scope.setInquiryType = function(v) {
        $scope.inquiryType = v;
        $scope.groupFields = model.groupFields[v.type];
        resetList();
    };
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
    .factory('model', function() {
        var inquiryTypes = [
            { type: 'books', name: 'books' },
            { type: 'users', name: 'users' },
            { type: 'series', name: 'collections' }
        ];

        var groupFields = {
            books: [
                { type: 'accesstype', name: 'Access type' },
                { type: 'state', name: 'State' },
                { type: 'year', name: 'Year' }
            ],
            users: [
                { type: 'state', name: 'State' },
                { type: 'quota', name: 'Publ.com Quota' },
                { type: 'regyear', name: 'Registration year' },
                { type: 'expyear', name: 'Expiration year' }
            ],
            series: [
                { type: 'year', name: 'Year' }
            ]
        };

        var getPhrase = function() {
            var phrases = [
                "I was wondering",
                "Just wondering",
                "It's good to know",
                "Tell me",
                "Answer me, o mighty machine",
                "Calculate",
                "I want to know",
                "The company must know",
                "I'm curious to know",
                "I'm dying to know"
            ];
            return phrases[Math.floor(Math.random() * phrases.length)];
        };

        return {
            inquiryTypes: inquiryTypes,
            groupFields: groupFields,
            getPhrase: getPhrase
        };
    })
    .service('tools', function() {
        var find = function(arr, cnd) {
            if(arr && arr.length) {
                for(var i = 0; i < arr.length; i++) {
                    var curr = arr[i];
                    if(cnd(curr))
                        return { item: curr, index: i };
                }
            }

            return { item: undefined, index: undefined };
        };

        this.First = function(arr, cnd) {
            return find(arr, cnd).item;
        };

        this.FirstId = function(arr, cnd) {
            return find(arr, cnd).index;
        };

        this.Select = function(arr, map) {
            var result = [];
            if(arr && arr.length)
                for(var i = 0; i < arr.length; i++)
                    result.push(map(arr[i]));
            return result;
        };

        this.Contains = function(arr, cnd) {
            return typeof find(arr, cnd).index !== 'undefined';
        };

        this.Except = function(arr, cnd) {
            return arr.filter(function(v) { return !cnd(v); });
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