angular.module('inquiry').factory('model',
    function() {
        return {
            inquiryTypes: [
                { type: 'books', name: 'books' },
                { type: 'users', name: 'users' },
                { type: 'series', name: 'collections' }
            ],

            groupFields: {
                books: [
                    { id: 'access-type', name: 'Access Type' },
                    { id: 'state', name: 'State' },
                    { id: 'creation-year', name: 'Year' }
                ],
                users: [
                    { id: 'state', name: 'State' },
                    { id: 'type', name: 'Account Type' },
                    { id: 'source', name: 'Account Source' },
                    { id: 'plan', name: 'Publ.com Plan' },
                    { id: 'reg-year', name: 'Registration Year' },
                    { id: 'exp-year', name: 'Expiration Year' },
                    { id: 'upl-year', name: 'First Upload Year' }
                ],
                series: [
                    { id: 'creation-year', name: 'Year' }
                ]
            },

            relations: {
                books: [
                    { id: 'book-owner', rel: 'one', target: 'users', caption: 'Book owner' },
                    { id: 'book-creator', rel: 'one', target: 'users', caption: 'Book creator' },
                    { id: 'book-series', rel: 'many', target: 'series', caption: 'Containing series' }
                ],
                users: [
                    { id: 'user-books', rel: 'many', target: 'books', caption: 'Books' },
                    { id: 'user-series', rel: 'many', target: 'series', caption: 'Series' }
                ],
                series: [
                    { id: 'series-owner', rel: 'one', target: 'users', caption: 'Series owner' },
                    { id: 'series-books', rel: 'many', target: 'books', caption: 'Books' }
                ]
            },

            fields: {
                books: [
                    { id: 'name', type: 'string', caption: 'Name' },
                    { id: 'descr', type: 'string', caption: 'Description' },
                    { id: 'access-type', type: 'enum', enum: 'bookSharing', caption: 'Access type' },
                    { id: 'state', type: 'enum', enum: 'bookStatus', caption: 'State' },
                    { id: 'size', type: 'size', caption: 'Size' },
                    { id: 'pages', type: 'int', caption: 'Pages count' },
                    { id: 'views', type: 'int', caption: 'Views count' },
                    { id: 'bandwidth', type: 'size', caption: 'Total bandwidth' },
                    { id: 'creation-year', type: 'enum', enum: 'year', caption: 'Creation year' },
                    { id: 'creation-date', type: 'date', caption: 'Creation date' },
                    { id: 'edit-year', type: 'enum', enum: 'year', caption: 'Last edit year' },
                    { id: 'edit-date', type: 'date', caption: 'Last edit date' },
                    { id: 'update-count', type: 'int', caption: 'Updates count' }
                ],
                series: [
                    { id: 'name', type: 'string', caption: 'Name' },
                    { id: 'creation-year', type: 'enum', enum: 'year', caption: 'Creation year' },
                    { id: 'creation-date', type: 'date', caption: 'Creation date' },
                    { id: 'edit-year', type: 'enum', enum: 'year', caption: 'Last edit year' },
                    { id: 'edit-date', type: 'date', caption: 'Last edit date' },
                    { id: 'sharing', type: 'enum', caption: 'Sharing mode' }
                ],
                users: [
                    { id: 'name', type: 'string', caption: 'Name' },
                    { id: 'url-name', type: 'string', caption: 'URL Name' },
                    { id: 'reg-year', type: 'enum', enum: 'year', caption: 'Registration year' },
                    { id: 'reg-date', type: 'date', caption: 'Registration date' },
                    { id: 'last-act', type: 'date', caption: 'Last activity' },
                    { id: 'pay-exp', type: 'date', caption: 'Payment expiration' },
                    { id: 'traffic', type: 'size', caption: 'Traffic left' },
                    { id: 'upl-date', type: 'date', caption: 'First upload date' },
                    { id: 'upl-year', type: 'enum', enum: 'year', caption: 'First upload year' }
                ]
            },

            operators: {
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
                ],

                enum: [
                    { id: 'equals', caption: 'equals value', negCaption: 'differs from value', inputs: 1 }
                    // { id: 'inside', caption: 'is in list', negCaption: 'is not in list', inputs: 1 }
                ]
            },

            enums: {
                seriesSharing: [ 'Public', 'Subscribed' ],
                bookSharing: [ 'Password', 'Public', 'Private' ],
                bookStatus: [ 'Active', 'Trashed' ],
                year: [ '2011', '2012', '2013', '2014' ]
            }
        };
    }
);