var MainCtrl = function ($scope, $http, $location, $modal, $sce, globals, model, tools) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }

    var resetList = function() {
        $scope.conditions = [];
    };

    var wrap = function(v, tag) { return '<' + tag + '>' + v + '</' + tag + '>'; };

    var describeCondition = function(v) {
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

    $scope.pickCondition = function () {
        var inst = $modal.open({
            templateUrl: 'dlgs/books-conditions.html',
            controller: BookConditionCtrl,
            resolve: { }
        });

        inst.result.then(
            function(v) {
                v.pos = $scope.conditions.length;
                v.text = $sce.trustAsHtml(describeCondition(v));
                $scope.conditions.push(v);
            }
        )
    };

    $scope.hasConditions = function() {
        return $scope.conditions && $scope.conditions.length;
    };

    $scope.removeCondition = function(v) {
        var id = tools.FirstId(
            $scope.conditions,
            function(x) { return x.pos == v.pos; }
        );
        $scope.conditions.splice(id, 1);
    };
};
