var recaptcha = {
  /**
   * Verify reCAPTCHA using the given site key.
   * @param {string} siteKey - Your mobile-configured reCAPTCHA site key.
   * @param {function} successCallback - Called with an object containing the reCAPTCHA token.
   * @param {function} errorCallback - Called if verification fails.
   */
  verify: function(siteKey, successCallback, errorCallback) {
    cordova.exec(
      successCallback,
      errorCallback,
      "Recaptcha", // Plugin name as defined in plugin.xml
      "verify",    // Action name
      [siteKey]    // Arguments passed to native code
    );
  }
};

module.exports = recaptcha;

