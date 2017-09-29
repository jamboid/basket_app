var App = App || {};

App.config = (function() {

  var

  settings = {
    'currencyAPI': {
      'endpoint': 'http://apilayer.net/api/live?access_key=65790386c71ca815956382ad28ed41c9&format=1',
      'rateAPIKey': '65790386c71ca815956382ad28ed41c9',
      'rateDomain': 'http://apilayer.net/api/live',
      'rateEndPoint': ''
    }
  }


  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    settings:settings
  };

}());
