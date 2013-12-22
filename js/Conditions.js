var ConditionsCtrl = function ($scope, $modalInstance, model, tools, focus, dataType) {

    var getType = function () {
        return $scope.field ? $scope.field.type : 'int';
    };

    var validateCondition = function(value) {
        if(!$scope.field && !$scope.relation)
            return false;

        var type = getType();
        if(type == 'int') return !isNaN(value);
        if(type == 'size') return tools.ParseSize(value) > 0;
        return !!value;
    };

    var typeEquals = function(type, value) {
        if(type == value) return true;
        if(value == 'basic' && ['date', 'enum'].indexOf(getType()) == -1) return true;
        return false;
    };

    var updateFocus = function () {
        var type = getType();
        var key = type == 'date' ? 'date' : 'basic' + '-' + $scope.operator.inputs;
        focus(key);
    };

    var setOperators = function(type) {
        $scope.operators = tools.SelectMany(
            model.operators[type],
            function(v) {
                return [
                    { id: v.id, caption: v.caption, inputs: v.inputs },
                    { id: 'not-' + v.id, caption: v.negCaption, inputs: v.inputs }
                ];
            }
        );

        $scope.operator = $scope.operators[0];
        updateFocus();
    };

    $scope.caption = tools.Cap(dataType) + ' conditions';
    $scope.condFields = tools.Split(model.fields[dataType], 3);
    $scope.condRelations = tools.Split(model.relations[dataType], 3);
    $scope.field = false;
    $scope.relation = false;
    $scope.value = {};

    $scope.unselect = function () {
        $scope.field = $scope.relation = false;
    };

    $scope.selectField = function(v) {
        $scope.field = v;
        setOperators(v.type);
    };

    $scope.selectRelation = function(v) {
        if(v.rel == 'many') {
            $scope.relation = v;
            setOperators('int');
        } else {
            $modalInstance.close({
                kind: 'relation',
                rel: v.rel,
                id: v.id,
                target: v.target,
                subs: []
            });
        }
    };

    $scope.setOperator = function(v) {
        $scope.operator = v;
        updateFocus();
    };

    $scope.inputCount = function(v) {
        return $scope.operator && $scope.operator.inputs == v;
    };

    $scope.inputType = function(v) {
        if(!$scope.field && !$scope.relation) return undefined;
        var type = getType();
        return typeEquals(type, v);
    };

    $scope.showDetails = function () {
        return !!$scope.field || !!$scope.relation;
    };

    $scope.getEnumValues = function () {
        if(!$scope.field || $scope.field.type != 'enum') return [];
        return model.enums[$scope.field.enum];
    };

    $scope.getCaption = function () {
        if(!$scope.field && !$scope.relation)
            return '';

        return $scope.field
            ? $scope.field.caption
            : 'The number of ' + tools.Cap($scope.relation.caption, false);
    };

    $scope.canSave = function() {
        if(!$scope.field && !$scope.relation) return false;
        if($scope.operator.inputs == 0) return true;
        if($scope.operator.inputs == 1) return validateCondition($scope.value.value);
        return validateCondition($scope.value.from) && validateCondition($scope.value.to);
    };

    $scope.save = function() {
        var res = $scope.field
            ? {
                kind: 'field',
                id: $scope.field.id,
                operator: $scope.operator.id,
                value: $scope.value
              }
            : {
                kind: 'relation',
                rel: $scope.relation.rel,
                id: $scope.relation.id,
                target: $scope.relation.target,
                operator: $scope.operator.id,
                value: $scope.value,
                subs: []
              };

        $modalInstance.close(res);
    };

    $scope.dismiss = function() {
        $modalInstance.dismiss('cancel');
    };
};
