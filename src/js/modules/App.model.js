var App = App || {};

/*

App.model.js

This module contains the working data used by the app, as well as specific Get/Set functions
for accessing and updating it.

*/
App.model = (function () {
  var exchangeRates,

  setExchangeRates = function (newRates) {
    exchangeRates = newRates;
  },

  getExchangeRate = function (currency) {

  },

  /*
  A JSON object containing the data for the list of products for sale.
  This creates a single source of data for the various UI elements in the app.
  In a product version of the app, this would like be loaded remotely using the App.apis module
  */
  products = {
    "1": {
      "name":"Peas",
      "quantity":"per bag",
      "price":"0.95"
    },
    "2": {
      "name":"Eggs",
      "quantity":"per dozen",
      "price":"2.10"
    },
    "3": {
      "name":"Milk",
      "quantity":"per bottle",
      "price":"1.30"
    },
    "4": {
      "name":"Beans",
      "quantity":"per cab",
      "price":"0.73"
    }
  },

  getProductInfo = function (productID) {
    return products[productID];
  },

  getProducts = function() {
    return products;
  },

  // Current Currency
  currentCurrency = 'GBP',

  // Set and Get functions for Current Currency
  setCurrentCurrency = function (newCurrency) {
    currentCurrency = newCurrency;
    $.publish('currency/switched');
  }

  getCurrentCurrency = function () {
    return currentCurrency;
  }

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
    setExchangeRates:setExchangeRates,
    getExchangeRate:getExchangeRate,
    getProductInfo:getProductInfo,
    getProducts:getProducts,
    setCurrentCurrency:setCurrentCurrency,
    getCurrentCurrency:getCurrentCurrency
  }
}())
