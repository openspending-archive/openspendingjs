/* jquery.treemap.js - Treemap creator
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
 * thejit
 */

!function ($) {

    // Treemap function to create the treemap in the given dom element with
    // the given options
    $.treemap  = function ( element, options ) {
	// Create a jQuery object out of our element
	var $element = $(element);
	
	// The element has to have an id in order for it to be drawn
	// Therefore we give it a random one if it doesn't have and id
	if (!$element.attr('id')) {
	    $element.attr('id', Math.random().toString().substr(2));
	}

	// Get the configuration
	var config = $.extend(true, {}, $.treemap.defaults,
			      $.treemap.domopts(element), options);

	// Initial state of treemap (based on configuration)
	var state = {
	    drilldowns: config.data.drilldowns,
	    cuts: config.data.cuts,
	    year: config.data.year
	};

	// Draw the treemap from the given data
	var draw = function (data) {
	    // Empty the element (e.g. if there was another treemap there)
	    $element.empty();
	    // If there are no children we can't draw anything so we hide
	    // and stop any drawing
	    if (!data.children.length) {
		$element.hide();
		return;
	    }
	    // If the element is hidden, we show it
	    $element.show();
	    
	    // Here's the biggie! We use Javascript Infovis Toolkit to draw
	    // the treemap for us and provide a whole lot of configurations
	    var tm = new $jit.TM.Squarified({
		// We inject it into our element
		injectInto: element,
		// Width and height come from the configs
		width: config.width,
		height: config.height,
		// We don't show any sublevels (that's just confusing)
		levelsToShow: 1,
		// We don't show a title (we use label)
		titleHeight: 0,
		// Animations come from the transition config
		animate: config.transition.animate,
		transition: config.transition.type,
		duration: config.transition.duration,
		// The offset of the tiles
		offset: 2,
		// Label styles
		Label: {
		    type: 'HTML',
		    size: 12,
		    family: 'Tahoma, Verdana, Arial',
		    color: '#DDE7F0'
		},
		//Add the name of the node in the corresponding label
		//This method is called once, on label creation and only for
		//DOM labels.
		onCreateLabel: function(domElement, node){
		    config.node.label(domElement, node);
		},
		// Tooltip options
		Tips: {
		    enable: true,
		    type: 'Native',
		    offsetX: 20,
		    offsetY: 20,
		    onShow: function(tip, node) {
			tip.innerHTML = config.node.tooltip(node);
		    }  
		},
		// Node styles
		Node: {
		    color: '#243448',
		    CanvasStyles: {
			shadowBlur: 0,
			shadowColor: '#000'
		    }
		},
		// User interaction
		Events: {
		    // We have to enable event handling
		    enable: true,
		    // User clicks a node (we call it tile to avoid confusion)
		    onClick: function(tile) {
			if(tile) {
			    // Perform a click from the config
			    var continue_click = config.click(tile);
			    // If the configurable click function returns a
			    // true value we continue with default behaviour
			    if (continue_click) {
				// If the node has children we set it as primary
				// node
				if (tile.data.node.children.length) {
				    makeRoot(tile.data.node);
				}
				// If the node doesn't have children we visit the
				// html url for that node on OpenSpending
				else {
				    if (tile.data.link) {
					var link = this.embed ? tile.data.link + '?embed=true' : tile.data.link;
					document.location.href = link
				    }
				    // If there isn't an html url we just let the
				    // user know
				    else {
					alert("Not able to go any further");
				    }
				}
			    }
			}
		    },
		    // When the user hovers over the node we change it's color
		    onMouseEnter: function(node, eventInfo, e) {
			if(node) {
			    if (node.data.link === undefined) {
				$element
				    .find('#'+node.id)
				    .css('cursor', 'default');
			    }
			    node.setCanvasStyle('shadowBlur', 8);
			    node.orig_color = node.getData('color');
			    node.setData('color', '#A3B3C7');
			    tm.fx.plotNode(node, tm.canvas);
			}
		    },
		    // Change the color back when the user quits hovering around
		    onMouseLeave: function(node) {
			if(node) {
			    node.removeData('color');
			    node.removeCanvasStyle('shadowBlur');
			    node.setData('color', node.orig_color);
			    tm.plot();
			}
		    }
		},
		//Implement this method for retrieving a requested  
		//subtree that has as root a node with id = nodeId,  
		//and level as depth. This method could also make a 
		//server-side call for the requested subtree.
		request: function(nodeId, level, onComplete){  
		    var tree = json;  
		    var subtree = $jit.json.getSubtree(tree, nodeId);  
		    $jit.json.prune(subtree, 1);
		    onComplete.onComplete(nodeId, subtree);
		}
	    });
	    // Load the data into the treemap and refresh it
	    tm.loadJSON(data);
	    tm.refresh();
	};

	// Set a node as the root node
	var makeRoot = function(node) {
	    // Create the representation (we need information about the node's
	    // children which we'll draw
	    var data = {children: _.map(node.children, function(item, index) {
		// For every child we return the following data
		return {
		    id: item.id, // Id of the node
		    name: item.label || item.name, // Name of the node
		    data: {
			node: item, // The node itself
			value: item.amount, // The value of the node
			currency: item.currency, // The currency of the amount
			percentage: (item.amount / node.amount)*100, // % total
			$area: item.amount, // Size of the tile
			link: item.html_url, // Link to data
			// Color is either set in the item or we get it using
			// the configured colorscale (that has getColor)
			$color: item.color || 
                            config.colorscale.getColor(item, index)
		    }
		};
	    })};

	    // After creating the node data we draw it
	    draw(data);
	};

	// Initialization function (interprets the state, fetches the data
	//and create the root node (via a callback)
	var initialize = function() {
	    // Set drilldowns
	    state.drilldowns = state.drilldowns || [state.drilldown];
	    // Set cuts (or non if empty)
	    state.cuts = state.cuts || {};
	    // Initialize cut array
	    var cuts = [];
	    
	    // For each cut we push it to the cuts array with a semicolon in
	    // between because that's how OpenSpending reads the cuts
	    for (var field in state.cuts) {
		cuts.push(field + ':' + state.cuts[field]);
	    }

	    // If there's a year set in the state we add that as a special cut
	    // which is identified by 'time.year'
	    if (state.year) {
		cuts.push('time.year:' + state.year);
	    }

	    // If there are any drilldowns we fetch the dataset of the config
	    // using OpenSpending's Aggregator and send the output to the
	    // makeRoot function (to set the root node)
	    if (state.drilldowns) {
                var aggregator = new OpenSpending.Aggregator();
		aggregator.get({
		    siteUrl: config.data.site,
		    dataset: config.data.dataset,
		    drilldowns: state.drilldowns,
		    cuts: cuts,
		    rootNodeLabel: 'Total',
		    callback: makeRoot
		});
	    }
	};	
	
	// After defining all the functions we add a treemap-widget class
	// (which is used in the css)
	$element.addClass("treemap-widget");
	// Call the initialisation function
	initialize();
    };


    // Define the treemp defaults
    $.treemap.defaults = {
	// Define the data, drilldowns, year, cuts (almost no default here 
	// except the url to the central openspending platform (and drilldowns)
	data: {
	    site: 'https://openspending.org',
	    dataset: undefined,
	    // We put from and to as default values because they are common
	    drilldowns: [],
	    year: undefined,
	    cuts: {}
	},
	click: function(tile) { return true; },
	// Visualisation defaults, height, width and embed (which is important
	// when linking to the original data after drilling down far enough)
	width: 600,
	height: 400,
	embed: false,
	// Default colorscale to use (round robin of nice colors)
	colorscale: OpenSpending.Colors.DefaultPalette,
	// Animation/transition settings
	transition: {
	    animate: true, // Should it be animated?
	    // We use Javascript Infovis Toolkit's built in transition
	    type: $jit.Trans.Expo.easeOut,
	    duration: 1000 // Take one second to show the treemap
	},
	// Node settings
	node: {
	    // Define the label
	    label: function(domElement, node) {
		if (node.data.percentage > 3) {
		    domElement.innerHTML = 
			['<div class="desc"><div class="amount">',
			 // We format the amount using OpenSpending's Amounts
			 // and we include the currency
			 OpenSpending.Amounts.format(node.data.value, 0, node.data.currency),
			 '</div><div class="lbl">',
			 node.name,
			 '</div></div>'].join('')
		}
	    },
	    // Define the tooltip
	    tooltip: function(node) {
		return [node.name, ' (', 
			// We format the percentage of total with two decimals
			OpenSpending.Amounts.format(node.data.percentage, 2),
			'%)'].join('')
	    }
	}
    };

    // HTML5 data configurations. The dom element is passed into the function
    // and returns an object with properties that can overwrite the default
    // ones (defined above). All javascript functions in the defaults cannot
    // be overwritten with data attributes).
    $.treemap.domopts = function(element) {
	// Get the jQuery object for our element
	var $element = $(element);
	return {
	    data: {
		site: $element.attr('data-site'),
		dataset: $element.attr('data-dataset'),
		// If drilldowns are defined we split them on commas
		drilldowns: $(element).attr('data-drilldowns') ?
		    $element.attr('data-drilldowns').split(',') : undefined,
		year: $element.attr('data-year'),
		// If cuts are defined they should be defined as a json string
		// i.e. a key value object
		cuts: $(element).attr('data-cuts') ?
		    JSON.parse($element.attr('data-cuts')) : undefined
	    },
	    // Height and width of the treemap
	    width: $element.attr('data-width'),
	    height: $element.attr('data-height'),
	    // Only animation configuration we allow to set is duration
	    transition: {
		duration: $element.attr('data-duration')
	    }
	};
    };

    // Extend jquery's prototype with the treemap function that runs through
    // all dom elements and passes them, along with the options to the
    // treemap function
    $.fn.extend({
	treemap: function(options) {
	    if(options == undefined) options = {};
	    this.each(function() {
		$.treemap( this, options);
	    });
	}
    });

    // On load we automatically create a treemap for all dom elments that have
    // the 'treemap' class and a dataset attribute set
    $('.treemap[data-dataset]').treemap();

}(jQuery);
