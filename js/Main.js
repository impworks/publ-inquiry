var MainCtrl = function ($scope, $http, $location, $modal, $sce, $rootScope, globals, model, tools) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }

    var describeCondition = function(v, dataType) {
        dataType = dataType || $scope.inquiryType.type;
        if(v.kind == 'relation') {
            var rel = tools.First(
                model.relations[dataType],
                function(x) { return x.id == v.id; }
            );

            var cap = tools.Cap(rel.caption, false);
            return rel.rel == 'one'
                ? 'Restriction on ' + tools.Wrap(cap, 'strong') + ':'
                : 'There are ' + tools.Wrap('N', 'tt') + ' items of ' + tools.Wrap(cap, 'strong');
        } else {
            var isNeg = v.operator.substr(0, 4) == 'not-';
            if (isNeg) v.operator = v.operator.substr(4);

            var fld = tools.First(
                model.fields[dataType],
                function(x) { return v.id == x.id }
            );

            var op = tools.First(
                model.operators[fld.type],
                function(x) { return v.operator == x.id; }
            );

            var getValue = function(kind) {
                var res = v.value[kind];
                if(fld.type == 'string') res = '"' + res + '"';
                return tools.Wrap(res, 'tt');
            };

            var rep = tools.Wrap(fld.caption, 'strong') + ' ' + (isNeg ? op.negCaption : op.caption) + (op.inputs ? ': ' : '');
            if(op.inputs == 1)
                rep += getValue('value');
            else if(op.inputs == 2)
                rep += getValue('from') + ' and ' + getValue('to');

            return rep;
        }
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
        $scope.conditions = [];
        $scope.inquiryType = model.inquiryTypes[0];
        $scope.groupFields = angular.copy(model.groupFields[$scope.inquiryType.type]);
    };

    $scope.setInquiryType = function(v) {
        $scope.inquiryType = v;
        $scope.groupFields = model.groupFields[v.type];
        $scope.clearConditions();
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

    var loadInquiry = function(v) {
        if(!globals.inquiryToLoad) return;

        var inq = globals.inquiryToLoad.value;
        wakeUp(inq.conditions, inq.type.type);

        $scope.conditions = inq.conditions;
        $scope.inquiryType = inq.type;
        $scope.groupFields = inq.group;

        globals.inquiryToLoad = false;
    };

    var saveInquiry = function() {
        hibernate($scope.conditions);
        globals.saveInquiry({
            caption: $scope.saveInfo.name,
            date: new Date(),
            value: {
                conditions: $scope.conditions,
                type: $scope.inquiryType,
                group: $scope.groupFields
            }
        });
        wakeUp($scope.conditions, $scope.inquiryType.type);
    };

    $scope.saveInfo = { name: '' };

    $scope.canSave = function() {
        return !!$scope.saveInfo.name;
    };

    $scope.save = function () {
        if(!$scope.canSave())
            return;

        saveInquiry();

        $('.popover.in').popover('hide');
        $rootScope.$broadcast('saved-increment');
    };
};
