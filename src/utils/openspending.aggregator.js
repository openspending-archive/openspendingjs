/*! openspending.aggregator.js - Aggregation API tools
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

var OpenSpending = OpenSpending || {};

OpenSpending.Aggregator = function( ) {
    // Get the aggregator config based on a query string
    this.configFromQueryString = function(queryString) {
        // Parse the query string into an object
        var parts = OpenSpending.Common.parseQueryString(queryString);
        
        // Create the object we'll fill in an return
        var out = {};
        
        // Loop over the object with underscore's each which hands in
        // value and key. Based on key we fill in the output object
        _.each(parts, function(value, key) {
            if (key == 'breakdown') {
                out.breakdown = value;
            } else if (key == 'drilldown') {
                out.drilldowns = value.split('|');
            } else if (key == 'cut') {
                out.cuts = value.split('|');
            }
        });
        
        // Return the output
        return out;
    };

    // Aggregate the data (get data via the api)
    this.get = function (config) {
        var self = this;
        self.config = config;
        if (!self.config.processEntry) {
	    self.config.processEntry = function(e) { return e; }
        }
        
        // We want measure to be an array because we support multiple measures
        if (self.config.measure === undefined || _.isString(self.config.measure)) {
	    // Default measure value is amount
	    self.config.measure = [self.config.measure || 'amount'];
        }
        
        self.queryData = function () {
            var data = {}, config = self.config;
	    
            data.dataset = config.dataset;
            data.drilldown = config.drilldowns.join('|');
	    
            data.order = config.order;
            data.page = config.page;
            data.pagesize = config.pagesize;
            data.inflate = config.inflate;
	    
            if (config.cuts !== undefined) {
                data.cut = config.cuts.join('|');
            }
            
	    // We don't need to include amount since that's the default measure
	    if (_.isEqual(config.measure,['amount'])) {
	        data.measure = config.measure.join('|');
	    }
	    
            // add an optional breakdown to drilldowns to query the api
            var drilldowns = config.drilldowns.slice(); //copy
            if (config.breakdown !== undefined && config.breakdown.length) {
                drilldowns.push(config.breakdown);
            }
            drilldowns = jQuery.unique(drilldowns);
            data.drilldown = drilldowns.join('|');
            return data;
        };
        
        self.queryUrl = function() {
            var url, config = self.config;
            if (config.localApiCache !== undefined) {
                return config.localApiCache;
            }
            apiUrl = config.apiUrl || config.siteUrl + '/api';
            return apiUrl + '/2/aggregate?callback=?';
        };
        
        /**
         * Call the OpenSpending aggregate api function (/api/aggregate)
         * and build a tree that can be used by for the bubble charts
         *
         * @public getTree
         *
         * @param {string} api_url The url to the api,
         * e.g. 'http://openspending.org/api'
         * @param {string} dataset The name of the dataset, e.g. 'cra'
         * @param {array} drilldowns the dimensions to drill down to, e.g.
         * ['cofog1', 'cofog2', 'cofog3']
         * @param {array} cuts (optional) The array with cuts, each element in the
         * format 'key:value', e.g. ['time.from.year:2010']
         * @param {function} callback A function that will accept the root node
         * and builds the bubble chart.
         * @param {object} testDataPath (optional) An object with json (not jsonp)
         * test data. For testing only.
         **/
        
        self.getTree = function () {
            var data = self.queryData();
            
            jQuery.ajax({
                url: self.queryUrl(),
                cache: true,
                data: data,
                dataType: self.config.localApiCache !== undefined ?
                    'json' : 'jsonp',
                context: self,
                success: self.onJSONTreeLoaded
            });
        };
        
        self.getCSVURL = function() {
            var url = self.queryUrl();
            var data = self.queryData();
            data['format'] = 'csv';
            return url + '?' + jQuery.param(data);
        };
        /**
         *
         *
         */
        self.onJSONTreeLoaded = function (data) {
            var tree = self.buildTree(data);
            if (jQuery.isFunction(self.config.callback)) {
                self.config.callback(tree);
            }
        };
        
        /**
         * Build a tree form the drill down entries
         *
         * @public buildTree
         *
         * @param {object} data The json object responded from the
         * aggregate api.
         * @param {array} drilldowns List of drilldown criteria (strings)
         * @param {object} rootNode (optional) Pass an object with properties
         * for the root node. Maybe you want to set 'color' (default: #555) or
         * the 'label' (default: 'Total')
         **/
        self.buildTree = function (data) {
            var entries = data.drilldown,
            config = self.config,
            drilldowns = config.drilldowns,
            breakdown = config.breakdown,
            rootNode = {
                label: config.rootNodeLabel
            },
            nodes = {},
            root = {
                id: 'root',
                label: 'Total',
                color: '#555',
                children: [],
                level: 0,
                breakdowns: {}
            };
            
	    // We cheat a bit here. At the moment OpenSpending only stores
	    // currency for the dataset (as a whole) so we know that all of the
	    // measures will have the same currency. This will need to change
	    // when multiple currencies are supported and then we need to update
	    // all of the visualisations as well
	    root.currency = _.values(data.summary.currency)[0]
            
	    // Initial root value for all of the measures
	    _.each(self.config.measure, function(measure) {
	        root[measure] = 0.0;
	    });
	    
            if (rootNode !== undefined) {
                // extend root with the properties of rootNode
                jQuery.extend(true, root, rootNode);
            }
            nodes.root = root;
	    
            for (var i in drilldowns) {
                var drilldown = drilldowns[i];
                nodes[drilldown] = {};
            }
            if (data.errors !== undefined) {
                throw "Error";
            }
	    
            for (var index = 0; index < entries.length; index++ ) {
                var entry = self.config.processEntry(entries[index], data);
                self.processEntry(entry, nodes);
            }
	    
            return nodes.root;
	    
        };
        
        self.processEntry = function (entry, nodes) {
            var parent = nodes.root,
            level = 0,
            drilldown, drilldowns = self.config.drilldowns,
            current, node, node_template;
	    
	    
            for (var index in drilldowns) {
                drilldown = drilldowns[index];
	        
                level = level + 1;
                current = entry[drilldown];
                node_template = self.toNode(current, parent);
                node = nodes[node_template.id];
                if (node === undefined) {
		    // Initialize a new node and add it to the parent node
		    node = node_template;
		    node.children = [];
		    // Initial value for all of the measures
		    _.each(self.config.measure, function(measure) {
		        node[measure] = 0.0;
		    });
		    node.color = current ? current.color : undefined;
		    node.level = level;
		    node.breakdowns = {};
		    node.currency = parent.currency;
		    parent.children.push(node);
		    nodes[node.id] = node;
                }
		
	        _.each(self.config.measure, function(measure) {
		    node[measure] = node[measure] + entry[measure];
	        });
	        
                // Add the current amount and the breakdown to the root node
                // to have a total.
                if (level === 1) {
		    // Add all of the measures to the root node
		    _.each(self.config.measure, function(measure) {
		        nodes.root[measure] = nodes.root[measure] + entry[measure];
		    });
		    self.addBreakdown(nodes.root, entry);
                }
	        
                // update the breakdown for the current node
                self.addBreakdown(node, entry);
                parent = node;
            }
        };
        /**
         *  Add a node for each drilldown to the 'nodes' object
         *  Process the nodes to have:
         *  * The summed up measure
         *  * A children array
         *  * A color property
         *  * An unique id
         *
         *  @method processEntry
         *  @param {object} entry The entry in the list of drill downs
         *  @param {object} node The node to which we save the breakdown
         *  @return {undefined}
         */
        self.addBreakdown = function (node, entry) {
            var breakdown = self.config.breakdown;
            if (breakdown === undefined) {
	        
                return;
            }
	    
            var breakdown_value, breakdown_node, node_template, nodes = {},
            id;
            breakdown_value = entry[breakdown];
            node_template = self.toNode(breakdown_value);
            id = node_template.id;
            breakdown_node = node.breakdowns[id];
            if (breakdown_node === undefined) {
                breakdown_node = node_template;
                node.breakdowns[id] = breakdown_node;
            }
	    // Add all of the measures
	    _.each(self.config.measure, function(measure) {
                breakdown_node[measure] = breakdown_node[measure] + entry[measure];
	    });
	    
	    
        };
        
        self.toNode = function (value, parent) {
            var type = typeof (value);
	    
            var node = {};
            prefix = parent ? parent.id + '__' : '';
            if (value === undefined || value === null) {
                node.id = 'others';
                node.label = 'Others';
                node.name = 'others';
            } else if (type === 'object') {
                if (value.id === undefined) {
		    node.id = 'others';
		    node.label = 'Others';
		    node.name = 'others';
                } else {
		    jQuery.extend(true, node, value);
		    if (!node.name) {
		        if (node.label) {
			    node.name = node.label.toLowerCase().replace(/\W/g, "-");
		        } else {
			    node.name = node.id;
		        }
		    }
                }
            } else if (type === 'boolean') {
                if (value) {
		    node.id = 'yes';
		    node.label = 'Yes';
		    node.name = 'yes';
                } else {
		    node.id = 'no';
		    node.label = 'No';
		    node.name = 'no';
                }
            } else if (type === 'string' || type === 'number') {
                node.id = value + '';
                node.label = value + '';
                node.name = node.id.toLowerCase().replace(/\W/g, "-");
            } else {
                throw 'unsupported type: ' + type;
            }
            node.id = prefix + node.id;
	    _.each(self.config.measure, function(measure) {
                node[measure] = 0.0;
	    });
            return node;
        };
        
        self.getTree();
    };
};
