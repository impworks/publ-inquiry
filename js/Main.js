var MainCtrl = function ($scope, $http, $location, $modal, $sce, globals, model, tools) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }

    var htmlEnc = function(v) {
        return v.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    var wrap = function(v, tag) { return '<' + tag + '>' + htmlEnc(v) + '</' + tag + '>'; };

    var describeCondition = function(v) {
        if(v.kind == 'relation') {
            var rel = tools.First(
                model.relations[$scope.inquiryType.type],
                function(x) { return x.id == v.id; }
            );

            var cap = tools.Cap(rel.caption, false);
            return rel.rel == 'one'
                ? 'Restriction on ' + wrap(cap, 'strong') + '.'
                : 'There are ' + wrap('N', 'strong') + ' items of ' + wrap(cap, 'strong') + '.';
        } else {
            var isNeg = v.operator.substr(0, 4) == 'not-';
            if (isNeg) v.operator = v.operator.substr(4);

            var fld = tools.First(
                model.fields[$scope.inquiryType.type],
                function(x) { return v.id == x.id }
            );

            var op = tools.First(
                model.operators[fld.type],
                function(x) { return v.operator == x.id; }
            );

            var rep = wrap(fld.caption, 'strong') + ' ' + (isNeg ? op.negCaption : op.caption) + (op.inputs ? ': ' : '.');
            if(op.inputs == 1)
                rep += wrap(v.value.value, 'strong');
            else if(op.inputs == 2)
                rep += wrap(v.value.from, 'strong') + ' and ' + wrap(v.value.to, 'strong');

            return rep;
        }
    };

    $scope.conditions = [];
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

    $scope.pickCondition = function (parent) {
        var target = parent ? parent.subs : $scope.conditions;
        var inst = $modal.open({
            templateUrl: 'dlgs/books-conditions.html',
            controller: BookConditionCtrl,
            resolve: { }
        });

        inst.result.then(
            function(v) {
                v.pos = $scope.conditions.length;
                v.text = $sce.trustAsHtml(describeCondition(v));
                v.container = target;
                target.push(v);
            }
        )
    };

    $scope.hasConditions = function() {
        return $scope.conditions && $scope.conditions.length;
    };

    $scope.removeCondition = function(v) {
        var id = v.container.indexOf(v);
        v.container.splice(id, 1);
    };

    $scope.clearConditions = function () {
        $scope.conditions = [];
    };
};
