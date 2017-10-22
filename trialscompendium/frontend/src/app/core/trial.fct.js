angular
    .module('app.core')
    .constant('BASE_URL', 'http://127.0.0.1:8000/api')
    .factory('trialService', trialService);

trialService.$inject = ['$resource', 'BASE_URL', '$log', 'pickSingleObjFilter', 'strReplaceFilter', 'pickMultiObjFilter'];

function trialService($resource, BASE_URL, $log, pickSingleObjFilter, strReplaceFilter, pickMultiObjFilter) {
    return {
        'search': search,
        'get': get,
        'searchAllPages': searchAllPages,
        'filterSingleObj': filterSingleObj,
        'strToKey': strToKey,
        'getNestedTrials': getNestedTrials,
        'filterMultiObj': filterMultiObj,
        'mergeOnSearch': mergeOnSearch
    };

    function makeRequest(url, params) {
        var requestUrl = BASE_URL + '/' + url;

        return $resource(requestUrl, {}, {
            query: {
                'method': 'GET',
                'params': params,
                'headers': {
                    'Content-Type': 'application/json'
                },
                'interceptor' : {
                    'responseError' : dataServiceError
                },
                'cache': true
            },
            get: {
                'method': 'GET',
                'params': params,
                'headers': {
                    'Content-Type': 'application/json'
                },
                'interceptor' : {
                    'responseError' : dataServiceError
                },
                'cache': true
            }
        });
    }

    function search(apiNode, query){
        // Search one or more records per page
        return makeRequest(apiNode + '/', query).query().$promise.
        then(function(data){
            return data;
        });
    }

    function get(apiNode, query) {
        // Get one record per page
        var id = Object.keys(query)[0];
        return makeRequest(apiNode + '/:' + id, query).get().$promise;
    }

    function searchAllPages(apiNode, query, list) {
        // Search one or more records in all pages
        return makeRequest(apiNode + '/', query).query().$promise.then(function(data){
            list = list.concat(data.results);
            if (data.next) {
                query.offset += query.limit;
                return searchAllPages(apiNode, query, list);
            }
            return list;
        });
    }

    function filterSingleObj(data, filterProp, replaceValue){
        return pickSingleObjFilter(data, filterProp, replaceValue);
    }

    function strToKey(keyOptions, str) {
        // Convert string to key by replacing space with an underscore
        if (keyOptions) {
            var newKey = false;
            str = typeof str !== undefined || str !== null ? str : false;
            angular.forEach(keyOptions, function(opt){
                if (str === opt){
                    newKey = strReplaceFilter(str, ' ', '_').toLowerCase();
                }
            });
            return newKey;
        }
    }

    function getNestedTrials(data, replaceKey, keyOptions){
        var newKey = false;
        var outObjArr = [];
        var nestedObj = false;
        replaceKey = typeof replaceKey !== undefined || replaceKey !== null ? replaceKey : false;
        keyOptions = typeof keyOptions !== undefined || keyOptions !== null ? keyOptions : false;
        angular.forEach(data, function(obj) {
            var outObj = {};
            angular.forEach(obj, function (value, key) {
                if (typeof value === 'object') {
                    nestedObj = value;
                } else {
                    newKey = strToKey(keyOptions, value) ? strToKey(keyOptions, value) : newKey;
                    key = newKey && key === replaceKey ? newKey : key;
                    outObj[key] = value;
                }
            });
            outObjArr = outObjArr.concat(outObj);
        });
        return {
            outObjArr: outObjArr,
            nestedObj: nestedObj
        };
    }

    function filterMultiObj(data, filterProp, replaceValue) {
        return pickMultiObjFilter(data, filterProp, replaceValue);
    }

    function mergeOnSearch(data, mergeProp){
        // Merge similar objects into one
        var outObjArr = [];
        angular.forEach(data, function(obj){
            var existing = outObjArr.filter(function(value){
                if (angular.isArray(mergeProp) && mergeProp.length) {
                    var filterEval = '';
                    mergeProp.map(function (prop, propIndex) {
                        if (value[prop] === obj[prop]) {
                            filterEval += 'value["' + prop +'"] === obj["' + prop + '"]';
                            if ((propIndex + 1) < mergeProp.length){
                                filterEval += ' && '
                            }
                        }
                    });
                    return (mergeProp.length > 1 && filterEval.indexOf('&&') > -1) ? eval(filterEval) : (mergeProp.length === 1 && filterEval) ? eval(filterEval) : false;
                }else{
                    return value[mergeProp] === obj[mergeProp];
                }
            });
            if (existing.length) {
                var existingIndex = outObjArr.indexOf(existing[0]);
                angular.merge(outObjArr[existingIndex], obj);
            } else {
                outObjArr = outObjArr.concat(obj);
            }
        });
        return outObjArr;
    }

    function dataServiceError(errorResponse) {
        $log.error('XHR Failed for ShowService');
        $log.error(errorResponse);
        return errorResponse;
    }
}
