var ConditionsCtrl = function ($scope, $modalInstance, model, tools, focus, dataType) {

    var validateCondition = function(value) {
        if(!$scope.field)
            return false;

        var type = $scope.field.type;
        if(type == 'int') return !isNaN(value);
        if(type == 'size') return tools.ParseSize(value) > 0;
        return !!value;
    };

    var typeEquals = function(type, value) {
        if(type == value) return true;
        if(value == 'basic' && ['date', 'enum'].indexOf($scope.field.type) == -1) return true;
        return false;
    };

    var updateFocus = function () {
        var key = $scope.field.type == 'date' ? 'date' : 'basic' + '-' + $scope.operator.inputs;
        focus(key);
    };

    $scope.caption = tools.Cap(dataType) + ' conditions';
    $scope.condFields = tools.Split(model.fields[dataType], 3);
    $scope.condRelations = tools.Split(model.relations[dataType], 3);
    $scope.field = false;
    $scope.value = {};

    $scope.selectField = function(v) {
        $scope.field = v;
        $scope.operators = tools.SelectMany(
            model.operators[v.type],
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

    $scope.selectRelation = function(v) {
        $modalInstance.close({
            kind: 'relation',
            rel: v.rel,
            id: v.id,
            target: v.target,
            subs: []
        })
    };

    $scope.setOperator = function(v) {
        $scope.operator = v;
        updateFocus();
    };

    $scope.inputCount = function(v) {
        return $scope.operator && $scope.operator.inputs == v;
    };

    $scope.inputType = function(v) {
        return $scope.field && typeEquals($scope.field.type, v);
    };

    $scope.showDetails = function () {
        return !!$scope.field;
    };

    $scope.getEnumValues = function () {
        if(!$scope.field || $scope.field.type != 'enum') return [];
        return model.enums[$scope.field.enum];
    };

    $scope.canSave = function() {
        if(!$scope.field) return false;
        if($scope.operator.inputs == 0) return true;
        if($scope.operator.inputs == 1) return validateCondition($scope.value.value);
        return validateCondition($scope.value.from) && validateCondition($scope.value.to);
    };

    $scope.saveField = function() {
        $modalInstance.close({
            kind: 'field',
            id: $scope.field.id,
            operator: $scope.operator.id,
            value: $scope.value
        });
    };

    $scope.dismiss = function() {
        $modalInstance.dismiss('cancel');
    };
};
