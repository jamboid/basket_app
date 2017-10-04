# Basket App

## Introduction

This project is a multi-currency check-out basket web app prototype, created for BJSS.

## App architecture

The app has a (very) loose MVC structure and consists of the following main elements:

* A responsive HTML UI.
* A Sass framework, following the principles of my own 'Fuzz' framework (https://github.com/jamboid/Fuzz), generating the associated CSS.
* A series of JavaScript modules based on the Revealing Module pattern.

## Dependencies

3rd-party JavaScript libraries used in the app are:
* jQuery, used primarily for DOM manipulation
* jQuery.pubsub, a simple publish/subscribe library
* Moment, a library used for the manipulation of dates and times

These libraries are all included locally and compiled into the single App.js file in the /build folder.

## The Currency API

The app uses the CurrencyLayer API, what appears to be the successor to the jsonrates.com API specified in the assignment.

I have used 4 currencies:

* British Pounds
* Euros
* US Dollars
* Canadian Dollars

## Build Process

I've used the Codekit app (Mac-only, I'm afraid) to automate the build process for the app. Files in the /src folder are compiled to the /build folder. If you have access to Codekit, the config file for the project is included, but this isn't required as the /build folder is included.

The following processes occur:

* Build of the index.html file from an index.kit template file
* Build of a single CSS file (screen.css) from Sass precursor files
* Build of a single App.js file by simple concatenation of the precursor module files and local libraries

## Running the App

The App can be run by opening the build/index.html file directly into a browser, or using a localhost environment. The currency API is the only external resource that is used by the app.

## Author

**Jamie Boyd**

+ http://github.com/jamboid
+ http://jamieboyd.net
