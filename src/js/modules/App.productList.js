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
