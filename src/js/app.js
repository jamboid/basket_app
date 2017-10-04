"use strict";

// app.js

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
        // Each module is an IIFE, but each also has an init function that initiates
        // module function only at this point, once the document is ready.
        // In this not all the modules' init functions are called, because
        // some are currently used for anything.
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
