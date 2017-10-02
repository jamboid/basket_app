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
      console.log('Not implemented yet');
      return null;
    },

    init = function() {
      console.log("App.apis initialised");
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
