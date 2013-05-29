/*! openspending.colors.js - Color palettes for OpenSpending
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

// Define OpenSpending object (if used as a separate module)
var OpenSpending = OpenSpending || {};
// Define Colors property
OpenSpending.Colors = OpenSpending.Colors || {};

// Default color palette for openspendingjs
OpenSpending.Colors.Palette = ["#CA221D", "#C22769", "#3F93E1", 
			       "#481B79", "#6AAC32", "#42928F",
			       "#D32645", "#CD531C", "#EDC92D",
			       "#A5B425", "#211D79", "#449256",
			       "#7A2077", "#CA221D", "#E29826",
			       "#44913D", "#2458A3", "#2458A3",
			       "#14388C"];

OpenSpending.Colors.getColorPalette = function (palette_length) {
    // Initialize an empty color array
    var colors = [];
    // Loop over palette length and add a color to the array
    for (var i = 0; i < palette_length; i++) {
	// We add colors in order (using modulo to loop around)
	colors.push(OpenSpending.Colors.Palette[i % (OpenSpending.Colors.Palette.length-1)]);
    }
    // Return the color palette
    return colors;
}
