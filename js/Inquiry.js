angular.module('inquiry', [ 'ngRoute', 'ui.bootstrap' ])
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
                { type: 'access-type', name: 'Access type' },
                { type: 'state', name: 'State' },
                { type: 'year', name: 'Year' }
            ],
            users: [
                { type: 'state', name: 'State' },
                { type: 'quota', name: 'Publ.com Quota' },
                { type: 'reg-year', name: 'Registration year' },
                { type: 'exp-year', name: 'Expiration year' }
            ],
            series: [
                { type: 'year', name: 'Year' }
            ]
        };

        var relations = {
            books: [
                { id: 'book-owner', rel: 'one', caption: 'Book owner' },
                { id: 'book-creator', rel: 'one', caption: 'Book creator' },
                { id: 'book-series', rel: 'many', caption: 'Containing series' }
            ],
            users: [
                { id: 'user-books', rel: 'many', caption: 'Books' },
                { id: 'user-series', rel: 'many', caption: 'Series' }
            ],
            series: [
                { id: 'series-owner', rel: 'one', caption: 'Series owner' },
                { id: 'series-books', rel: 'many', caption: 'Books' },
            ]
        };

        var fields = {
            books: [
                { id: 'name', type: 'string', caption: 'Name' },
                { id: 'descr', type: 'string', caption: 'Description' },
                { id: 'access-type', type: 'string', caption: 'Access type' },
                { id: 'state', type: 'string', caption: 'State' },
                { id: 'size', type: 'size', caption: 'Size' },
                { id: 'bandwidth', type: 'size', caption: 'Total bandwidth' },
                { id: 'creation-year', type: 'int', caption: 'Creation year' },
                { id: 'creation-date', type: 'date', caption: 'Creation date' },
                { id: 'edit-year', type: 'int', caption: 'Last edit year' },
                { id: 'edit-date', type: 'date', caption: 'Last edit date' },
                { id: 'update-count', type: 'int', caption: 'Updates count' }
            ]
            // todo: users, series
        };

        var operators = {
            string: [
                { id: 'equals', caption: 'equals value', negCaption: 'differs from value', inputs: 1 },
                { id: 'contains', caption: 'contains substring', negCaption: 'does not contain substring', inputs: 1 },
                { id: 'null', caption: 'is set', negCaption: 'is unset', inputs: 0 }
            ],

            int: [
                { id: 'equals', caption: 'equals value', negCaption: 'differs from value', inputs: 1 },
                { id: 'greater', caption: 'is greater than value', negCaption: 'is less than value', inputs: 1 },
                { id: 'between', caption: 'is inside range', negCaption: 'is outside range', inputs: 2 },
                { id: 'null', caption: 'is set', negCaption: 'is unset', inputs: 0 }
            ],

            size: [
                { id: 'between', caption: 'is inside range', negCaption: 'is outside range', inputs: 2 },
                { id: 'greater', caption: 'is greater than value', negCaption: 'is less than value', inputs: 1 }
            ],

            date: [
                { id: 'between', caption: 'is inside range', negCaption: 'is outside range', inputs: 2 },
                { id: 'equals', caption: 'equals value', negCaption: 'differs from value', inputs: 1 },
                { id: 'greater', caption: 'is after value', negCaption: 'is before value', inputs: 1 },
                { id: 'null', caption: 'is set', negCaption: 'is unset', inputs: 0 }
            ],

            bool: [
                { id: 'true', caption: 'is true', negCaption: 'is false', inputs: 0 },
                { id: 'null', caption: 'is set', negCaption: 'is unset', inputs: 0 }
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
            getPhrase: getPhrase,
            relations: relations,
            fields: fields,
            operators: operators
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

        this.SelectMany = function(arr, map) {
            var result = [];
            if(arr && arr.length) {
                for(var i = 0; i < arr.length; i++) {
                    var curr = map(arr[i]);
                    if(!curr || !curr.length)
                        continue;
                    for(var j = 0; j < curr.length; j++)
                        result.push(curr[j]);
                }
            }
            return result;
        };

        this.Contains = function(arr, cnd) {
            return typeof find(arr, cnd).index !== 'undefined';
        };

        this.Except = function(arr, cnd) {
            return arr.filter(function(v) { return !cnd(v); });
        };

        this.Split = function(arr, parts) {
            if(!arr || !arr.length || !parts)
                return undefined;

            var res = [];
            for(var i = 0; i < arr.length; i++) {
                var k = i % parts;
                if(res.length - 1 < k)
                    res.push([arr[i]]);
                else
                    res[k].push(arr[i]);
            }
            return res;
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
    .controller('BookConditionCtrl', BookConditionCtrl)
    .controller('MainCtrl', MainCtrl);