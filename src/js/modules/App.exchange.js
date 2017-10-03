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
    // Rather than a Date object, we're using a moment object (using the Moment.js library)
    // for easier comparison later on.
    exchangeRates.timeStamp = moment();

    // Publish a message stating the rates have been updated
    // This will let the other component subscribers know to update themselves
    $.publish('rates/updated');
  },

  /**
   * Call the currency API, using the App.apis module, and update the rates data with the result
   * @function
   */
  getUpdatedCurrencyRates = function () {


    // Because the currencylayer API only updates exchange rates data every hour,
    // the App caches the rates and only updates them once per hour (or however
    // long is getting in the App settings).

    // If a timeStamp has been set in the exchangeRates object (i.e. rate have previously been set),
    // check if the time since is greater than the cache period set in the App settings. If it is not
    // use the cached rates and exit this function using a return. Otherwise, set new rates with a Ajax call
    // to the currency API.
    if(exchangeRates.timeStamp) {
      var rightNow = moment(),
          then = exchangeRates.timeStamp;

      //console.log(moment.duration(rightNow.diff(then)).asHours());

      if (parseInt(moment.duration(rightNow.diff(then)).asHours()) <= App.model.getCachePeriod() ) {
        //console.log('use cached exchange rates');
        $.publish('rates/updated');
        return;
      }
    }

    var newRates = App.apis.get(App.model.getAppSettings().currencyAPI.endpoint)
    .then(function(data) {
      //console.log('set new rates');
      // Set updated exchange rates, against a base currency
      setRates(data.quotes, App.model.getAppSettings().baseCurrency);
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
