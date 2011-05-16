/**
 * Call the wdmmg aggregate api function (/api/2/aggregate)
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

OpenSpendings.BubbleChart.getTree = function(api_url, dataset, drilldowns,
                                             cuts, callback, testDataPath) {

    //construct the url
    var url = api_url,
        data = '';

    url = url + '/2/aggregate';
    data = 'dataset=' + dataset;
    data = data + "&drilldown=" + drilldowns.join('|');

    if (cuts !== undefined) {
        cuts = cuts.join('|');
        data = data + "&cut=" + cuts;
    }

    if (testDataPath !== undefined) {
        $.ajax({
            url: testDataPath,
            data: data,
            dataType: 'json',
            success: callback});
    } else {
        $.ajax({
            url: url,
            data: data,
            dataType: 'jsonp',
            jsonpCallback: callback });
    }
};


/**
 * Build a tree form the drill down entries
 *
 * @public buildTree
 *
 * @param {object} data The json object responded from the
 * aggregate api.
 * @param {array} drilldowns List of drilldown criterial (strings)
 * @param {object} rootNode (optional) Pass an object with properties
 * for the root node. Maybe you want to set 'color' (default: #555) or
 * the 'label' (default: 'Total')
 **/

OpenSpendings.BubbleChart.buildTree = function(data, drilldowns, rootNode) {

    var entries = data.drilldown,
        nodes = {},
        root = {id: 'root',
                label: 'Total',
                color: '#555',
                amount: 0.0,
                children: [],
                level: 0};

    if (rootNode !== undefined) {
        // extend root with the properties of rootNode
        $.extend(true, root, rootNode);
    }

    if(data.errors !== undefined) {
        throw "Error";
    }

    /**
     *  Add a node for each drilldown to the 'nodes' object
     *  Process the nodes to have:
     *  * The summed up amount
     *  * A children array
     *  * A color property
     *  * An unique id
     *
     *  @method processEntry
     *  @param {object} entry The entry in the list of drill downs
     *  @param {object} nodes Object used as a mapping for node ids to nodes
     *  @return {undefined}
     */
    var processEntry = function(entry, nodes) {

        var parent = nodes.root,
            level = 0;

        drilldowns.forEach(function(drilldown) {
            var current,
                node;
            level = level + 1;
            current = entry[drilldown];

            // Don't process the drilldowns further if a
            // drilldown has no value
            if(! current) {
                return;
            }

            node = nodes[current.name];
            if(node === undefined) {
                // Initialize a new node and add it to the parent node
                node = {id: current.name,
                        children: [],
                        amount: entry.amount,
                        label: current.label,
                        color: current.color,
                        level: level};

                parent.children.push(node);
                nodes[current.name] = node;

            } else {
                // update the ammount for existing nodes.
                node.amount = node.amount + entry.amount;
            }

            // Add the current amount to the root node
            // to have a total.
            if(level === 1) {
                nodes.root.amount = nodes.root.amount + entry.amount;
            }

            parent = node;
        });
    };

    entries.forEach(function(entry) {
        processEntry(entry, nodes);
    });

    return nodes.root;
};


