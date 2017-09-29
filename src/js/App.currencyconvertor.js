var App = App || {};

// Currency Convertor Module
// This module is concerned with converting values passed to it by the UI components.
App.currencyconvertor = (function () {

  var

  /**
   * This function takes a monetary value and the target currency and return the correct conversion
   * @function
   */
  convertCurrencyFromPounds = function(value,newCurrency) {
    var testEndpoint = App.config.settings.currencyAPI.endpoint;

    let testGet = App.apis.get(testEndpoint)
    .then(function(response){
      // Use Headers to check if the return object matches what we were looking for (e.g. json)
      var contentType = response.headers.get("content-type");
      if(contentType && contentType.includes("application/json")) {
        return response.json();
      }
      throw new TypeError("Oops, we haven't got JSON!");
    })
    .then(function(data) {
      App.utils.cl(data);
    });
  },

  /**
   * This is the initialsation function for the module
   * @function
   */
  init = function() {
    // Init functions...
  }

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    init:init,
    convertCurrencyFromPounds:convertCurrencyFromPounds
  }

}())
