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
      return response.json();
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
