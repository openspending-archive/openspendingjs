/*! openspending.taxman.js - Taxman API tools
 * ------------------------------------------------------------------------
 *
 * Copyright 2013 Open Knowledge Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Define OpenSpending object
var OpenSpending = OpenSpending || {};

// Taxman constructor
OpenSpending.Taxman = function( options ) {
    // To make taxes accessible from the instance we need
    // to assign this to self
    var self = this;
    this.taxes = undefined;

    // Create the configuration
    var config = $.extend(true, {}, OpenSpending.Taxman.defaults, options);

    // Provide a get function that fetches the taxes for the given amount
    this.get = function(income) {
	// First we parse the income in case it needs some changes (this
	// also sets it in the right place in the opts
	config.incomeparser(income);

	// Then we call the taxman api with the opts and the country
	var rq = $.getJSON(
	    config.site + '/'+config.country+'?callback=?',
	    config.opts)
	    .done(function(data) {
		// We parse the taxes via the success function in the config
		// and set them as the instance variable taxes
		self.taxes = config.success(data);
		// Use callback
		config.callback(self.taxes);
	    });
	
	// Using a callback isn't necessary. We return the deferred in case
	// using it is preferred over callback.
	return rq;
    };
};

// Default configuraiton for 
OpenSpending.Taxman.defaults = {
    site: 'http://taxman.openspending.org', // Taxman url
    country: undefined, // Two letter country code
    opts: { }, // Options to pass into the taxman api call
    callback: function(taxes) { }, // Callback function (taxes are passed in) 
    incomeparser: function(income) { // Parse income or assign differently
	this.opts.income = income;
    },
    success: function(data) { return data }, // Get taxes from the taxman api call
};