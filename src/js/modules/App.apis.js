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
        $.publish('ajax/error');
        throw new TypeError("Sorry, we haven't got JSON!");
      }

      $.publish('ajax/error');
      throw Error(response.statusText);
      // Publish an error message to let the UI components know about the error

    },

    /**
     * This is an function to abstract a GET Ajax call to a JSON endpoint, currently using the Fetch API
     * Future development would make this a more generic function, where the endpoint content type could be
     * passed as a parameter.
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
     * This is an function stub to abstract a POST Ajax call, not used in this version of the App,
     * but could be used in the future.
     * @function
     */
    post = function(endpoint) {
      //console.log('Not implemented yet');
      return null;
    },

    /**
     * This is the initialsation function for the module
     * @function
     */
    init = function() {
      //console.log("App.apis initialised");
      // Not currently used for anything, and therefore not called in App.js
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
