var BookConditionCtrl = function ($scope, $modalInstance, model, tools) {

    $scope.condFields = tools.Split(model.fields.books, 3);
    $scope.condRelations = tools.Split(model.relations.books, 3);
    $scope.kind = false;
    $scope.value = {};

    $scope.select = function(v, isComplete) {
        $scope.kind = v;

        if(isComplete) {
            $scope.save();
            return;
        }

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

    $scope.setOperator = function(v) {
        $scope.operator = v;
    };

    $scope.inputCount = function(v) {
        return $scope.operator && $scope.operator.inputs == v;
    };

    $scope.showDetails = function () {
        return !!$scope.kind;
    };

    $scope.save = function() {
        $modalInstance.close({
            kind: $scope.kind.id,
            operator: $scope.operator.id,
            value: $scope.value
        });
    };

    $scope.dismiss = function() {
        $modalInstance.dismiss('cancel');
    };
};
