/*! jquery.bubbletree.js - Bubbletree visualisation for OpenSpending
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

/* REQUIREMENTS
 * Raphael.js
 * Underscore
 * jquery.history.js
 * Bubbletree
 * Vis4
 * Tween.js
 */

// Wrapping function into a statement
!function ($) {
    // The main bubbletree function (this is where the magic happens!)
    $.bubbletree = function( element, options ) {
	// Create a jQuery object out of our element
        $element = $(element);
        // We have to set width with css since it's computed from the css
        $element.css('width', $element.width());
        // We cheat a bit, since it's a circle height will be
        // the same as width
        $element.css('height', $element.width());
        $element.addClass('openspending-bt');

        // Get the configuration
        var config = $.extend(true, {}, $.bubbletree.defaults,
                              $.bubbletree.domopts(element), options);
       
	// The state of is stored in this context
	var state = {
	    aggregated_csv_url: config.data.aggregated_csv_url,
	    drilldowns: config.data.drilldowns,
	    breakdown: config.data.breakdown
	};

	var dataLoaded = function(data) {
	    // Add a tooltip to the bubbletree
	    var $tooltip = $('<div class="tooltip">Tooltip</div>');
	    $element.append($tooltip);
	    $tooltip.hide();

	    self.bubbleTree = new BubbleTree({
		data: data,
		container: $element,
		bubbleType: config.style.bubbletype,
		clearColors: config.style.clearcolor,
		bubbleStyles: config.style,
		tooltip: {
		    qtip: true,
		    delay: 800,
		    content: function(node) {
			var formattedAmount = OpenSpending.Amounts.format(node.amount,0,node.currency);
			return [node.label, (node.description ? '<div class="desc">'+ node.description + '</div>' : '') + '<div class="amount">'+formattedAmount+'</div>'];
		    }
		}
	    });
	};

	var update = function() {
	    $element.empty();
	    self.state = state;
	    
	    var cuts = [];

	    for (var field in config.data.cuts) {
		// If the cuts is an array we add eac one of them as a
		// separate cut
		if (_.isArray(config.data.cuts[field])) {
		    _.each(config.data.cuts[field], function(value) {
			cuts.push(field + ':' + value);
		    });
		}
		// If it's not an array we just add it as it is
		else {
		    cuts.push(field + ':' + config.data.cuts[field]);
		}
	    }

	    // If a year has been defined we add it as a cut
	    if (config.data.year) {
		cuts.push('time.year:' + config.data.year);
	    }
	    if (state.aggregated_csv_url) {
		var csvloader = new OpenSpending.CSVloader();
		csvloader.get({
		    amount_col_name: config.data.amount_col_name,
		    currency: config.data.currency,
     		    aggregated_csv_url: config.data.aggregated_csv_url,
                    labels: config.data.labels,
		    callback: dataLoaded
		});
	    } else if (state.drilldowns) {
		// call openspending api for data
		var aggregator = new OpenSpending.Aggregator();
		aggregator.get({
		    siteUrl: config.data.site,
		    dataset: config.data.dataset,
		    rootNodeLabel: config.root.label,
		    drilldowns: state.drilldowns,
                    inflate: config.data.inflate,
		    cuts: cuts,
		    breakdown: state.breakdown,
		    callback: dataLoaded
		});
	    }
	};

	var initialize = function() {
	    $element.addClass("bubbletree-widget");
	    var $tooltip = $('<div class="tooltip"/>');
	    $element.append($tooltip);
	    $tooltip.hide();
	    
	    update(self.state);  
	};

	// Call initialize to start the visualisation.
	initialize();
    };

    // Define the bubbletree defaults
    $.bubbletree.defaults = {
	// Dataset related information
	data: {
	    // Website that holds the dataset (and the OS OLAP api)
	    site: 'https://openspending.org/',
	    // The dataset
	    dataset: undefined,
	    // Breakdown of data
	    breakdown: [],
	    // Drilldowns
            drilldowns: [],
	    // Year to fetch
            year: undefined,
	    // Cuts to make to the dataset
            cuts: {},
            inflate: undefined,
	},
	root: {
	    label: 'Total'
	},
	// Function triggered when a bubble is clicked
	click: function(e) { return true; },
	style: {
	    bubbletype: 'icon',
	    clearcolor: false,
	    radius: {
		max: 40,
		padding: 10
	    },
	    icons: {
		svg: OpenSpending.Icons.Cofog,
		path: 'https://rawgit.com/openspending/openspendingjs/master/src/svg/'
	    },
	    colors: OpenSpending.Colors.Cofog
	},
	currency: undefined
    };

    // HTML5 data configurations. The dom element is passed into the function
    // and returns an object with properties that can overwrite the default
    // ones (defined above). All javascript functions in the defaults cannot
    // be overwritten with data attributes).
    $.bubbletree.domopts = function(element) {
        // Get the jQuery object for our element
        var $element = $(element);
        return {
	    data: {
		site: $element.attr('data-site'),
		dataset: $element.attr('data-dataset'),
                drilldowns: $(element).attr('data-drilldowns') ?
                    $element.attr('data-drilldowns').split(',') : undefined,
                year: $element.attr('data-year'),
                // If cuts are defined they should be defined as a json string
                // i.e. a key value object
                cuts: $(element).attr('data-cuts') ?
                    JSON.parse($element.attr('data-cuts')) : undefined,
                inflate: $element.attr('data-inflate')
	    },
	    style: {
		radius: {
		    max: $element.attr('data-max-radius'),
		    padding: $element.attr('data-radius-padding')
		},
		icons: {
		    path: $element.attr('data-icons-path')
		}
	    },
            currency: $element.attr('data-currency'),
	};
    };

    // Extend jquery's prototype with the dailybread function that runs through
    // all dom elements and passes them, along with the options to the
    // dailybread function
    $.fn.extend({
	bubbletree: function(options) {
            if(options == undefined) options = {};
            this.each(function() {
                $.bubbletree( this, options);
            });
        }
    });

    // On load we automatically create a dailybread for all dom elments that
    // have the 'dailybread' class and a dataset attribute set and a country
    $('.bubbletree').bubbletree();

}(jQuery);
