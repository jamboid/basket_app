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
