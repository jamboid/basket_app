var App = App || {};

/*

App.basket.js

This module controls the functionality and display of the app's basket component.

*/
App.basket = (function ($) {


  var

  // Selectors for DOM elements
  selBasket = '[data-basket=component]',
  selBasketItem = '[data-basket=basketItem]',
  selBasketItemRemoveButton = '[data-basket-action=remove]',
  selBasketCurrencySwitcher = 'select[data-basket=currency-switcher]',
  selBasketCurrencySwitcherOption = '[data-basket=currency-switcher] option',


  //////////////////
  // Constructors //
  //////////////////

  /**
   * BasketItem object constructor
   * Each item added to the basket is controlled by an instance of this 'class'.
   * @constructor
   */
  BasketItem = function (productID) {

    var itemProductID = productID,
    $thisBasketItem, // Variable to hold DOM element

    /**
     * Creates the item markup to add to the page
     * @function
     */
    buildItemMarkup = function (productData) {
      return `<div class="cp_Basket__item gd_Group">
        <div class="cp_ProductList__itemInfo">
          <div class="cp_Basket__itemName">${productData.name}</div>
          <div class="cp_Basket__itemPrice">Price with prefix</div>
        </div>
        <div class="cp_Basket__itemActions">
          <a href="#" class="cp_Basket__removeAction ob_Button--neg ob_Button--list ob_Button">Remove</a>
        </div>
      </div>
      `
    },

    processProductInfo = function () {

    },

    /**
     * Builds the item
     * @function
     */
    buildItem = function () {

      // Now that the list item has been created and added to the DOM we can bind custom message listeners to it.
      bindCustomMessageEvents();
      subscribeToEvents();
    }

    /**
     * Bind Custom Events to allow Object messaging
     * @function
     */
    bindCustomMessageEvents = function () {
      $thisBasketItem.on('updatePrice', function(e) {
        e.preventDefault();
        console.log('updated price');
      });
      //
      // $thisBasketItem.on('removeItem', function(e) {
      //   e.preventDefault();
      // });
    },

    /**
     * Subscribe object to Global Messages
     * @function
     */
    subscribeToEvents = function () {
      // Subscrive to layoutchange event to trigger scroller's updateLayout method
      $.subscribe("currency/switched", function () {
        $(this).trigger("updatePrice");
      } , $thisBasketItem);
    };


    this.init = function () {
      buildItem();
    };
  },

  /**
   * Currency Switcher object constructor
   * This object controls the functionality of the checkout basket's currency switcher menu
   * @constructor
   */
  CurrencySwitcher = function (elem) {
    var $thisCurrencySwitcher = $(elem),

    /**
     * Build the list of supported currencies using the data in the App's configuration settings
     * @function
     */
    buildSwitcherMenu = function () {
      var currencies = App.config.settings.currencies;
      console.log(currencies);

      for (var currency in currencies) {
        var optionTemplate = '<option value="' + currency + '"> ' + currencies[currency].name + '</option>';
        $thisCurrencySwitcher.append($(optionTemplate));
      }
    },

    /**
     * Bind Custom Events to allow Object messaging
     * @function
     */
    bindCustomMessageEvents = function () {
      $thisCurrencySwitcher.on('changeCurrency', function(e) {

        e.preventDefault();
        App.model.setCurrentCurrency($thisCurrencySwitcher.val());
      });
    },

    /**
     * Subscribe object to Global Messages
     * @function
     */
    subscribeToEvents = function () {
      // Subscrive to layoutchange event to trigger scroller's updateLayout method
    };

    this.init = function () {
      // The base element for this UI component is already on the page, so we don't need to wait until after the
      // options are added to the menu before setting up the related event listeners and message subscriptions.
      bindCustomMessageEvents();
      subscribeToEvents();

      buildSwitcherMenu();
    };
  },

  ///////////////
  // Functions //
  ///////////////

  addItemToBasket = function (productID) {
    var newBasketItem = new BasketItem(productID).init();
  },

  /**
   * Create delegate event listeners for this module
   * @function
   */
  delegateEvents = function () {
    App.events.delegate("click", selBasketItemRemoveButton, "removeItem");
    App.events.delegate("change", selBasketCurrencySwitcher, "changeCurrency");
  },

  /**
   * This is the initialsation function for the module
   * @function
   */
  init = function() {
    // Init functions...
    delegateEvents();

    // Build basket components
    $(selBasketCurrencySwitcher).each(function() {
      var newCurrencySwitcher = new CurrencySwitcher(this).init();
    });
  }

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    init:init,
    addItemToBasket:addItemToBasket
  }
}(jQuery));
