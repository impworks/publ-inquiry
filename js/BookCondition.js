var BookConditionCtrl = function ($scope, $modalInstance, model, tools) {

    var validateCondition = function(value) {
        if(!$scope.field)
            return false;

        var type = $scope.field.type;
        if(type == 'int' || type == 'size') return !isNaN(value);
        return !!value;
    };

    $scope.condFields = tools.Split(model.fields.books, 3);
    $scope.condRelations = tools.Split(model.relations.books, 3);
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
    };

    $scope.selectRelation = function(v) {
        $modalInstance.close({
            kind: 'relation',
            id: v.id
        })
    };

    $scope.canSave = function() {
        if(!$scope.field) return false;
        if($scope.operator.inputs == 0) return true;
        if($scope.operator.inputs == 1) return validateCondition($scope.value.value);
        return validateCondition($scope.value.from) && validateCondition($scope.value.to);
    };

    $scope.setOperator = function(v) {
        $scope.operator = v;
    };

    $scope.inputCount = function(v) {
        return $scope.operator && $scope.operator.inputs == v;
    };

    $scope.showDetails = function () {
        return !!$scope.field;
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
