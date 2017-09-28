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
