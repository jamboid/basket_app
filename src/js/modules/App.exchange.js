var App = App || {};

/*

App.exchange.js

This module maintains and provides accurate currency
exchange information to the rest of the app.

*/
App.exchange = (function () {
  var exchangeRates = {
    'timeStamp': '',
    'rates': {}
  },

  /**
   * Returns the exchange rate for a given currency
   * This will be based on
   * @function
   */
  getSingleExchangeRate = function(currency) {
    // If the exchangeRates object has been populated with data
    // i.e. the timeStamp value has been set, return the rates
    // for the given currency, otherwise throw and catch an error.
    try {
      if(exchangeRates.rates[currency]) {
        return exchangeRates.rates[currency];
      } else {
        throw "No exchange rate data";
      }
    } catch (error) {
      console.log(error);
      $.publish('data-error/exchange-rates');
    }
    // finally {
    //
    // }
  },

  /**
   * Sets the new exchange rates.
   * @function
   */
  setRates = function (newRates,baseCurrency) {
    /*
    The free version of the currencylayer API used currently only provides exchange
    rates against the US Dollar, so we need to cross calculate the exchange rates for
    any other base currency (in this case the British Pound).
    */

    // Set rates in the exchangeRates.rates object
    for (var key in newRates) {
      if (newRates.hasOwnProperty(key)) {



        // Calculate the exchange rate against the base currency
        var rateAgainstBaseCurrency  = parseFloat(newRates[key] / newRates[baseCurrency]);
        // Set the calculated rate in the exchangeRates object
        key = key.substring(3);
        exchangeRates.rates[key] = rateAgainstBaseCurrency;
      }
    }

    // Update the timeStamp for the rates
    exchangeRates.timeStamp = new Date();

    console.log(exchangeRates);

    // Publish a message stating the rates have been updated
    // This will let the other component subscribers know to update themselves
    $.publish('rates/updated');

    // Log the newly update exchangeRates object

  },

  /**
   * Call the currency API, using the App.apis module, and update the rates data with the result
   * @function
   */
  getUpdatedCurrencyRates = function () {
    //console.log('update rates...');
    var newRates = App.apis.get(App.config.settings.currencyAPI.endpoint)
    .then(function(data) {
      //console.log('data', data);
      // Set updated exchange rates, against a base currency
      setRates(data.quotes, App.config.settings.baseCurrency);
    });
  },

  /**
   * Subscribe object to Global Messages
   * @function
   */
  subscribeToMessages = function () {
      // Subscrive to "currency/switched" message
      // This will cause the exchange rates to be updated and once completeSwitch
      // will send a "rates/updated" message causing the basket UI to update itself.
    $.subscribe("currency/switched", function () {
      console.log('get updated currency rates');
      getUpdatedCurrencyRates();
    });
  },

  /**
   * This is the initialsation function for the module
   * @function
   */
  init = function() {
    // Init functions...
    subscribeToMessages();
  }

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    init:init,
    getSingleExchangeRate:getSingleExchangeRate,
    setRates:setRates
  }
}())
