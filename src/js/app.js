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



/* !== Classes */
class Basket {
  constructor(element) {
    this.domElement = element;
  }
}

class AjaxHelper {
  constructor() {

  }
}

class ProductList {
  constructor(element) {
    this.domElement = element;
  }
}

class Product {
  constructor(element) {
    this.domElement = element
  }
}

class CurrencyConvertor {
  constructor() {

  }
}


const App = {
  buildAppObjects: function () {
    let appBasket = new Basket();
    console.log(appBasket);
  },

  init: function () {
    console.log('start...');
    this.buildAppObjects();
  }
}


App.init = (function ($) {
    "use strict";

  ///////////////
  // Polyfills //
  ///////////////

  ////////////////////////
  // Initialise Modules //
  ////////////////////////

    // Modules object
    const Modules = {};

    /**
     * Initialise the modules used in this project
     * @function
     */
    Modules.init = function () {
      $(document).ready(function () {
        
      });
    };

    // Automatically call Modules.init function
    return Modules.init();

}(jQuery));
