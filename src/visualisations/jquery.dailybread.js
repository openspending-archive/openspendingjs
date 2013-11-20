/*! jquery.dailybread.js - Dailybread visualisation for OpenSpending
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
 * Underscore
 */

// Wrapping function into a statement
!function ($) {
    // Jargon used throughout:
    // * slice (a specific category where money is being spent,
    //          visualised with a bubble)

    // The main dailybread function (this is where the magic happens!)
    $.dailybread = function( element, options ) {
	// Create a jQuery object out of our element
        var $element = $(element);
	// Define a taxman instance that'll be accessible within this scope
	var taxman = undefined;

        // Get the configuration
        var config = $.extend(true, {}, $.dailybread.defaults,
                              $.dailybread.domopts(element), options);
	
	// Create a dom element representing the slice of the daily bread
	var create_slice = function(node, width, color) {
	    // Dom element, with width set from arguments
            var $slice = $('<div class="slice"/>')
                .css('width', width);

	    // Add the node label as a h5 header with class header
            var $label = $('<h5 class="header" />')
		.text(node.label);

	    // Create the bubble container div with node id as the id
	    var $bubble = $('<div class="bubble" />')
		.attr('id', node.id);

	    // Compute the radius. Radius is either fixed (set in config)
	    // or the minimum of the maximum radius supplied via the config
	    // and the computed width/2 with padding (configurable).
	    // This ensures that the bubble won't exceed a maximum size
	    var radius = config.style.radius.fixed || 
		Math.min(width/2-config.style.radius.padding, 
			 config.style.radius.max);

	    // If the node has children we make it clickable. If the node has
	    // only one child and that child has the same label we don't make
	    // the node clickable (since user's would just click and get the
	    // same node again.
	    var children_keys = _.keys(node.children);
	    var clickable = (children_keys.length > 1) ||
		(children_keys.length === 1 && 
		 node.children[children_keys[0]].label !== node.label)

	    // Create the bubble visualisation with an icon fetched from the
	    // svg function defined in config, with the computed radius, an
	    // inner circle if it's clickable and a background that comes from
	    // a color paletted defined in the config
	    var b = bubble()
		.icon(config.style.icons.svg.getIcon(node.name,
						     config.style.icons.path))
		.radius(radius)
	        .inner(clickable)
		.background(config.style.colors.getColor(node.name));

	    // Draw the bubble
	    b.call(this, $bubble);
	    // Set the bubble as data on the slice element
	    $slice.data('bubble', b);

	    // Define what happens if the slice is clicked
	    $slice.click(function(e) {
		// Users can overwrite the click via the config
		// If this returns true the default click behaviour also
		// happens (might need a better way to solve this)
		var continue_click = config.click(e);

		// If the bubble is clickable and click should continue we
		// activate the bubble. We check for clickability here instead
		// of outside $slice.click because we want the user defined
		// function to be triggered for all slices
		if (clickable && continue_click) {
		    // For each active slice in this node's taxonomy we
		    // inverse the color (sibling node that had been selected
		    // before) and remove the active class
		    $('.'+node.data.taxonomy+' .active.slice')
			.each(function(i) {
			    inverse_colors($(this))
			    $(this).removeClass('active');
			});
		    
		    // If this node is not active now, we make it active
		    if (!b.active()) $slice.addClass('active');
		    // Then we inverse the colors (which activates active state)
		    inverse_colors($slice);
		    // Then we make this node the root node for a new row of
		    // children
		    makeRoot(node);
		}
	    });

	    // Create the amount paragraph and add the node's key as a data
	    // attribute as well as the node's percentage (this is for tax
	    // updates
	    var $amount = $('<p class="amount" />')
	        .data('key', node.key)
		.data('percentage', node.data.percentage)

	    // Compute the amount and initially we use only the direct tax
	    // (if present)
	    var amount = node.data.percentage * (taxman.taxes.direct || 0);
	    // For each node we also add the contributions. base on the node's
	    // key (which should match the contribution's key.
	    $.each(node.key, function(index, value) {
		amount += taxman.taxes.contributions[value].total;
	    });

	    // Add the amount, formatted with OpenSpending.Amounts to the
	    // amount div. We divide the amount with the configurable division
	    // so that it can be changed based on how to divide the salary
	    // (monthly salary needs to divide by ~30 for daily amount etc.)
	    $amount.text(
		OpenSpending.Amounts.format(
		    (amount / config.salary.division),
		    2, config.currency
		)
	    );
	
	    // Add the label, bubble and amount to the slice
	    $slice.append($label);
	    $slice.append($bubble);
	    $slice.append($amount);

	    return $slice;
	};

	// Function that updates the amount on each slice of the daily bread
	var update_slices = function( amount, contributions ) {
		$('.amount').each(function(i) {
		    $slice = $(this);
		    
		    // The slice's percent of the amount
		    var slice_tax = $slice.data('percentage') * amount;
		    
		    // For each key in the slice we add the extra budgetary tax
		    $.each($slice.data('key'), function(index, value) {
			slice_tax += contributions[value].total;
		    });
		    
		    // Add the slice's tax as the text to the dom element with
		    // the amount class
		    $slice.text(
			OpenSpending.Amounts.format(
			    (slice_tax / config.salary.division),
			    2, config.currency
			)
		    );
		});
	    };

	// Inverse the colors of a bubble in an element
	var inverse_colors = function($elem) {
	    // We store the bubble visualisation itself as data in the element
	    var b = $elem.data('bubble')
	    
	    // Get the current activity state and inverse it
	    b.active(!b.active());

	    // Here's the real inversion
	    // Store the background color
	    var bg = b.background();
	    // Set the background color as the foreground color
	    b.background(b.foreground());
	    // Set the foreground color as the background color
	    b.foreground(bg);
	    
	    // Redraw the bubble in the element
	    b.call(this, $elem.find('.bubble'));
	};

	// Create a row of nodes (slices)
	var create_row = function(nodes) {
	    // First we sort them according to the inherent order (descending)
	    // The order is computed amount so that the slice with the highest
	    // amount comes first (tax + contributions)
	    var children = _.sortBy(nodes, function(item) { 
		return -item.order;
	    });

	    // Create a row of slices as a div element and append to our element
	    var $row = $('<div class="slices"/>')
	    $element.append($row);

	    // Compute the width of the children (width of row divided by
	    // the number of children)
	    var width = Math.floor($row.width() / children.length);

	    // Then we add each child as a slice to the row
	    $.each(children, function(i) {
		$row.append(create_slice(this, width));
	    });
	   
	    return $row;
	}

	// Create a daily bread data node from a OpenSpending tree node
	var create_node = function(node, parent) {
	    // If no parent is defined we fake it
	    if (parent === undefined) {
		parent = {};
	    }

	    
            var datanode = {
                id: node.id, // Id of the node
                label: node.label || node.name, // Label for the node
		name: node.name, // OpenSpending name of the node
		amount: node.amount,
		key: node.key || [], // Key if defined (for contributions)
		children: {},
                data: { // Extra data
		    taxonomy: node.taxonomy || (node.data||{}).taxonomy,
                    node: node, // The node itself
                    currency: node.currency, // The currency of the amount
                    percentage: ((parent.data || {}).percentage || 1) * ((node.amount || 0) / (parent.amount || node.amount)), // percentage of the total (need to base this off the parent's percentage because we can only base it on the parent's amount
                }
            };

	    // Add the order which is based on the amount of direct tax
	    datanode.order = datanode.data.percentage * taxman.taxes.direct;

	    // We create the children of the node as well recursively
	    for (var index in (node.children || [])) {
		var child = node.children[index];
		datanode.children[child.name] = create_node(child, datanode);
	    }

	    return datanode;
	};

	// Add extra budgetary nodes to a node's children
	var add_extra_nodes = function(node, extra_items, name_length) {
	    // Filter out from the extra nodes defined in the config only
	    // those that are rleated to this node
	    var levels = _.filter(extra_items, function(item){
		// The extra budgetary node has to start with this node's
		// name (or else it won't be included). This might need to
		// be configurable.
		return item.name.lastIndexOf((node.name || ''), 0) === 0;
	    });

	    // For each of the extra budgetary nodes we add them to the
	    // node's children
	    _.each(levels, function(item) {
		// First we get the extra budgetary node's name by fetching
		// a substring with the same length as the children's name
		// This assumes all children have the same lenght of names
		var name = item.name.substr(0, name_length);

		// If the node's key hasn't been added to the parent we add it
		// since we want to include this node's amount in the parent
		// node's amount
		if (!_.contains(node.key, item.key)) {
		    node.key.push(item.key);
		}

		// Try to get a child that matches the name (this is because
		// the children in this row could be higher up in the
		// taxonomy and could be shared with others)
		var matching_child = node.children[name];
		// If we don't find a matching child we create it and let it
		// be a clone of this extra budgetary node (and append it to
		// children)
		if (matching_child === undefined) {
		    var matching_child = create_node(_.clone(item), node);
		    matching_child.key = [];
		    node.children[name] = matching_child;
		}
		
		// If the extra budgetary node's key isn't in the matching
		// child's key array we add it
		if (!_.contains(matching_child.key, item.key)) {
		    matching_child.key.push(item.key);
		}

		// We then update the order of the matching child based on
		// the contribution for this extra budgetary item
		matching_child.order += taxman.taxes.contributions[item.key].total;

	    });
	};

        // Set a node as the root node
        var makeRoot = function(node) {
            // Create the node (and place it as it's own parent)
	    var datanode = create_node(node, node);
	    // We need the first child since they are drawn and we need to
	    // use the data related to them for classification
	    var child = _.values(datanode.children)[0];
	    var taxonomy = child.data.taxonomy;

	    // Add extra budgetary items defined in config.data.extra
	    add_extra_nodes(datanode, config.data.extra, child.name.length);

	    // Update the config currency (if not set)
	    config.currency = config.currency || datanode.data.currency;

	    // Create a row with the datanode's children
            var $row = create_row(datanode.children);
	    // Find the subclasses of the the data node's taxonomy
	    // (children's taxonomy inclusive)
	    var classes = config.data.drilldowns.slice(
		config.data.drilldowns.indexOf(taxonomy));
	    // Remove all rows with taxonomies for the datanode's children
	    // or it's sub taxonomies (clear the rows).
	    $('.'+classes.join(', .')).remove();
	    // Add this child taxonomy to it's row.
	    $row.addClass(taxonomy);
	};

	// Initialize the visualisation (this function gets called automatically
	var initialize = function() {
	    // Add cuts to a local variable
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

	    // Create a OpenSpending.Taxman instance with defaults that
	    // come from the config (except for success and callback)
	    taxman = new OpenSpending.Taxman({ 
		country: config.taxman.country,
		opts: config.taxman.opts,
		incomeparser: config.taxman.income,
		// This should probably be configurable since taxman output
		// is not standardised
		success: function(data) {
		    return {
			direct: data.calculation.income_tax,
			indirect: data.calculation.indirects.vat,
			
			total: data.calculation.income_tax+data.calculation.indirects.vat,
			contributions: data.calculation.contributions
		    };
		},
		// This should probably be configurable as well for the
		// same reason as success function
		callback: function(taxes) {
		    var total = controls.checkbox.attr('checked') ?
			taxes.direct + taxes.indirect : taxes.direct;
		    controls.tax(total+taxes.contributions.total);
		    update_slices(total, taxes.contributions);
		} 
	    });

	    // Create a new controls instance with the config and slider
	    // functions
	    var controls = new $.dailybread.controls( 
		config,
		function(event, slider) { // While sliding function
		    this.salary(slider.value);
		},
		function(event, slider) { // Slide finished function
		    this.salary(slider.value);
		    taxman.get(slider.value);
		}
	    );

	    // Add the controls container to our element
	    $element.html(controls.container);
	    
	    // Set the controls salary as the initial salary
	    controls.salary(config.salary.initial);

	    // Add a change event listener that updates the total and
	    // the slices when the controls checkbox (for the indirects)
	    // is changed
	    controls.checkbox.change(function() {
		var total = $(this).attr('checked') ?
		    taxman.taxes.total : taxman.taxes.direct;
		controls.tax(total+taxman.taxes.contributions.total);
		update_slices(total, taxman.taxes.contributions);
	    });

	    // Get tax based on the salary from the taxman
	    // This returns a deferred which we use for the api call
	    var deferred = taxman.get(config.salary.initial);

	    // If there are drilldowns (they are necessary)
	    if (config.data.drilldowns) {
		// When we've got the taxes we can fetch the data with the
		// aggregator (standard stuff here)
                deferred.done(function(data) {
		    var aggregator = new OpenSpending.Aggregator();
		    aggregator.get({
			siteUrl: config.data.site,
			dataset: config.data.dataset,
			drilldowns: config.data.drilldowns,
			cuts: cuts,
			rootNodeLabel: 'Total',
			callback: makeRoot
                    });
		});
            }
	};

	// Call initialize to start the visualisation.
	initialize();
    };

    // Dailybread controls
    $.dailybread.controls = function( config, slide, change ) {
	// We need to be able to access this object from subobjects
	var self = this;

	// The controls wrapper appended to the element
	this.container = $('<div class="controls" />')

	// Salary element contains a h3 heading with the taxman salary text 
	// and a paragraph (that contains the salary amount)
	this.salary = function( value ) {
	    if ( !arguments.length ) {
		return $('<div class="salary" />')
		    .append(
			$('<h3/>')
			    .append(config.taxman.docs.salary)
		    )
		    .append('<p></p>');
	    }
	    else {
		$('.salary p').text(
		    OpenSpending.Amounts.format(value, 0, config.currency)
		);
	    }
	};

	// Append it to the controls wrapper
	this.container.append(this.salary());

	// The salary slider, contains a h2 heading with the taxman slider text
	// This gets called to create a jquery ui slider
	this.slider = $('<div class="slider" />')
	    .append(
		$('<h2/>')
		    .append(config.taxman.docs.slider)
	    )
	    .append(
		$('<div />')
		    .slider({ // Create a slider
			value: config.salary.initial,
			min: config.salary.min,
			max: config.salary.max,
			step: config.salary.step,
			animate: true,
			slide: function () { 
			    slide.apply(self, arguments) 
			},
			change: function () { 
			    change.apply(self, arguments)
			}
		    })
	    );

	// Append it to the controls wrapper
	this.container.append(this.slider);

	// Tax element contains a h3 heading with the taxman tax text 
	// and a paragraph (that will contains the tax amount)
	this.tax = function( value ) {
	    if (!arguments.length) {
		return $('<div class="tax" />')
		    .append(
			$('<h3/>')
			    .append(config.taxman.docs.tax)
		    )
		    .append('<p></p>');
	    }
	    else {
		$('.tax p').text(
		    OpenSpending.Amounts.format(value, 0, config.currency)
		);
	    }
	};
	
	// Append it to the controls wrapper
	this.container.append(this.tax());

	// If indirects are included we add a checkbox
	if (config.taxman.opts.indirects) {
	    var assumption = $('<span/>')
		.css({'color':'#828282',
		      'font-size':'12px'})
		.append(config.taxman.docs.assumption);
	    this.checkbox = $('<input type="checkbox" name="indirects"/>')
	    this.indirects = $('<div class="indirects" />')
		.append(
		    $('<label></label>')
			.append(this.checkbox)
			.append(config.taxman.docs.indirects+' ')
			.append(assumption)
		);
  
	    this.container.append(this.indirects);
	}
    };

    // Define the dailybread defaults
    $.dailybread.defaults = {
	// Dataset related information
	data: {
	    // Website that holds the dataset (and the OS OLAP api)
	    site: 'http://openspending.org/',
	    // The dataset
	    dataset: undefined,
	    // Drilldowns
            drilldowns: [],
	    // Year to fetch
            year: undefined,
	    // Cuts to make to the dataset
            cuts: {},
	    // Extra budgetary items perhaphs not in the dataset but present
	    // within taxman response (social contributions)
	    extra: [],
	},
	// Function triggered when a bubble is clicked
	click: function(e) { return true; },
	// Salary related configurations
        salary: {
	    division: 1, // Divide the salary by this number to get the daily
	                 // amount (e.g. 30 for a monthly salary)
    	    initial: 0, // Initial salary
	    min: 0, // Minimum salary
	    max: 0, // Maximum salary
	    step: 0 // Salary step on the slider
	},
	// Taxman related configurations
	taxman: {
	    country: undefined, // Two letter country code
	    docs: { // Text used in the visualisation controls
		salary: 'Salary', // Text above the salary amount
		tax: 'Your tax', // Text above the tax amount
		slider: 'Select your salary', // Text above the slider
		indirects: 'Include indirect taxes?', // Include indirects text
		assumption: 'Assumes you spend all of your net salary'
	    },
	    opts: {}, // Options for taxman
	    // Special function that parses and maps amount to income in opts
	    income: function(amount) { this.opts.income = amount; }
	},
	style: {
	    radius: {
		max: 40,
		padding: 10
	    },
	    icons: {
		svg: OpenSpending.Icons.Cofog,
		path: '/icons/'
	    },
	    colors: OpenSpending.Colors.Cofog
	},
	currency: undefined
    };

    // HTML5 data configurations. The dom element is passed into the function
    // and returns an object with properties that can overwrite the default
    // ones (defined above). All javascript functions in the defaults cannot
    // be overwritten with data attributes).
    $.dailybread.domopts = function(element) {
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
                    JSON.parse($element.attr('data-cuts')) : undefined		
	    },
            salary: {
		division: $element.attr('data-salary-division'),
    		initial: $element.attr('data-salary-initial'),
		min: $element.attr('data-salary-minimum'),
		max: $element.attr('data-salary-maximum'),
		step: $element.attr('data-salary-step')
	    },
	    taxman: {
		country: $element.attr('data-taxman-country'),
		docs: { // Text used in the visualisation controls
		    salary: $element.attr('data-taxman-docs-salary'),
		    tax: $element.attr('data-taxman-docs-tax'),
		    slider: $element.attr('data-taxman-docs-slider'),
		    indirects: $element.attr('data-taxman-docs-indirects')
		}
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
        dailybread: function(options) {
            if(options == undefined) options = {};
            this.each(function() {
                $.dailybread( this, options);
            });
        }
    });

    // On load we automatically create a dailybread for all dom elments that
    // have the 'dailybread' class and a dataset attribute set and a country
    $('.dailybreads').dailybread();

}(jQuery);
