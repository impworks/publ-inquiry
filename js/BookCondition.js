var BookConditionCtrl = function ($scope, $modalInstance, model, tools) {

    $scope.condFields = tools.Split(model.fields.books, 3);
    $scope.condRelations = tools.Split(model.relations.books, 3);
    $scope.condType = false;

    $scope.select = function(v, isComplete) {
        $scope.condType = v;

        if(isComplete) {
            $scope.save();
            return;
        }

        $scope.operators = tools.SelectMany(
            model.operators[v.type],
            function(v) {
                var trailer = v.inputs == 0 ? '.' : ':';
                return [
                    { id: v.id, caption: v.caption, inputs: v.inputs, trailer: trailer },
                    { id: 'not-' + v.id, caption: v.negCaption, inputs: v.inputs, trailer: trailer }
                ];
            }
        );
        $scope.operator = $scope.operators[0];
        console.log($scope.operator);
    };

    $scope.setOperator = function(v) {
        $scope.operator = v;
    };

    $scope.inputCount = function(v) {
        return $scope.operator && $scope.operator.inputs == v;
    };

    $scope.showDetails = function () {
        return !!$scope.condType;
    };

    $scope.save = function() {
        $modalInstance.close({ result: true });
    };

    $scope.dismiss = function() {
        $modalInstance.dismiss('cancel');
    };
};
