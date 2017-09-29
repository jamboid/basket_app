var App = App || {};

// App.apis.js

App.apis = (function($) {

  const

    /**
     * Check the status of the fetch response and return the response if okay,
     * or handle the error if needed.
     * @function
     */
    handleErrors = function (response) {
      // If the response is not ok
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response;
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
      .then(function(response) {
        return response;
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
