angular.module('inquiry', [ 'ngRoute', 'ui.bootstrap', '$strap.directives' ])
    .constant('endpoints', {
        publ: 'http://sso-publ.local/Services/Admin.asmx',
        sso : 'https://logon.flippingbook.com/SSOThinClient.asmx'
    })
    .factory('globals', function(tools) {
        var ls = window['localStorage'];
        var self = {
            get token() { return ls.token && JSON.parse(ls.token); },
            set token(t) { ls.token = JSON.stringify(t); },
            get login() { return ls.login && JSON.parse(ls.login); },
            set login(t) { ls.login = JSON.stringify(t); },
            get savedInquiries() { return ls.savedInquiries && JSON.parse(ls.savedInquiries); },

            saveInquiry: function(v) {
                var inq = self.savedInquiries;
                if(inq) inq.push(v); else inq = [v];
                ls.savedInquiries = JSON.stringify(inq);
            },

            removeInquiry: function(v) {
                var inq = self.savedInquiries;
                tools.Remove(inq, v);
                ls.savedInquiries = JSON.stringify(inq);
            },

            inquiryToLoad: false
        };
        return self;
    })
    .config(function($routeProvider, $tooltipProvider) {
        $tooltipProvider.options({appendToBody: true});

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