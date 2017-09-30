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
        App.utils.init();
        App.apis.init();
        App.exchange.init();

        $.publish('rates/update');

        
        // var testGet = App.exchange.getExchangeRate('AUD')
        // .then(function(response) {
        //   App.utils.cl(response);
        // });
      });
    };

    // Automatically call Modules.init function
    return Modules.init();

}(jQuery));

console.log('at the end');


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

  const

    /**
     * Check the status of the fetch response and return the response if okay,
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
    },

    /**
     * This is an function to abstract a GET Ajax call, currently using the Fetch API
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
      App.utils.cl('Not implemented yet');
      return null;
    },

    init = function() {
      App.utils.cl("App.apis initialised");
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

  var

  settings = {
    'currencyAPI': {
      'endpoint': 'http://apilayer.net/api/live?access_key=65790386c71ca815956382ad28ed41c9&format=1&currencies=USD,GBP,EUR,AUD,CAD',
      'rateAPIKey': '65790386c71ca815956382ad28ed41c9',
      'rateDomain': 'http://apilayer.net/api/live'
    }
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

  var $body = $("body").eq(0),

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
      App.utils.cl("App.events initialised");
      //bindGlobalMessages();
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
  getExchangeRate = function(newCurrency) {
    // If the exchangeRates object has been populated with data
    // i.e. the timeStamp value has been set, return the rates
    // for the given currency, otherwise return null.
    if(exchangeRates.timeStamp !== '') {
      return exchangeRates.rates[newCurrency];
    } else {
      return null;
    }
  },

  /**
   * Sets the new exchange rates.
   * @function
   */
  setRates = function (newRates,baseCurrency) {
    App.utils.cl(newRates);

    /*
    The free version of the currencylayer API used currently only provides exchange
    rates against the US Dollar, so we need to cross calculate the exchange rates for
    any other base currency (in this case the British Pound).
    */

    // Set rates in the exchangeRates.rates object
    for (var key in newRates) {
      if (newRates.hasOwnProperty(key)) {
        // Calculate the exchange rate against the base currency
        var rateAgainstBaseCurrency  = newRates[key] / newRates[baseCurrency];

        // Set the calculated rate in the exchangeRates object
        exchangeRates.rates[key] = rateAgainstBaseCurrency;
      }
    }

    // Update the timeStamp for the rates
    exchangeRates.timeStamp = new Date();

    // Publish a message stating the rates have been updated
    $.publish('rates/updated');

    // Log the newly update exchangeRates object
    App.utils.cl(exchangeRates);
  },

  getUpdatedCurrenctRates = function (newCurrency) {
    App.utils.cl('update rates...');
    var newRates = App.apis.get(App.config.settings.currencyAPI.endpoint)
    .then(function(data) {
      // Set updated exchange rates, against a base currency
      setRates(data.quotes,'USDGBP');
    });
  },

  /**
   * Subscribe object to Global Messages
   * @function
   */
  subscribeToMessages = function () {
      // Subscrive to layoutchange event to trigger scroller's updateLayout method
    $.subscribe("rates/update", function () {
      getUpdatedCurrenctRates();
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
    getExchangeRate:getExchangeRate,
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
    getExchangeRate:getExchangeRate
  }
}())


// App.utils.js
var App = App || {};

App.utils = (function($) {
  "use strict";

  ///////////////
  // Variables //
  ///////////////

  const debugMode = true,

    ///////////////
    // Functions //
    ///////////////

    /**
     * Console.log function with check for browsers that don't support it
     * @function
     */
    logMessage = function(logMessage) {
      if (debugMode === true) {
        if (typeof window.console !== 'undefined') {
          if (typeof window.console.log !== 'undefined') {
            window.console.log(logMessage);
          }
        }
      }
    },

    /**
     * Get maximum height of a set of elements
     * @function
     */
    getMaxHeight = function(elements) {
      var theseElements = elements,
        maxHeight = 0,
        currentHeight = 0;
      $(theseElements).css('min-height', "");
      $(theseElements).each(function() {
        currentHeight = $(this).height();
        if (currentHeight > maxHeight) {
          maxHeight = currentHeight;
        }
      });
      return maxHeight;
    },

    /**
     * Equalise the minimum heights of a set of elements
     * @function
     */
    equaliseMinHeights = function(elements) {
      var theseElements = elements,
        maxHeight = getMaxHeight(theseElements);

      getMaxHeight(theseElements);
      $(theseElements).css('min-height', maxHeight);
    },

    /**
         * Check if placeholder attribute is supported
         * @function
         */
    //        DEPRECATED - USE MODERNIZR TEST INSTEAD
    //         placeholderIsSupported = function () {
    //           var test = document.createElement('input');
    //           return ('placeholder' in test);
    //         },

    /**
     * Read a page's GET URL query string variables and return them as an associative array.
     * @function
     */
    getURLQueryString = function() {
      var vars = [],
        hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    },

    /**
     * Convert any encoded characters in a string to their unencoded versions
     * - e.g. &amp to &
     * @function
     */
    decodeCharacters = function(text) {
      var elem = document.createElement('textarea');
      elem.innerHTML = text;
      return elem.value;
    },

    /**
     * Check if element is currently displayed in the viewport - returns bool
     * @function
     */
    isElementInView = function(element) {
      var $element = $(element),
        $window = $(window),
        windowHeight = $window.height(),
        scrollTop = $window.scrollTop(),
        elementOffset = $element.offset(),
        elementTop = elementOffset.top,
        elementHeight = $element.outerHeight(),
        elementBottom = elementTop + elementHeight,
        screenBottom = scrollTop + windowHeight;

      if (elementTop < screenBottom && elementBottom > scrollTop) {
        return true;
      } else if (elementBottom > scrollTop && elementBottom < screenBottom) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Remove the style attribute from an element
     * @function
     */
    resetStyles = function(element) {
      $(element).removeAttr("style");
    },

    /**
     * Add "odd" and "even" classes
     * @function
     */
    addOddAndEvenClasses = function(elements) {
      var $theseElements = $(elements);
      $theseElements.filter(':nth-child(2n-1)').addClass('odd');
      $theseElements.filter(':nth-child(2n)').addClass('even');
    },

    /**
     * Initialise this module
     * @function
     */
    init = function() {
      App.utils.cl("App.utils.init called");
    };

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {
    cl: logMessage,
    rs: resetStyles,
    equaliseMinHeights: equaliseMinHeights,
    getURLQueryString: getURLQueryString,
    isElementInView: isElementInView,
    addOddAndEvenClasses: addOddAndEvenClasses,
    decode: decodeCharacters,
    init: init
  };

}(jQuery));


