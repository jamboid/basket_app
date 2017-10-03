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

var App = {};

App.init = (function ($) {

  /////////////////////////////////
  // Initialise Modules //
  /////////////////////////////////

    // Modules object
    var Modules = {};

    /**
     * Initialise the modules used in this app
     * @function
     */
    Modules.init = function () {
      // When the DOM is ready, initialise the app modules using their init() functions
      $(document).ready(function () {

        App.events.init();
        App.apis.init();
        App.exchange.init();
        App.productList.init();
        App.basket.init();

      });
    };

    // Automatically call Modules.init function
    return Modules.init();

}(jQuery));

//console.log('at the end');
