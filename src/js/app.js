"use strict";

// app.js

/*

## App Objects
- Ajax/API Helper
  - Abstraction to allow Ajax calls for both the product and currency lists
  - Uses Fetch/Promise functionality
- Basket
  - Contains an array of products
- Product List
- Product

4. Currency Selector
5. Currency Convertor

## App Functionality
- App is initialised
  - List of products is loaded via Ajax
  -


*/


/* !== Global Constants/Variables */

const rateAPIKey = '65790386c71ca815956382ad28ed41c9',
      rateDomain = 'http://apilayer.net/api/live',
      rateEndPoint = '';

//
//
// const App = {
//   buildAppObjects: function () {
//     let appBasket = new Basket();
//     console.log(appBasket);
//   },
//
//   init: function () {
//     console.log('start...');
//     this.buildAppObjects();
//   }
// }

const App = {};

App.init = (function ($) {
    "use strict";

  ///////////////
  // Polyfills //
  ///////////////

  /////////////////////////////////
  // Initialise Modules //
  /////////////////////////////////

    // Modules object
    const Modules = {};

    /**
     * Initialise the modules used in this app
     * @function
     */
    Modules.init = function () {
      // When the DOM is ready, initialise the app modules using their init() functions
      $(document).ready(function () {
        App.apis.init();
        App.events.init();
        App.utils.init();
        console.log('app ready');

        const testEndpoint = 'http://apilayer.net/api/live?access_key=65790386c71ca815956382ad28ed41c9&format=1';

        let currency = 'USDAED';

        let testGet = App.apis.get(testEndpoint)
        .then(function(response){
          return response.json();
        })
        .then(function(data) {
          for (var key in data.quotes) {
               console.log(key);
          }
        });
      });
    };

    // Automatically call Modules.init function
    return Modules.init();

}(jQuery));

console.log('at the end');
