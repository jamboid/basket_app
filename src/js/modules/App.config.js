var App = App || {};

App.config = (function() {

  var rateAPIKey = '65790386c71ca815956382ad28ed41c9',

  settings = {
    // Base currency used to create exchange rates, as API currently only provides exchange rates for USD
    "baseCurrency":"USDGBP",
    // Currencies supported by this app, including name and symbol for use in the app UI
    "currencies": {
      "USD":{
        "name":"US Dollars",
        "symbol":"$"
      },
      "EUR": {
        "name":"Euros",
        "symbol":"€"
      },
      "GBP": {
        "name":"British Pounds",
        "symbol":"£"
      },
      "CAD": {
        "name":"Canadian Dollars",
        "symbol":"$"
      }
    },

    'currencyAPI': {
      'endpoint': 'http://apilayer.net/api/live?access_key=' + rateAPIKey + '&format=1&currencies=USD,GBP,EUR,AUD,CAD'
    },
  }


  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    settings:settings
  };

}());
