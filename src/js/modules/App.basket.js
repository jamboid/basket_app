var App = App || {};

/*

App.basket.js

This module controls the functionality and display of the app's basket component.
This consists of three types of sub-components:

* The Basket Container, controlled using an instance of the Basket 'class'
* One or more Basket Items, controlled using instances of the BasketItem 'class'
* The Currency Switcher, controlled using an instance of the CurrencySwitcher 'class'

Each of the UI sub-components is loosely coupled to the other components on the page and communication
is generally handled using the publish/subscribe messaging system.

*/
App.basket = (function ($) {
  var $body = $('body').eq(0),

  // Selectors for DOM elements are generally data- attributes, rather than
  // ID/Classes. I'll generally do this to improve reuse of the code across projects.
  selBasket = '[data-basket=component]',
  selBasketList = '[data-basket=list]',
  selBasketItem = '[data-basket-item]',
  selBasketItemPriceValue = '[data-basket=itemPrice]',
  selBasketItemRemoveButton = '[data-basket-action=remove]',
  selBasketItemCheckoutButton = '[data-basket-action=checkout]',
  selBasketItemPaymentButton = '[data-basket-action=payment]',
  selBasketItemReturnLink = '[data-basket-action=return]',
  selBasketTotal = '[data-basket=total]',
  selBasketCurrencySwitcher = 'select[data-basket=currency-switcher]',
  selBasketCurrencySwitcherOption = '[data-basket=currency-switcher] option',

  // Referemces to DOM elements
  // The basket list container element is part of the static template so we can create
  // a reference to it at this point.
  $basketList = $(selBasketList),

  //////////////////
  // Constructors //
  //////////////////

  /**
   * Basket object constructor
   * An instance of this 'class' controls the general functionality of the Basket component.
   * @constructor
   */
  Basket = function (elem) {
    var $thisBasket = $(elem),
        $basketItems,
        $basketTotal = $thisBasket.find(selBasketTotal).eq(0),
        basketIsEmpty = true,
        totalValue,

    /**
     * Calculate the total price of the basket items and convert to the current currency
     * @function
     */
    calculateBasketTotal = function () {
      // This will be the total of the basket item prices using the model data
      totalValue = 0,
      // This will be the total converted to the current currencny using the exchange rate
      totalInCurrentCurrency = 0,
      // This is the currency symbol to prefix the total value with
      currentCurrencySymbol = App.model.getAppSettings().currencies[App.model.getCurrentCurrency()].symbol;

      // If there are any basket items
      if ($basketItems) {
        // For each basket item..
        $basketItems.each(function() {
          // Get the product info by querying the model using the product ID set
          // as a data attribute on the basket item element
          var productInfo = App.model.getProductInfo($(this).data('basket-item'));
          totalValue = totalValue + parseFloat(productInfo.price);
        });
      }

      // Calculate the basket total in the currently-selected currency by getting the exchange rate
      // for that currency by calling the getSingleExchangeRate function in the App.exchange module, with
      // the parameter being the currenyCurrency variable held in the App.model module.
      totalInCurrentCurrency = totalValue * App.exchange.getSingleExchangeRate(App.model.getCurrentCurrency());
      // Set the basket text using the symbol and value (adjusted to two decimal places)
      // NOTE: A more advanced version of this functionality may need to format the total string differently,
      // depending on the currency.
      $basketTotal.text(currentCurrencySymbol + totalInCurrentCurrency.toFixed(2));
    },

    /**
     * Check the contents of the basket and updated it's status accordingly
     * @function
     */
    checkBasketContents = function () {
      // Get any item elements currently in the basket container elements
      $basketItems = $thisBasket.find(selBasketItem);
      // And if there are any...
      if($basketItems.length > 0) {
        // Set the empty variable to false
        basketIsEmpty = false;
        // Remove the 'is_Empty' class, which sets the UI mode
        $thisBasket.removeClass('is_Empty');
        // And update the basket total. This is calculated and updated whether
        // the total is displayed or not, to keep the UI consistent
        calculateBasketTotal();
      } else {
        // Set the empty variable to true
        basketIsEmpty = true;
        // Add the 'is_Empty' class, which sets the UI mode
        $thisBasket.addClass('is_Empty');
        // And update the basket total (to 0.00). This is calculated and updated whether
        // the total is displayed or not, to keep the UI consistent
        calculateBasketTotal();
        // Remove the is_CheckingOut class from the body element. This set's the App's UI mode to 'shopping',
        // where the product list is displayed and the basket only shows the contents (currently none) and not the
        // checkout controls and info.
        $body.removeClass('is_CheckingOut');
      }
    },

    /**
     * Add/Remove a class on the document body depending on the mode the App is in
     * @function
     */
    setMode = function (mode) {
      if(mode === 'checkout') {
        $body.addClass('is_CheckingOut');

        calculateBasketTotal();
      } else {
        $body.removeClass('is_CheckingOut');
      }
    },

    /**
     * Bind Custom Events to allow Object messaging
     * These are event listeners for custom events that act as the functional interface
     * for the component, and allow functionality to be controlled either internally or externally
     * in the same way.
     * @function
     */
    bindCustomMessageEvents = function () {
      $thisBasket.on('checkBasketStatus', function(e) {
        e.preventDefault();
        checkBasketContents();
      });

      $thisBasket.on('checkout', function(e) {
        e.preventDefault();
        setMode('checkout');
      });

      $thisBasket.on('payment', function(e) {
        e.preventDefault();
        alert('In a complete basket/checkout app you would now proceed to the payment screen, but this is the end of the process within this prototype');
      });

      $thisBasket.on('shop', function(e) {
        e.preventDefault();
        setMode('shop');
      });

      $thisBasket.on('updateTotal', function(e) {
        e.preventDefault();
        calculateBasketTotal();
      });
    },

    /**
     * Subscribe object to Global Messages
     * @function
     */
    subscribeToEvents = function () {
      $.subscribe('basket/updated', function () {
        $(this).trigger('checkBasketStatus');
      } , $thisBasket);

      $.subscribe('rates/updated', function () {
        $(this).trigger('updateTotal');
      } , $thisBasket);
    };

    /**
     * The init function to initialise each instance of this 'class'
     * @function
     */
    this.init = function () {
      bindCustomMessageEvents();
      subscribeToEvents();
    };
  },

  /**
   * BasketItem object constructor
   * Each item added to the basket is controlled by an instance of this 'class'.
   * @constructor
   */
  BasketItem = function (productID) {

    var itemProductID = productID,
    productInfo,
    $thisBasketItem, // Variable to hold DOM element

    /**
     * Creates the item markup to add to the page
     * @function
     */
    buildItemMarkup = function () {
      return `<div class="cp_Basket__item gd_Group" data-basket-item="${productID}">
        <div class="cp_ProductList__itemInfo">
          <div class="cp_Basket__itemName">${productInfo.name}</div>
        </div>
        <div class="cp_Basket__itemPrice">£<span class="cp_Basket__itemPriceValue" data-basket="itemPrice">${productInfo.price}</span></div>
        <div class="cp_Basket__itemActions">
          <a href="#" class="cp_Basket__removeAction" data-basket-action="remove">Remove</a>
        </div>
      </div>
      `
    },

    /**
     * Builds the item UI and add it to the page
     * @function
     */
    buildItem = function () {
      //console.log('itemProductID', itemProductID);
      // Set the productInfo variable by getting the product information from the App model
      productInfo = App.model.getProductInfo(itemProductID);
      // Build the Basket Item markup and set a variable to a jQuery object containing this structure
      $thisBasketItem = $(buildItemMarkup());
      // Append the new basket item to the DOM
      $basketList.append($thisBasketItem);

      // Now that the list item has been created and added to the DOM we can bind custom message listeners to it.
      bindCustomMessageEvents();
      subscribeToEvents();
    }

    /**
     * Bind Custom Events to allow Object messaging
     * These are event listeners for custom events that act as the functional interface
     * for the component, and allow functionality to be controlled either internally or externally
     * in the same way.
     * @function
     */
    bindCustomMessageEvents = function () {
      $thisBasketItem.on('updatePrice', function(e) {
        e.preventDefault();
        //console.log('updated price');
      });
      //
      $thisBasketItem.on('removeItem', function(e) {
        e.preventDefault();
        $thisBasketItem.remove();
        $.publish('basket/updated');
      });
    },

    /**
     * Subscribe object to Global Messages
     * @function
     */
    subscribeToEvents = function () {
      // Not currently used, but I've left the stub here for future development
    };

    /**
     * The init function to initialise each instance of this 'class'
     * @function
     */
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
      var currencies = App.model.getAppSettings().currencies;
      //console.log(currencies);

      for (var currency in currencies) {
        var optionTemplate = '<option value="' + currency + '"> ' + currencies[currency].name + '</option>';
        $thisCurrencySwitcher.append($(optionTemplate));
      }
    },

    /**
     * Switch the current currency in the App model and set this component to "updating" mode until it is complete
     * @function
     */
    switchCurrencies = function () {
      App.model.setCurrentCurrency($thisCurrencySwitcher.val());
      //console.log(App.model.getCurrentCurrency());
      $thisCurrencySwitcher.addClass('is_Updating');
    },

    /**
     * Switch this component from 'updating' mode
     * @function
     */
    completeSwitch = function () {
      $thisCurrencySwitcher.removeClass('is_Updating');
    },

    /**
     * Bind Custom Events to allow Object messaging
     * These are event listeners for custom events that act as the functional interface
     * for the component, and allow functionality to be controlled either internally or externally
     * in the same way.
     * @function
     */
    bindCustomMessageEvents = function () {
      $thisCurrencySwitcher.on('changeCurrency', function(e) {
        e.preventDefault();
        switchCurrencies();
      });

      $thisCurrencySwitcher.on('ratesUpdated', function(e) {
        e.preventDefault();
        completeSwitch();
      });
    },

    /**
     * Subscribe object to Global Messages
     * @function
     */
    subscribeToEvents = function () {
      $.subscribe("rates/updated", function () {
        $(this).trigger("ratesUpdated");
      } , $thisCurrencySwitcher);
    };

    /**
     * The init function to initialise each instance of this 'class'
     * @function
     */
    this.init = function () {
      // The base element for this UI component is already on the page, so we don't need to wait until after the
      // options are added to the menu before setting up the related event listeners and message subscriptions.
      bindCustomMessageEvents();
      subscribeToEvents();
      buildSwitcherMenu();

      // This fakes use of the Currency Switcher control and causes the App to get an initial set of
      // exchange rates data
      $.publish('currency/switched');
    };
  },

  ///////////////
  // Functions //
  ///////////////

  /**
   * Builds a basket item based on a productID and add it to the basket
   * @function
   */
  addItemToBasket = function (productID) {
    // Create a BasketItem object (which adds itself to the basket UI)
    var newBasketItem = new BasketItem(productID).init();
    // Publish a basket/updated message, which will initiate other basket-related functionality,
    // such as updated the basket total
    $.publish('basket/updated');
  },

  /**
   * Creates delegate event listeners for this module
   * @function
   */
  delegateEvents = function () {
    App.events.delegate("click", selBasketItemRemoveButton, "removeItem");
    App.events.delegate("click", selBasketItemCheckoutButton, "checkout");
    App.events.delegate("click", selBasketItemPaymentButton, "payment");
    App.events.delegate("click", selBasketItemReturnLink, "shop");
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
    $(selBasket).each(function() {
      var newBasket = new Basket(this).init();
    });

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
