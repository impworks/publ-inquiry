var MainCtrl = function ($scope, $http, $location, $modal, globals, model, tools) {

    // check auth
    if(!globals.token) {
        $location.path('/');
        return;
    }

    var resetList = function() {
        // reset conditions when they are
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
                alert(JSON.stringify(v));
            }
        )
    };
};
