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


// App.apis.js

App.apis = (function($) {

  const

    handleError = function (response) {
        return response.ok ? response : Promise.reject(response.statusText);
    },

    /**
     * Abstract function for GET Ajax call using fetch API
     * @function
     */
    get = function(endpoint) {
      return window.fetch(endpoint, {
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/json'
        })
      })
      .then(handleError)
      .catch( error => { throw new Error(error) });
    },

    /**
     * Abstract function for POST Ajax call using fetch API
     * @function
     */
    post = function(endpoint) {},

    init = function() {
      App.utils.cl("App.apis initialised");
    };

  ////////////////////////////////
  // Return Module's Public API //
  ////////////////////////////////

  return {init: init, get: get, post: post};

})(jQuery);


// App.events.js

// Check if base namespace is defined so it isn't overwritten

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


// App.utils.js

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


