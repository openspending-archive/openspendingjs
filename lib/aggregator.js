var OpenSpending = OpenSpending || {};

(function ($) {
  var defaultConfig = {
    siteUrl: 'http://openspending.org',
    dataset: 'cra',
    drilldowns: ['cofog1', 'cofog2', 'cofog3'],
    cuts: ['year:2008'],
    breakdown: 'region',
    rootNodeLabel: 'Total',
    localApiCache: 'aggregate.json',
    measure: 'amount',
    processEntry: function(e) { return e; },
    callback: function (tree) {}
  };

  OpenSpending.aggregatorConfigFromQueryString = function(queryString) {
    if (queryString) {
      var parts = parseQueryString(queryString);
    } else {
      var parts = parseQueryString();
    }
    var out = {};
    _.each(parts, function(item) {
      var key = item[0];
      var value = item[1];
      if (key == 'breakdown') {
        out.breakdown = value;
      } else if (key == 'drilldown') {
        out.drilldowns = value.split('|');
      } else if (key == 'cut') {
        out.cuts = value.split('|');
      }
    });
    return out;
  };

  OpenSpending.Aggregator = function (customConfig) {
    var self = this;
    self.config = customConfig ? customConfig : defaultConfig;
    if (!self.config.processEntry) {
      self.config.processEntry = defaultConfig.processEntry;
    }
    if (!self.config.measure) {
      self.config.measure = 'amount';
    }
    
    self.queryData = function () {
        var data = {}, config = self.config;

        data.dataset = config.dataset;
        data.drilldown = config.drilldowns.join('|');

        data.order = config.order;
        data.page = config.page;
        data.pagesize = config.pagesize;

        if (config.cuts !== undefined) {
          data.cut = config.cuts.join('|');
        }

        // add an optional breakdown to drilldowns to query the api
        var drilldowns = config.drilldowns.slice(); //copy
        if (config.breakdown !== undefined && config.breakdown.length) {
          drilldowns.push(config.breakdown);
        }
        drilldowns = $.unique(drilldowns);
        data.drilldown = drilldowns.join('|');
        return data;
    };

    self.queryUrl = function() {
        var url, config = self.config;
        if (config.localApiCache !== undefined) {
          return config.localApiCache;
        }
        apiUrl = config.apiUrl || config.siteUrl + '/api';
        return apiUrl + '/2/aggregate';
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
        var key = window.btoa($.param(data)).replace(/\=/g, '');
        $.ajax({
          url: self.queryUrl(),
          cache: true,
          data: data,
          jsonpCallback: 'aggregate_' + key,
          dataType: self.config.localApiCache !== undefined ? 'json' : 'jsonp',
          context: self,
          success: self.onJSONTreeLoaded
        });
      };

    self.getCSVURL = function() {
        var url = self.queryUrl();
        var data = self.queryData();
        data['format'] = 'csv';
        return url + '?' + $.param(data);
      };
      /**
       *
       *
       */
    self.onJSONTreeLoaded = function (data) {
        var tree = self.buildTree(data);
        if ($.isFunction(self.config.callback)) {
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
            currency: data.summary.currency[self.config.measure],
            children: [],
            level: 0,
            breakdowns: {}
          };

        root[self.config.measure] = 0.0;

        if (rootNode !== undefined) {
          // extend root with the properties of rootNode
          $.extend(true, root, rootNode);
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
            node[self.config.measure] = 0.0;
            node.color = current ? current.color : undefined;
            node.level = level;
            node.breakdowns = {};
            node.currency = parent.currency;
            parent.children.push(node);
            nodes[node.id] = node;
          }

          node[self.config.measure] = node[self.config.measure] + entry[self.config.measure];

          // Add the current amount and the breakdown to the root node
          // to have a total.
          if (level === 1) {
            nodes.root[self.config.measure] = nodes.root[self.config.measure] + entry[self.config.measure];
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
        breakdown_node[self.config.measure] = breakdown_node[self.config.measure] + entry[self.config.measure];


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
            $.extend(true, node, value);
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
        node[self.config.measure] = 0.0;
        return node;
      };
    
    self.getTree();
  };

}(jQuery));
