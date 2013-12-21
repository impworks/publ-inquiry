var SavedCtrl = function ($scope, $location, $rootScope, globals, model, tools) {

    $rootScope.$broadcast('saved-reset');

    $scope.list = globals.savedInquiries || [];

    $scope.isEmpty = function() {
        return !$scope.list || !$scope.list.length;
    };

    $scope.load = function(inq) {
        globals.inquiryToLoad = inq;
        $location.path('/main');
    };

    $scope.remove = function(inq) {
        globals.removeInquiry(inq);
        var id = $scope.list.indexOf(inq);
        if(id !== -1) $scope.list.splice(id, 1);
    };

    $scope.getDate = function(v) {
        return tools.DateFormat(new Date(v.date));
    };

    $scope.getType = function(v) {
        return v.value.type.type;
    };

    $scope.getConditions = function(v) {
        var count = v.value.conditions && v.value.conditions.length ? v.value.conditions.length : 0;
        return count ? tools.Wrap(count, 'span') : tools.Wrap('None', 'span', 'class="text-muted"');
    };

    $scope.getGrouping = function(v) {
        var count = tools.Count(
            v.value.group,
            function(x) { return !!x.selected; }
        );
        return count ? tools.Wrap(count, 'span') : tools.Wrap('None', 'span', 'class="text-muted"');
    };
};
