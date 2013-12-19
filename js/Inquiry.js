angular.module('inquiry', [ 'ngRoute', 'ui.bootstrap', '$strap.directives' ])
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
            set login(t) { ls.login = JSON.stringify(t); },
            get savedInquiries() { return ls.savedInquiries && JSON.parse(ls.savedInquiries); },
            set savedInquiries(t) { ls.savedInquiries = JSON.stringify(t); },

            inquiryTransport: { }
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
            .when('/saved', {
                controller: 'SavedCtrl',
                templateUrl: 'saved.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .controller('GlobalCtrl', GlobalCtrl)
    .controller('LoginCtrl', LoginCtrl)
    .controller('ConditionsCtrl', ConditionsCtrl)
    .controller('SavedCtrl', SavedCtrl)
    .controller('MainCtrl', MainCtrl);