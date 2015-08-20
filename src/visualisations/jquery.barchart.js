/* jquery.barchart.js - Barchart creator
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

    // barchart function to create the overview of multiple years in the given dom element with
    // the given options
    $.barchart  = function ( element, options ) {

        // Create a jQuery object out of our element
        var $element = $(element);

        //Extend (copy the options object to prevent the function from
        // changing it (and rendering it unusable for other functions)
        var config = $.extend(true, {}, $.barchart.defaults,
                              $.barchart.domopts(element), options);

        //Create the paper we use to draw the bar chart
        var paper = Raphael(element, config.width, config.height);


        // The main function, this one draws up the bar chart
        var create_barchart = function(node) {
            // Get max amount in the children
            var max_value = _.max(node.children, function (item) {
                return item.amount;
            });

            // Compute the width of each bar
            var bar_width = config.width / node.children.length;

            // Clear the paper (if we're reusing it for a new bar chart
            // for example when we drilldown
            paper.clear();

            // Loop through the node children (sorted by label)
            _.each(_.sortBy(node.children, function(item) {
                return item.label;
            }), function(item, index) {
                
                // Comput the height of the bar for this node item and how it
                // relates to the max value amount. We use Math.ceil to ensure
                // that if a bar should be 0.<something> it will at least be
                // 1px high
                var bar_height = Math.ceil(
                    (item.amount / max_value.amount) * config.height);

                // The diameter represents the visible bar (diameter of the
                // bubble on top). Even though the bar is allocated the
                // bar_width value we create a "gutter" by reducing the
                // visible site, we also compute the radius and the x and y
                // coordinates for the bar
                var diameter = (bar_width-10);
                // If there configuration asks us to not include the bubble
                // on top we set the radius as zero since it gets subtracted
                // from the bar height
                var radius = config.style.bubbletop ? diameter/2 : 0;
                var xcoord = bar_width*index;
                var ycoord = config.height - bar_height;
                // Speed of animation for the visualisation
                var speed = 500;

                // Draw the bar as a rectangle with height 0 and positioned at
                // the bottom of the screen (because we'll animate it). We
                // get the colour from the configuration
                var bar = paper.rect(xcoord, config.height, diameter, 0)
                    .attr({
                        fill:config.style.colors.getColor(item, index),
                        stroke:'none'
                    });

                // Create the animation for the bar (but don't execute it
                // since it will be executed later). Here we set the actual
                // height of the bar and y coordinate (because of the reversed
                // y axis). The height of the bar is the height minus the
                // radius of the bubble (ends on top)
                var bar_anim = Raphael.animation(
                    {y: ycoord+radius, height: bar_height-radius}, speed
                );

                // We create a transparent block on top of everything. This
                // enables the tooltips and click functionality
                var overlay = paper.rect(xcoord, 0, diameter, config.height)
                    .attr({'fill':'#fff', 'opacity':0});

                // Create the mouse pointer tooltip
                var tooltip = {
                    'content': config.style.labels.tooltip.content(item),
                    'position': {
                        'target':'mouse',
                        'adjust':{x:7, y:7},
                    }
                };
                // We use jquery.qtip to render the tooltip
                $(overlay.node).qtip(tooltip);

                // Configure the click functionality
                overlay.click(function() { 
                    // We get the click functionality from the
                    // configuration. This can stop the drilldown
                    // by returning false
                    var continue_click = config.click(node);
                    if (continue_click) {
                        // Drilldown into this item to show its children
                        create_barchart(item);
                    }
                });
                
                // If the configurations asks for a bubble on top we can now
                // draw it
                if (config.style.bubbletop) {
                    // Create and position the bubble center where the bar is
                    // bottom of visualisation so the bubble travels the same
                    // distance as the bar, again the color comes from the
                    // configuration and is the same as the bar
                    var bubble = paper.circle(xcoord+radius,
                                              config.height,radius)
                        .attr({
                            fill:config.style.colors.getColor(item, index), 
                            stroke:'none'
                        });
                    
                    // Add icon filename fetched via the config to the bubble
                    bubble.data('icon', 
                                config.style.icons.svg.getIcon(item.name));
		    console.log(item.name);
                    // Add a homemade bbox to the bubble since the current one
                    // is the initial position and not the final position 
                    // (after animation)
                    bubble.data('bbox', {
                        x:xcoord, y:ycoord, width:diameter, height:diameter
                    });
                    // Add the overlay to 
                    bubble.data('overlay', overlay);

                    // Final position of the center of the bubble on the y axis
                    final_bubblepos = {cy:ycoord+radius};
                    // If the bar height is more than the radius we will have
                    // to animate both at the same time so that it looks like
                    // the bar with the bubble on top grows as it is (if it is
                    // less than (or even equal) the bar won't even show so
                    // there would be no point in animating it
                    if (bar_height > radius) {
                        // When the animation is done we draw the icon
                        // this will cause some lag in bars drawn later,
                        // especially in older computers, as the icon rendering
                        // is kind of heavy. We also pass in a callback that
                        // pushes the overlay to the front.
                        bubble.animateWith(
                            bar, bar.animate(bar_anim), final_bubblepos, speed,
                            'linear', function() {
                                draw_icon(bubble, function() {
                                    overlay.toFront();
                                });
                            });
                    }
                    else {
                        // If we end up here we only have to animate the bubble
                        // not the bar
                        var bubble_anim = Raphael.animation(
                            final_bubblepos, speed
                        );
                        bubble.animate(bubble_anim);
                    }
                }
                else {
                    // If we end up here the config has told us that we should
                    // not draw the bubble so we only have to animate the bar
                    bar.animate(bar_anim);
                }

                // If the config calls for labels we draw them up
                if (config.style.labels) {
                    // The bar's label/name (title) and the amount (value)
                    // Position doesn't really matter as we will rotate and
                    // move the label later on
                    var label = paper.text(
                        xcoord, ycoord+radius,
                        config.style.labels.title.content(item)
                    );
                    var amount = paper.text(
                        xcoord, ycoord+radius,
                        config.style.labels.value.content(item)
                    );

                    // Get the bounding box for the label to see if we have
                    // to fade it out (in case it's too long for the bar
                    var labelbox = label.getBBox();
                    // We choose to fade out if the label is longer than the
                    // bar from bottom until the bubble starts (so in case of
                    // no bubbles the text will have some space after it before
                    // it reaches the end of the bar
                    if ((bar_height-diameter) < labelbox.width) {
                        // Find the ration between the bar and the label
                        var ratio = (bar_height-diameter) / labelbox.width;
                        // We will start fading when we reach 80% of the bar
                        // and stop fading at the second stop (bar-diameter)
                        var first_stop = 80*ratio;
                        var second_stop = ratio;
                        // If the first stop is negative we leave it transparent
                        if (first_stop < 0) { label.attr({'fill-opacity':0}) }
                        else {
                            // Set the label gradient. Fill-opacity only applies
                            // to the last stop so that's why we have the first
                            // and the second stop
                            label.attr({
                                fill:'0-'+
                                    config.style.labels.title.color+':'+
                                    first_stop+'-'+
                                    config.style.labels.title.color+':'+
                                    second_stop,
                                'fill-opacity':0
                            });
                        }
                    }
                    // If the label is shorter we can just fill in with the
                    // color from the config
                    else { 
                        label.attr({
                            fill: config.style.labels.title.color
                        });
                    }

                    // Transform the label. First we rotate it 270 degrees
                    // then we translate it 10 in direction x and the height
                    // of the visualisation minus the center of the label
                    // which puts it at the visualisation height and then we
                    // subtract 10 pixels to draw it slightly from the bottom
                    label.transform(
                        'r270T10,'+
                            (config.height-(labelbox.y+labelbox.width/2)-10)
                    );

                    // Amount label is simpler than the title label in that
                    // we don't muck about with gradients, either we show the
                    // amount label or not (same constraints as for the title
                    // label
                    var amountbox = amount.getBBox();
                    if ((bar_height-diameter) < amountbox.width) {
                        amount.attr({'fill-opacity':0});
                    }
                    else {
                        amount.attr({
                            fill:config.style.labels.value.color
                        });
                    }
                    
                    // We do the same transformation as with the title label
                    // except for how we position it on the x axis, we translate
                    // it to 10 pixels from the diameter
                    amount.transform(
                        'r270T'+(diameter-10)+','+
                            (config.height-(amountbox.y+amountbox.width/2)-10)
                    );
                }
                // End by putting the overlay at the top (for example if the
                // bubble isn't drawn and the overlay to front callback doesn't
                // get called
                overlay.toFront();
            });

            var draw_icon = function(bubble, callback) {
                var icon = config.style.icons.path + bubble.data('icon');
                if (icon) {
                    $.get(icon).then(function(svg) {
                        // Create a jquery dom element from the svg
                        if (typeof svg === "string") {
                            svg = $(svg);
                            // Get the last element in case there are many
                            svg = svg[svg.length-1];
                        }
                        
                        // If getElementsByTagName is not supported we return
                        if (!svg.getElementsByTagName) return;
                        
                        // Get the path element of the svg and join their d
                        // attributes together
                        var joined = '';
                        var paths = svg.getElementsByTagName('path');
                        for (var j=0; j < paths.length; j++) 
                            joined += paths[j].getAttribute('d')+' ';
                        
                        // Create the path on the paper and push it to the
                        // visualisations
                        var iconpath = paper.path(joined);
                        
                        // No stroke but fill with the foreground color
                        iconpath.attr({
                            fill: '#fff',
                            stroke: 'none'
                        });
                        
                        // Get the bounding box of the icon path to scale it
                        // correctly
                        var bbox = iconpath.getBBox();
                        // Center the icon within the circle
                        bubble_box = bubble.data('bbox');
                        iconpath.translate(
                            (bubble_box.x+bubble_box.width/2)-
                                (bbox.x+bbox.width/2),
                            (bubble_box.y+bubble_box.height/2)-
                                (bbox.y+bbox.height/2));
                        
                        // Scale the icon to be 60% of circle
                        var iconsize = bubble_box.width*0.6;
                        var scale = iconsize / Math.max(bbox.width,bbox.height);
                        iconpath.scale(scale, scale);
                        callback();
                    });
                }
            };
        };

        var initialize = function() {
            // Initialize cut array
            var cuts = [];
            // For each cut we push it to the cuts array with a semicolon in
            // between because that's how OpenSpending reads the cuts
            for (var field in config.data.cuts) {
                cuts.push(field + ':' + config.data.cuts[field]);
            }

            //Run the openspending aggregator to get all info from the database
            // and return result to the execute function
	    if (config.data.aggregated_csv_url) {
		var csvloader = new OpenSpending.CSVloader();
		csvloader.get({
		    amount_col_name: config.data.amount_col_name,
		    currency: config.data.currency,
		    aggregated_csv_url: config.data.aggregated_csv_url,
		    callback: create_barchart
		});
	    } else if (config.data.drilldowns) {
		var aggregator = new OpenSpending.Aggregator();
		aggregator.get({
                    siteUrl: config.data.site,
                    dataset: config.data.dataset,
                    drilldowns: config.data.drilldowns,
                    inflate: config.data.inflate,
                    cuts: cuts,
                    rootNodeLabel: 'total',
                    callback: create_barchart
            });
	    }
        };

        //run the initialize function
        initialize();

    };

    // Define the barchart defaults
    $.barchart.defaults = {
	// Dataset related information
	data: {
	    // Website that holds the dataset (and the OS OLAP api)
	    site: 'https://openspending.org/',
	    // The dataset
	    dataset: undefined,
	    // Drilldowns
            drilldowns: [],
	    // Year to fetch
            year: undefined,
	    // Cuts to make to the dataset
            cuts: {},
            inflate: undefined,
	},
	click: function(node) { return true; },
	// Visualisation defaults, height, width and embed (which is important
	// when linking to the original data after drilling down far enough)
	width: 600,
	height: 400,
        style: {
            bubbletop: true,
            labels: {
                title: { 
                    content: function(node) {
                        return node.label;
                    },
                    color: '#fff'
                },
                value: {
                    content: function(node) {
                        return OpenSpending.Amounts.shorthand(node.amount);
                    },
                    color: '#fff'
                },
                tooltip: {
                    content: function(node) {
                        return node.label+': '+
                            OpenSpending.Amounts.format(node.amount, 0,
                                                        node.currency);
                    }
                }
            },
            colors: OpenSpending.Colors.Cofog,
            icons: {
		svg: OpenSpending.Icons.Cofog,
		path: 'https://rawgit.com/openspending/openspendingjs/master/src/svg/'
	    },
        },
        currency: undefined
    }

    // HTML5 data configurations. The dom element is passed into the function
    // and returns an object with properties that can overwrite the default
    // ones (defined above). All javascript functions in the defaults cannot
    // be overwritten with data attributes).
    $.barchart.domopts = function(element) {
        // Get the jQuery object for our element
        var $element = $(element);
        return {
	    data: {
		site: $element.attr('data-site'),
		dataset: $element.attr('data-dataset'),
                drilldowns: $element.attr('data-drilldowns') ?
                    $element.attr('data-drilldowns').split(',') : undefined,
                year: $element.attr('data-year'),
                // If cuts are defined they should be defined as a json string
                // i.e. a key value object
                cuts: $element.attr('data-cuts') ?
                    JSON.parse($element.attr('data-cuts')) : undefined,
                inflate: $element.attr('data-inflate')
	    },
            width: $element.attr('data-width'),
            height: $element.attr('data-height'),
            style: {
                colors: $element.attr('data-color') ? {
                    getColor: function() { 
                        return $element.attr('data-color');
                    }
                } : undefined,
		icons: {
		    path: $element.attr('data-icons-path')
		}
            }
        }
    }

    // Extend jquery's prototype with the barchart function that runs through
    // all dom elements and passes them, along with the options to the
    // barchart function
    $.fn.extend({
        barchart: function(options) {
            if(options == undefined) options = {};
            this.each(function() {
                $.barchart( this, options);
            });
        }
    });

    // On load we automatically create a barchart for all dom elments that have
    // the 'barchart' class and a dataset attribute set
    $('.barchart[data-dataset]').barchart();

}(jQuery);
