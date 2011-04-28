/**
 * Call the wdmmg aggregate api function (/api/2/aggregate)
 * and build a tree that can be used by for the bubble charts
 *
 * @public getTree
 *
 * @param {string} api_url The url to the api,
 * e.g. 'http://openspending.org/api'
 * @param {string} dataset The name of the dataset, e.g. 'cra'
 * @param {array} cuts The array with cuts, each element in the
 * format 'key:value', e.g. ['time.from.year:2010']
 * @param {array} drilldowns the dimensions to drill down to, e.g.
 * ['cofog1', 'cofog2', 'cofog3']
 * @param {string} test_data_path (optional) Pass the path to
 * a json sample file for tests.
 **/

var getTree = function(api_url, dataset, cuts, drilldowns, test_data_path) {

    //construct the url
    var url = api_url,
        data = '',
        tree_root;
    url = url + '/2/aggregate';

    data = 'dataset=' + dataset;

    cuts.forEach(function(cut){
        data = data + "&cut=" + cut;
    });

    drilldowns.forEach(function(drilldown){
        data = data + "&drilldown=" + drilldown;
    });

    /**
     *  Add a node for each drilldown to the 'nodes' object
     *  Process the nodes to have:
     *  * The summed up amount
     *  * A parent pointer
     *  * A pointer to the prev/next sibeling
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
            if(current === undefined) {
                return;
            }
            node = nodes[current.name];
            if(node === undefined) {
                node = {id: current.name,
                       parent: parent,
                       children: [],
                       amount: entry.amount,
                       color: current.color};

                if (node.color === undefined){
                    // fixme: set color
                }

                if (parent.children.length > 0) {
                    var left_sib = parent.children[parent.children.length - 1];
                    left_sib.right = node;
                    node.left = left_sib;
                }
                node.parent.children.push(node);
                nodes[current.name] = node;

            } else {
                node.amount = node.amount + entry.amount;
            }
            parent = node;

        });
    };

    /**
     * Build a tree form the drill down entries
     *
     * @param {object} The json object responded from the
     * aggregate api.
     *
     */
    var buildTree = function(data) {

        var entries = data.drilldown,
            nodes = {};

        if(data.errors !== undefined) {
            throw "Error";
            }

        nodes.root = {id: 'root',
                      label: 'Total',
                      color: '#555',
                      amount: 0.0,
                      children: [],
                      parent: undefined};

        entries.forEach(function(entry) {
            processEntry(entry, nodes);
        });

        tree_root = nodes.root;
    };

    if (test_data_path !== undefined) {
        url = test_data_path;
    }

    $.ajax({
        url: url,
        data: data,
        async: false,
        dataType: 'json',
        error: function() {alert(error);},
        success: buildTree});

    return tree_root;
};