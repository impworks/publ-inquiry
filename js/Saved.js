var SavedCtrl = function ($scope, $location, globals, model, tools) {

    $scope.list = globals.savedInquiries || [];

//    $scope.save = function () {
//        if(!globals.inquiryTransport.toSave)
//            return;
//
//        var obj = {
//            caption: $scope.caption,
//            value: globals.inquiryTransport.toSave
//        };
//
//        $scope.list.push(obj);
//        globals.inquiryTransport.toSave = undefined;
//    };

    $scope.isEmpty = function() {
        return !$scope.list || !$scope.list.length;
    };

    $scope.load = function(inq) {
        globals.inquiryTransport.toLoad = inq.value;
        $location.path('/main');
    };

    $scope.remove = function(inq) {
        tools.Remove($scope.list, inq);
    };
};
