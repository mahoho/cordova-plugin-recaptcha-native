var exec = require('cordova/exec');
var executeCallback = function(callback, message) {
    if (typeof callback === 'function') {
        callback(message);
    }
};


exports.verify = function(successCallback, errorCallback) {
    return new Promise(function(resolve, reject) {
        exec(function(message) {
            executeCallback(successCallback, message);
            resolve(message);
        }, function(message) {
            executeCallback(errorCallback, message);
            reject(message);
        }, 'RecaptchaNative', 'verify', []);
    });
  };
