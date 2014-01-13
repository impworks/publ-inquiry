var MainCtrl = function ($scope, $http, $location, $modal, $sce, $rootScope, globals, model, tools, endpoints) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }

    var describeCondition = function(v, dataType) {
        dataType = dataType || $scope.inquiryType.type;

        var getValue = function(kind, mustQuote) {
            var res = v.value[kind];
            if(mustQuote) res = '"' + res + '"';
            return tools.Wrap(res, 'tt');
        };
        var op, rep;

        if(v.kind == 'relation') {
            var rel = tools.First(
                model.relations[dataType],
                function(x) { return x.id == v.id; }
            );

            var cap = tools.Cap(rel.caption, false);
            if(rel.rel == 'one')
                return 'Restriction on ' + tools.Wrap(cap, 'strong') + ':';

            op = tools.First(
                model.operators['int'],
                function(x) { return v.operator == x.id; }
            );

            rep = 'The number of ' + tools.Wrap(cap, 'strong') + ' ' + (isNeg ? op.negCaption : op.caption) + (op.inputs ? ': ' : '');
            if(op.inputs == 1)
                rep += getValue('value');
            else if(op.inputs == 2)
                rep += getValue('from') + ' and ' + getValue('to');
        } else {
            var isNeg = v.operator.substr(0, 4) == 'not-';
            if (isNeg) v.operator = v.operator.substr(4);

            var fld = tools.First(
                model.fields[dataType],
                function(x) { return v.id == x.id }
            );

            op = tools.First(
                model.operators[fld.type],
                function(x) { return v.operator == x.id; }
            );

            var quote = fld.type == 'string';
            rep = tools.Wrap(fld.caption, 'strong') + ' ' + (isNeg ? op.negCaption : op.caption) + (op.inputs ? ': ' : '');
            if(op.inputs == 1)
                rep += getValue('value', quote);
            else if(op.inputs == 2)
                rep += getValue('from', quote) + ' and ' + getValue('to', quote);
        }

        return rep;
    };

    var wakeUp = function(list, dataType) {
        if(!list || !list.length) return;
        for(var i = 0; i < list.length; i++) {
            var curr = list[i];
            curr.container = list;
            curr.text = $sce.trustAsHtml(describeCondition(curr, dataType));
            if(curr.kind == 'relation')
                wakeUp(curr.subs, curr.target);
        }
    };

    var hibernate = function(list) {
        if(!list || !list.length) return;
        for(var i = 0; i < list.length; i++) {
            var curr = list[i];
            delete curr.container;
            delete curr.text;
            if(curr.subs) hibernate(curr.subs);
        }
    };

    var withHibernated = function(fx) {
        hibernate($scope.conditions);
        fx();
        wakeUp($scope.conditions, $scope.inquiryType.type);
    };

    var loadInquiry = function(v) {
        if(!globals.inquiryToLoad) return;

        var inq = globals.inquiryToLoad.value;
        wakeUp(inq.conditions, inq.type.type);

        $scope.conditions = inq.conditions;
        $scope.inquiryType = inq.type;
        $scope.groupFields = inq.group;

        globals.inquiryToLoad = false;
    };

    var saveInquiry = function(caption) {
        withHibernated(function() {
            globals.saveInquiry({
                caption: caption,
                date: new Date(),
                value: {
                    conditions: $scope.conditions,
                    type: $scope.inquiryType,
                    group: $scope.groupFields
                }
            });

            $rootScope.$broadcast('saved-increment');
        });
    };

    $scope.inquiryTypes = model.inquiryTypes;
    if(globals.inquiryToLoad) {
        loadInquiry(globals.inquiryToLoad);
    } else {
        $scope.conditions = [];
        $scope.inquiryType = model.inquiryTypes[0];
        $scope.groupFields = angular.copy(model.groupFields[$scope.inquiryType.type]);
    }

    $scope.showWhere = function(v) {
        return v.kind == 'relation'
               && (v.isHovered || !v.subs || !v.subs.length);
    };

    $scope.clear = function () {
        $scope.inquiryResult = false;
        $scope.conditions = [];
        $scope.inquiryType = model.inquiryTypes[0];
        $scope.groupFields = angular.copy(model.groupFields[$scope.inquiryType.type]);
    };

    $scope.setInquiryType = function(v) {
        $scope.inquiryType = v;
        $scope.groupFields = model.groupFields[v.type];
        $scope.clearConditions();
        $scope.inquiryResult = false;
    };

    $scope.pickCondition = function (parent) {
        var target = parent ? parent.subs : $scope.conditions;
        var dataType = parent ? parent.target : $scope.inquiryType.type;
        var inst = $modal.open({
            templateUrl: 'conditions.html',
            controller: ConditionsCtrl,
            resolve: { dataType: function() { return dataType; } }
        });

        inst.result.then(
            function(v) {
                v.pos = $scope.conditions.length;
                v.text = $sce.trustAsHtml(describeCondition(v, dataType));
                v.container = target;
                v.isHovered = false;
                target.push(v);
            }
        )
    };

    $scope.hasConditions = function() {
        return $scope.conditions && $scope.conditions.length;
    };

    $scope.removeCondition = function(v) {
        tools.Remove(v.container, v);
    };

    $scope.clearConditions = function () {
        $scope.conditions = [];
    };

    /**
     * Saving & loading
     */

    $scope.saveInfo = { name: '' };

    $scope.canSave = function() {
        return !!$scope.saveInfo.name;
    };

    $scope.save = function () {
        if(!$scope.canSave())
            return;

        saveInquiry($scope.saveInfo.name);

        $('.popover.in').popover('hide');
    };

    /**
     * Send & receive to server
     */

    var getConditionsForRequest = function () {
        var process = function(src, target) {
            for(var i = 0; i < src.length; i++) {
                var curr = src[i];
                var cond = {
                    kind: curr.kind,
                    id: curr.id,
                    operator: curr.operator
                };

                if(!!curr.value) {
                    cond.value = curr.value.value;
                    cond.from = curr.value.from;
                    cond.to = curr.value.to;
                }

                if(curr.kind == 'relation' && curr.subs && curr.subs.length) {
                    cond.subs = [];
                    process(curr.subs, cond.subs);
                }

                target.push(cond);
            }
        };

        var conditions = [];
        process($scope.conditions, conditions);
        return conditions;
    };

    var getRequest = function () {
        var groups = tools.Select(
            $scope.groupFields.filter( function (x) { return !!x.selected; }),
            function (x) { return x.id }
        );

        return {
            Token: { Value: globals.token.Value },
            InquiryType: $scope.inquiryType.type,
            Groups: groups,
            Conditions: getConditionsForRequest()
        };
    };

    $scope.inquireCaption = function () {
        return $scope.isSending ? 'Working...' : 'Show me!';
    };

    $scope.inquire = function () {
        $scope.isSending = true;
        $scope.inquiryResult = false;

        var req = { request: getRequest() };
        $http.post(endpoints.publ + '/GetInquiryResult', req)
            .success(function(v) {
                $scope.inquiryResult = v.d;
                $scope.isSending = false;
            })
            .error(function() {
                $scope.inquiryResult = { Success: false, ErrorMessage: 'Network error!' };
                saveInquiry('error @ ' + new Date().format('yyyy/MM/dd'));
                $scope.isSending = false;
            });
    };
};
