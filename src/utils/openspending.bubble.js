/*! openspending.bubble.js - Core OS visualisation component: The bubble
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
 */

// Create a bubble function that can be called. This is implemented as a
// reusable visualisation: http://bost.ocks.org/mike/chart/
function bubble() {
    // Default values
    var radius = 35; // bubble radius
    var background = '#830242'; // background color
    var foreground = '#eee'; // foreground color
    var innercircle = true; // should inner (dashed) circle be shown
    var active = false; // is the bubble active (store state)
    var icon = undefined; // path to svg icon

    // Main visualisation function (draw the bubble)
    function visualisation(selection) {
	// For each dom element in selection
	selection.each(function(d, i) {
	    // Empty the element of any inner html
	    $(i).empty();
	    // Create a new Raphael paper for the element
	    var paper = Raphael(i, radius*2, radius*2+5);
	    // Add a set to the paper
	    var visualisation_set = paper.set();

	    // Push to the paper a circle with the background color set to none
	    // if the bubble is active, else to the background color
	    visualisation_set.push(
		paper.circle(radius, radius, radius).attr({ 
		    fill: active ? 'none' : background,
		    stroke: 'none'
		})
	    );

	    // If the inner circle is true we draw it
	    if (innercircle) {
		// Add a circle with radius of 2 px less than the main
		// circle to the paper. This circle down not get filled
		// but uses only dashed strokes in the foreground color
		// (which is not shown if the bubble is active)
		visualisation_set.push(
		    paper.circle(radius , radius, radius-2).attr({
			fill: 'none',
			stroke: active ? 'none' : foreground,
			'stroke-dasharray': '- '
		    })
		);
	    }

	    // If icon is defined we need to fetch the svg and draw it
	    if (icon) {
		$.get(icon).then(function(svg) {
		    // Create a jquery dom element from the svg
		    if (typeof(svg) == "string") {
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
		    visualisation_set.push(iconpath);

		    // No stroke but fill with the foreground color
		    iconpath.attr({
			fill: foreground,
			stroke: 'none'
		    });

		    // Get the bounding box of the icon path to scale it
		    // correctly
		    var bbox = iconpath.getBBox();

		    // Center the icon within the circle
		    iconpath.translate(radius-(bbox.x+bbox.width/2),
				       radius-(bbox.y+bbox.height/2));
		    
		    // Scale the icon to be 70% of circle
		    var iconsize = radius*2*0.7;
		    var scale = iconsize / Math.max(bbox.width,bbox.height);
		    iconpath.scale(scale, scale);
		    
		});
	    }
	});
    }
    
    // Getter-setter function for radius
    visualisation.radius = function(value) {
	if (!arguments.length) return radius;
	radius = value;
	return visualisation;
    };

    // Getter-setter function for background color
    visualisation.background = function(value) {
	if (!arguments.length) return background;
	background = value;
	return visualisation;
    };

    // Getter-setter function for foreground color
    visualisation.foreground = function(value) {
	if (!arguments.length) return foreground;
	foreground = value;
	return visualisation;
    }

    // Getter-setter function for inner circle
    visualisation.inner = function(value) {
	if (!arguments.length) return innercircle;
	innercircle = value;
	return visualisation;
    }

    // Getter-setter function for svg icon path
    visualisation.icon = function(value) {
	if (!arguments.length) return icon;
	icon = value;
	return visualisation;
    };

    // Getter-setter function for active state boolean
    visualisation.active = function(value) {
        if (!arguments.length) return active;
	active = value;
	return visualisation;
    };

    // Return the visualisation function
    return visualisation;
};
