angular.module('inquiry').service(
    'tools',
    function() {
        var find = function(arr, cnd) {
            if(arr && arr.length) {
                for(var i = 0; i < arr.length; i++) {
                    var curr = arr[i];
                    if(cnd(curr))
                        return { item: curr, index: i };
                }
            }

            return { item: undefined, index: undefined };
        };

        this.First = function(arr, cnd) {
            return find(arr, cnd).item;
        };

        this.FirstId = function(arr, cnd) {
            return find(arr, cnd).index;
        };

        this.Select = function(arr, map) {
            var result = [];
            if(arr && arr.length)
                for(var i = 0; i < arr.length; i++)
                    result.push(map(arr[i]));
            return result;
        };

        this.SelectMany = function(arr, map) {
            var result = [];
            if(arr && arr.length) {
                for(var i = 0; i < arr.length; i++) {
                    var curr = map(arr[i]);
                    if(!curr || !curr.length)
                        continue;
                    for(var j = 0; j < curr.length; j++)
                        result.push(curr[j]);
                }
            }
            return result;
        };

        this.Contains = function(arr, cnd) {
            return typeof find(arr, cnd).index !== 'undefined';
        };

        this.Except = function(arr, cnd) {
            return arr.filter(function(v) { return !cnd(v); });
        };

        this.Split = function(arr, parts) {
            if(!arr || !arr.length || !parts)
                return undefined;

            var res = [];
            for(var i = 0; i < arr.length; i++) {
                var k = i % parts;
                if(res.length - 1 < k)
                    res.push([arr[i]]);
                else
                    res[k].push(arr[i]);
            }
            return res;
        };

        this.Cap = function(v, isCap) {
            if(typeof isCap === 'undefined') isCap = true;
            if(!v) return undefined;
            var first = v.substr(0, 1);
            return (isCap ? first.toUpperCase() : first.toLowerCase()) + v.substr(1);
        };
    }
);