/*!
 * JZ Publish/Subscribe
 * Version: 1.4
 * License: http://www.opensource.org/licenses/gpl-3.0.html
 * Docs: http://www.joezimjs.com/projects/publish-subscribe-jquery-plugin/
 * Repo: https://github.com/joezimjs/JZ-Publish-Subscribe-jQuery-Plugin
 */

;(function ($) {
	'use strict';

	var subscriptions = {},
		ctx = {},
		publishing = false,

		clone = function(arr) {
			return arr.slice(0);
		};

	/**
     * jQuery.subscribe( topics, callback[, context] )
     * - topics (String): 1 or more topic names, separated by a space, to subscribe to
     * - callback (Function): function to be called when the given topic(s) is published to
     * - context (Object): an object to call the function on
     * returns: { "topics": topics, "callback": callback } or null if invalid arguments
     */
	$.subscribe = function (topics, callback, context) {
		var topicArr,
			usedTopics = {};

		// If no context was set, assign an empty object to the context
		context = context || ctx;

		// Make sure that each argument is valid
		if ($.type(topics) !== "string" || !$.isFunction(callback)) {
			// If anything is invalid, return null
			return null;
		}

		// Split space-separated topics into an array of topics
		topicArr = topics.split(" ");

		// Iterate over each topic and individually subscribe the callback function to them
		$.each(topicArr, function (i, topic) {
			// If the topic is an empty string, skip it. This may happen if there is more than one space between topics
			// Also skip if this is a repeat topic (e.g. someone entered "topic1 topic1"). Otherwise mark it as used.
			if (topic === "" || usedTopics[topic]) {
				return true; // continue
			} else {
				// Mark the topic as used
				usedTopics[topic] = true;
			}

			// If the topic does not exist, create it
			if (!subscriptions[topic]) {
				subscriptions[topic] = [];
			}

			// Add the callback function to the end of the array of callbacks assigned to the specified topic
			subscriptions[topic].push([callback,context]);
		});

		// Return a handle that can be used to unsubscribe
		return { topics: topics, callback: callback, context:context };
	};

	/**
     * jQuery.unsubscribe( topics[, callback[, context]] )
     * - topics (String): 1 or more topic names, separated by a space, to unsubscribe from
     * - callback (Function): function to be removed from the topic's subscription list. If none is supplied, all functions are removed from given topic(s)
     * - context (Object): object that was used as the context in the jQuery.subscribe() call.
     */
	$.unsubscribe = function (topics, callback, context) {
		var topicArr,
			usedTopics = {};

		// topics must either be a string, or have a property named topics that is a string
		if (!topics || ($.type(topics) !== "string" && (!topics.topics || $.type(topics.topics) !== "string"))) {
			// If it isn't valid, return null
			return $;
		}

		// If the handler was used, then split the handle object into the two arguments
		if (topics.topics) {
			callback = callback || topics.callback;
			context = context || topics.context;
			topics = topics.topics;
		}

		// If no context was provided, then use the default context
		context = context || ctx;

		// Split space-separated topics into an array of topics
		topicArr = topics.split(" ");

		// Iterate over each topic and individually unsubscribe the callback function from them
		$.each(topicArr, function (i, topic) {
			var currTopic = subscriptions[topic];

			// If the topic is an empty string or doesn't exist in subscriptions, or is a repeat topic, skip it.
			// Otherwise mark the topic as used
			if (topic === "" || !currTopic || usedTopics[topic]) {
				return true; // continue
			} else {
				usedTopics[topic] = true;
			}

			// If no callback is given, then remove all subscriptions to this topic
			if (!callback || !$.isFunction(callback)) {
				delete subscriptions[topic];
			} else {
				// Otherwise a callback is specified; iterate through this topic to find the correct callback
				$.each(currTopic, function (i, subscription) {
					if (subscription[0] === callback && subscription[1] === context) {
						currTopic.splice(i, 1);
						return false; // break
					}
				});
			}
		});

		return $;
	};

	/**
     * jQuery.publish( topics[, data] )
     * - topics (String): the subscription topic(s) to publish to
     * - data: any data (in any format) you wish to give to the subscribers
     */
	$.publish = function (topics, data) {
		// Return null if topics isn't a string
		if (!topics || $.type(topics) !== "string") {
			return $;
		}

		// Split the topics up into an array of topics
		var topicArr = topics.split(" ");

		// Iterate over the topics and publish to each one
		$.each(topicArr, function (i, topic) {
			// If the topic is blank, skip to the next one
			if (topic === "") {
				return true; // continue
			}

			if (subscriptions[topic]) {
				// Clone the subscriptions we're publishing to so that we don't run into any errors if someone (un)subscribes during the publishing.
				var subs = clone(subscriptions[topic]);

				// Iterate over each subscriber and call the callback function
				$.each(subs, function (i, subscription) {
					subscription[0].call(subscription[1], topic, data);
				});
			}
		});

		return $;
	};

}(jQuery));

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


var App = App || {};

/*

App.apis.js

This module is responsible for sending and receiving Ajax call to remote APIs.
It provides an abstracted GET Ajax function that other modules can call, returning
a successfully received JSON object or handling any errors.

The Ajax functionality is currently implemented using the Fetch API, but can be
changed in the future without affecting function calls to it elsewhere in th app.

*/

App.apis = (function($) {

  var

    /**
     * Check the status of the fetch response, then process and return the response if okay,
     * or handle the error if needed.
     * @function
     */
    handleErrors = function (response) {
      // If the response is not ok
      if (response.ok) {
        var contentType = response.headers.get("content-type");
        if(contentType && contentType.includes("application/json")) {
          return response.json();
        }
        throw new TypeError("Sorry, we haven't got JSON!");
      }
      throw Error(response.statusText);
      // Publish an error message to let the UI components know about the error
      $.publish('ajax/error');
    },

    /**
     * This is an function to abstract a GET Ajax call to a JSON endpoint, currently using the Fetch API
     * @function
     */
    get = function(endpoint) {
      return window.fetch(endpoint, {
        method: 'GET',
        headers: new Headers({
          'Accept': 'application/json'
        })
      })
      // Handle any errors
      .then(handleErrors)
      // And if there are no errors, return the response
      .then(function(data) {
        return data;
      });
    },

    /**
     * This is an function stub to abstract a POST Ajax call
     * @function
     */
    post = function(endpoint) {
      //console.log('Not implemented yet');
      return null;
    },

    init = function() {
      //console.log("App.apis initialised");
    };

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    init: init,
    get: get,
    post: post
  };

})(jQuery);


var App = App || {};

App.config = (function() {

  var rateAPIKey = '65790386c71ca815956382ad28ed41c9',

  settings = {
    // Base currency used to create exchange rates, as API currently only provides exchange rates for USD
    "baseCurrency":"USDGBP",
    // Currencies supported by this app, including name and symbol for use in the app UI
    "currencies": {
      "GBP": {
        "name":"British Pounds",
        "symbol":"£"
      },
      "USD":{
        "name":"US Dollars",
        "symbol":"$"
      },
      "EUR": {
        "name":"Euros",
        "symbol":"€"
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


// App.events.js
var App = App || {};

// Create child namespace
App.events = (function($) {
  "use strict";

  ///////////////
  // Variables //
  ///////////////

  var $body,

    ///////////////
    // Functions //
    ///////////////

    /**
     * Bind custom Global events that will result in a "Publish" message being broadcast
     * @function
     */
    bindGlobalMessages = function() {

      // Handle page scroll
      // $(window).on("scroll", function() {
      //   $.publish("page/scroll");
      // });

      // Handle debounced resize
      // - requires the jquery.debouncedresize.js plugin
      // $(window).on("debouncedresize", function() {
      //   $.publish("page/resize");
      // });

      // Register Hammer touch events on body
      // This lets you treat these touch events as the normal delegate events
      // - CURRENTLY OVERKILL TO DO THIS - JUST BIND INDIVIDUAL COMPONENTS (e.g. See Carousel)
      //$body.hammer();

    },

    /**
     * Simple factory function to trigger a global message upon a delegated event
     * - note that preventDefault is only called if the preventBubble parameter is false
     * @function
     * @parameter eventType (string) - the event type we're listening for
     * @parameter selector (string) - the selector for the element event is triggered on
     * @parameter message (string) - the message we want to publish
     * @parameter preventBubble (boolean) - a boolean to control bubbling of the original event (true prevents the bubble, false allows it)
     *
     */
    createGlobalMessenger = function(eventType, selector, message, preventBubble) {

      $body.on(eventType, selector, function(e) {
        if (preventBubble) {
          e.preventDefault();
        }

        // The message is published with the event object (e) as attached data
        $.publish(message, e);
      });
    },

    /**
     * Simple factory function to bind a common delegated event listener to the <body> element
     * @function
     * @parameter eventType (string) - the event type we're listening for
     * @parameter selector (string) - the selector for the element event is triggered on
     * @parameter eventToTrigger (string) - custom event we want to send back to target element
     */
    createDelegatedEventListener = function(eventType, selector, eventToTrigger) {
      $body.on(eventType, selector, function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(e.target).trigger(eventToTrigger);
      });
    },

    /**
     * Initialise this module
     * @function
     */
    init = function() {
      //console.log("App.events initialised");
      //bindGlobalMessages();
      $body = $('body').eq(0);
    };

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    init: init,
    delegate: createDelegatedEventListener,
    global: createGlobalMessenger
  };

}(jQuery));


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
    exchangeRates.timeStamp = new Date();

    console.log(exchangeRates);

    // Publish a message stating the rates have been updated
    // This will let the other component subscribers know to update themselves
    $.publish('rates/updated');

    // Log the newly update exchangeRates object

  },

  /**
   * Call the currency API, using the App.apis module, and update the rates data with the result
   * @function
   */
  getUpdatedCurrencyRates = function () {
    //console.log('update rates...');
    var newRates = App.apis.get(App.config.settings.currencyAPI.endpoint)
    .then(function(data) {
      //console.log('data', data);
      // Set updated exchange rates, against a base currency
      setRates(data.quotes, App.config.settings.baseCurrency);
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
      console.log('get updated currency rates');
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


var App = App || {};

/*

App.productList.js

This module controls the functionality and display of the app's basket component.

*/
App.productList = (function ($) {
  var

  // Selectors for DOM elements
  selProductListItemAddButton = '[data-product-action=add]',

  // DOM elements
  $productListContainer = $('[data-product-list=items]'),

  //////////////////
  // Constructors //
  //////////////////

  /**
   * ProductListItem object constructor
   * Each item in the product list is controlled by an instance of this 'class'.
   * @constructor
   */
  ProductListItem = function (productID) {
    var thisProductID = productID,
        $thisProductListItem,
        productInfo,
        productListItemTemplate,


    buildProductListItemMarkup = function () {
      return `
      <div class="cp_ProductList__item gd_Group" data-product-id="${productInfo}">
        <div class="cp_ProductList__itemInfo">
          <h3 class="cp_ProductList__itemName hd_Luke">${productInfo.name}</h3>
        </div>
        <div class="cp_ProductList__cost">
          <div class="cp_ProductList__itemPrice hd_Luke">£${productInfo.price}</div>
          <div class="cp_ProductList__itemQuantity">${productInfo.quantity}</div>
        </div>
        <div class="cp_ProductList__itemActions">
          <a href="#" class="cp_ProductList__itemAdd ob_Button--pos ob_Button--list ob_Button" data-product-action="add">Add</a>
        </div>
      </div>`
    },

    /**
     * Builds the item
     * @function
     */
    buildProductListItem = function () {
      // Set the productInfo variable by getting the product information from the App model
      productInfo = App.model.getProductInfo(thisProductID);
      //console.log(thisProductID);
      // Build the Basket Item markup and set a variable to a jQuery object containing this structure
      $thisProductListItem = $(buildProductListItemMarkup());
      // Append the new basket item to the DOM
      $productListContainer.append($thisProductListItem);

      // Now that the list item has been created and added to the DOM we can bind custom message listeners to it.
      bindCustomMessageEvents();
    }

    /**
     * Bind Custom Events to allow Object messaging
     * @function
     */
    bindCustomMessageEvents = function () {
      $thisProductListItem.on('addItemToBasket', function(e) {
        e.preventDefault();
        App.basket.addItemToBasket(thisProductID);
      });
      //
      // $thisBasketItem.on('removeItem', function(e) {
      //   e.preventDefault();
      // });
    };

    this.init = function () {
      //console.log('ProductListItem initialised');
      buildProductListItem();
    };
  },



  ///////////////
  // Functions //
  ///////////////


  /**
   * Build the product list from the data in the App model
   * @function
   */
  buildProductList = function () {
    var products  = App.model.getProducts();
    //console.log('products', products);

    for (var product in products) {
      var productObj = new ProductListItem(product).init();
    }
  },

  /**
   * Create delegate event listeners for this module
   * @function
   */
  delegateEvents = function () {
    App.events.delegate("click", selProductListItemAddButton, "addItemToBasket");
  },

  /**
   * This is the initialsation function for the module
   * @function
   */
  init = function() {
    // Init functions...
    delegateEvents();
    buildProductList();
  }

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    init:init
  }
}(jQuery));


var App = App || {};

/*

App.basket.js

This module controls the functionality and display of the app's basket component.

*/
App.basket = (function ($) {
  var $body = $('body').eq(0),

  // Selectors for DOM elements
  selBasket = '[data-basket=component]',
  selBasketList = '[data-basket=list]',
  selBasketItem = '[data-basket-item]',
  selBasketItemPriceValue = '[data-basket=itemPrice]',
  selBasketItemRemoveButton = '[data-basket-action=remove]',
  selBasketItemCheckoutButton = '[data-basket-action=checkout]',
  selBasketItemReturnLink = '[data-basket-action=return]',
  selBasketTotal = '[data-basket=total]',
  selBasketCurrencySwitcher = 'select[data-basket=currency-switcher]',
  selBasketCurrencySwitcherOption = '[data-basket=currency-switcher] option',

  // DOM elements
  $basketList = $(selBasketList),

  // Basket Status



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
     * Calculate the total price of the basket items and convert to the current currency if
     * it differs from the default currency
     * @function
     */
    calculateTotal = function () {
      totalValue = 0,
      totalInCurrentCurrency = 0,

      $basketItems.each(function() {
        var itemInfo = App.model.getProductInfo($(this).data('basket-item'));
        console.log(itemInfo.price);

        totalValue = totalValue + parseFloat(itemInfo.price);
      });

      console.log(App.model.getCurrentCurrency());

      totalInCurrentCurrency = totalValue * App.exchange.getSingleExchangeRate(App.model.getCurrentCurrency());

      $basketTotal.text(totalInCurrentCurrency.toFixed(2));
    },

    /**
     * Check the contents of the basket and updated it's status accordingly
     * @function
     */
    checkBasketContents = function () {
      $basketItems = $thisBasket.find(selBasketItem);

      if($basketItems.length > 0) {
        basketIsEmpty = false;
        $thisBasket.removeClass('is_Empty');
        calculateTotal();
      } else {
        basketIsEmpty = true;
        $thisBasket.addClass('is_Empty');
        calculateTotal();
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
      } else {
        $body.removeClass('is_CheckingOut');
      }

    },

    /**
     * Bind Custom Events to allow Object messaging
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

      $thisBasket.on('shop', function(e) {
        e.preventDefault();
        setMode('shop');
      });

      $thisBasket.on('updateTotal', function(e) {
        e.preventDefault();
        calculateTotal();
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
          <a href="#" class="cp_Basket__removeAction ob_Button--neg ob_Button--list ob_Button" data-basket-action="remove">Remove</a>
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
        console.log('remove item');
        $thisBasketItem.remove();
        $.publish('basket/updated');
      });
    },

    /**
     * Subscribe object to Global Messages
     * @function
     */
    subscribeToEvents = function () {
      // Subscrive to layoutchange event to trigger scroller's updateLayout method
      // $.subscribe("currency/switched", function () {
      //   $(this).trigger("updatePrice");
      // } , $thisBasketItem);
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
      console.log(App.model.getCurrentCurrency());
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

  /**
   * Build a basket item based on a productID and add it to the basket
   * @function
   */
  addItemToBasket = function (productID) {
    var newBasketItem = new BasketItem(productID).init();
    $.publish('basket/updated');
  },

  /**
   * Create delegate event listeners for this module
   * @function
   */
  delegateEvents = function () {
    App.events.delegate("click", selBasketItemRemoveButton, "removeItem");
    App.events.delegate("click", selBasketItemCheckoutButton, "checkout");
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


