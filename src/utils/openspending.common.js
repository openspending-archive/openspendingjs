/*! openspending.common.js - Common javascript utils for openspendingjs
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


var OpenSpending = OpenSpending || {};
OpenSpending.Common = OpenSpending.Common || {};

// Parse a URL query string (?xyz=abc...) into a javascript object.
OpenSpending.Common.parseQueryString = function(querystring) {
    // Get query string (either provided or we get it from the current window
    var query = querystring || window.location.search.substring(1);

    // The javascript object we'll fill in and return
    var urlParams = {};

    // Tiny cleanup function
    var clean = function (param) {
	// We replace all + with whitespace and return in unescaped
	return unescape(param.replace(/\+/g, " "));
    };

    // Parameter regular expression (even though they're not cool with urls
    var regexp = /([^&=]+)=?([^&]*)/g;
    // Object to hold the regexp matches
    var matches = undefined;

    // While the regular expression finds matches
    while (matches = regexp.exec(query)) {
	// Create a property in urlParams with the key and set the
	// parameter value as its value
	urlParams[clean(matches[1])] = clean(matches[2]);
    }

    // Return the parameter object
    return urlParams;
};
