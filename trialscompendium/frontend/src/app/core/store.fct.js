angular
    .module('app.core')
    .factory('storeService', storeService);

storeService.$inject = ['localStorageService'];

function storeService(localStorageService) {
    var trials = [];
    var ls = localStorageService.get('store');

    if (ls !== null) {
        trials = ls;
    }

    return {
        'addTrial': addTrial,
        'getTrials': getTrials

    };

    function addTrial(data) {
        trials.push(data);
        save();
    }

    function getTrials() {
        return trials;
    }

    function save() {
        localStorageService.set('store', trials);
    }
}