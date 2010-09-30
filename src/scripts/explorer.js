var WDMMG = {};

WDMMG.CONFIG = {
	'dataStoreApi': 'http://data.wheredoesmymoneygo.org/api',
	'breakdownIdentifier': 'slice=cra&breakdown-from=yes&breakdown-region=yes',
	// 'visualizationType': 'sunburst'
	'visualizationType': 'nodelink',
	// ordered list of keys (used in displaying the spending)
	'breakdownKeys': [ 'from', 'region' ],
	// 'breakdownKeys': [ 'region', 'from' ],
	'year': 2008,
	'currentNodeId': 'root'
}

WDMMG.DATA_CACHE = {
	'breakdown': {
	},
	'keys': {
	}
}
WDMMG.explorer = {};
WDMMG.explorer.color = {};
WDMMG.explorer.color.fill = function(node) {
	return 'rgba(129,130,133, 0.5)';
};
WDMMG.explorer.color.stroke = function(node) {
	return '#818285';
}

$(document).ready(function() {
	var callback = WDMMG.explorer.render;
	// department then region
	WDMMG.explorer.loadData(callback);
	// TODO: set checked on page (at start) based on visualizationType or vice-versa 
	$("#controls .vis-type input").click(function(e) {
		// radio, so only one
		var vistype = $('div.vis-type').find('input:checked');
		vistype = $($(vistype)[0]).attr('value');
		WDMMG.CONFIG.visualizationType = vistype;
		WDMMG.explorer.render();
	});

    $("#slider").slider({
      value: WDMMG.CONFIG.year,
      min: 2004,
      max: 2010,
      step: 1,
      slide: function(event, ui) {
        $("#year").text(ui.value);
		WDMMG.CONFIG.year = ui.value;
		WDMMG.explorer.render();
      }
    });
    $("#year").text($("#slider").slider("value"));
	$('#back-to-top-level').click(function(e) {
		e.preventDefault();
		WDMMG.CONFIG.currentNodeId = 'root';
		WDMMG.explorer.render();
	});
});

WDMMG.explorer.loadData = function(callback) {
	if (DEBUG) {
		WDMMG.DATA_CACHE['breakdown'][WDMMG.CONFIG.breakdownIdentifier] = dept_region;
		WDMMG.DATA_CACHE['keys']['from'] = key_from['enumeration_values'];
		WDMMG.DATA_CACHE['keys']['region'] = key_region['enumeration_values'];
		callback();
	} else {
		var api_url = WDMMG.CONFIG.dataStoreApi + '/aggregate?' + WDMMG.CONFIG.breakdownIdentifier + '&callback=?';
		$.getJSON(api_url, function(data) {
			WDMMG.DATA_CACHE['breakdown'][WDMMG.CONFIG.breakdownIdentifier] = data;
			// need to do work to ensure we only call render after *all* data loaded
			var done = 2; // number of total requests
			$.each(data.metadata.axes, function(i,key) {
				var api_url = WDMMG.CONFIG.dataStoreApi + '/rest/key/' + key + '?callback=?';
				$.getJSON(api_url, function(data) {
					WDMMG.DATA_CACHE['keys'][key] = data['enumeration_values'];
					done -= 1;
					if(done == 0) {
						callback();
					}
				});
			});
		});
	}
}

WDMMG.explorer.render = function () {
	var vistype = WDMMG.CONFIG.visualizationType;
	// TODO: this is not really a config variable but something just an internal variable ...
	var nodeId = WDMMG.CONFIG.currentNodeId;
	if (vistype == 'sunburst') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 2)
		WDMMG.explorer.sunburst(nodes);
	} else if (vistype == 'nodelink') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 1)
		WDMMG.explorer.nodelink(nodes);
	} else if (vistype == 'dendogram') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 1)
		WDMMG.explorer.dendogram(nodes);
	} else {
		alert('Visualization type not recognized ' + vistype);
	}
}

WDMMG.explorer.getTree = function () {
	var wdmmg_data = WDMMG.DATA_CACHE['breakdown'][WDMMG.CONFIG.breakdownIdentifier];
	var years = $.map(wdmmg_data.metadata.dates, function(year, idx) {
			return year.substring(0,4);
	});
	var yearIdx = years.indexOf(String(WDMMG.CONFIG.year));
	var year = wdmmg_data.metadata.dates[yearIdx];
	var hierarchy = WDMMG.CONFIG.breakdownKeys;
	var keyToIdx = {} 
	$.each(wdmmg_data.metadata.axes, function(idx, key){
		keyToIdx[key] = idx;
	});

	var tree = {
		id: 'root',
		name: 'Total Spending ' + year,
		metadata: {
			keyOrder: hierarchy
		},
		children: [
			]
	};
	$.each(wdmmg_data.results, function(idx, row) {
		// each row corresponds to a leaf

		var tkeys = row[0];
		var tvalues = row[1];
		// resort the keys into the correct order dictated by hierarchy
		var orderedKeys = $.map(hierarchy, function(hierarchyKey,idx) {
			return tkeys[keyToIdx[hierarchyKey]];
		});
		// if orderedKeys are ['from', 'region'] then treeKeys are
		// ['from', 'from::region']
		var treeKeys = [];
		for (var i=0; i<orderedKeys.length; i++) {
			treeKeys[i] = orderedKeys.slice(0,i+1).join('::');
		}
		TreeUtil.addNodeWithAncestors(tree, treeKeys,
			{
				'value': tvalues[yearIdx],
				'data': {'values': tvalues}
			});
	});
	// walk the tree setting the name attribute
	TreeUtil.each(tree, function(node) {
			if (node.id!='root') {
				var keyCodes = node.id.split('::');
				var ourkey = hierarchy[keyCodes.length-1];
				var ourcode = keyCodes[keyCodes.length-1];
				node.name = WDMMG.DATA_CACHE.keys[ourkey][ourcode]['name'];
			}
		});
	TreeUtil.calculateValues(tree);
	return tree;
}

WDMMG.explorer.getNodes = function (nodeId, depth) {
	var wdmmg_data = WDMMG.DATA_CACHE['breakdown'][WDMMG.CONFIG.breakdownIdentifier];
	var years = $.map(wdmmg_data.metadata.dates, function(year, idx) {
			return year.substring(0,4);
	});
	var yearIdx = years.indexOf(String(WDMMG.CONFIG.year));
	var year = wdmmg_data.metadata.dates[yearIdx];
	var hierarchy = WDMMG.CONFIG.breakdownKeys;
	var keyToIdx = {} 
	$.each(wdmmg_data.metadata.axes, function(idx, key){
		keyToIdx[key] = idx;
	});
	var jsonTree = WDMMG.explorer.getTree();
	jsonTree = TreeUtil.getSubtree(jsonTree, nodeId);
	TreeUtil.prune(jsonTree, depth);
	// TODO: move this out
	function convertToProtovisTree(node) {
		if (node.children.length == 0) {
			// deep copy is safer!
			return {
				id: node.id,
				name: node.name,
				value: node.value
			}
		} else {
			var out = {}
			for(var i=0; i<node.children.length; i++) {
				// use name not id ...
				out[node.children[i].name] = convertToProtovisTree(node.children[i]);
			}
			return out;
		}
	}
	var protovisTree = convertToProtovisTree(jsonTree);
	var dom = pv.dom(protovisTree)
		.leaf(function(node) {
			return (node.id!=null);
			})
		;
	// TODO: use data from jsonTree
	var nodes =
		dom.root(jsonTree.name)
			.sort(function(a, b) {
				return pv.naturalOrder(b.nodeValue.value, a.nodeValue.value)
			})
			.nodes()
	// annoyingly protovis seems to discard nodeValue material for root node so we reinstate it
	nodes[0].nodeValue = {
		id: jsonTree.id,
		value: jsonTree.value
	}
	return nodes;
}

WDMMG.explorer.getPanel = function() {
	var vis = new pv.Panel()
		.width(700)
		.height(600)
		.canvas('fig')
		;
	return vis;
}

WDMMG.explorer.sunburst = function (data) {
	var vis = WDMMG.explorer.getPanel();

	var partition = vis.add(pv.Layout.Partition.Fill)
		.nodes(data)
		.size(function(d) {return d.nodeValue.value})
		.order("descending")
		.orient("radial");

	partition.node.add(pv.Wedge)
		.fillStyle(pv.Colors.category19().by(function(d) {return d.parentNode && d.parentNode.nodeName}))
		.strokeStyle("#fff")
		.lineWidth(.5)
		.title(function(d) {
			var t = '';
			// only 2nd layer ring
			if (d.depth > 0.5 ) {
				var t = d.parentNode.nodeName + ' - ';
			}
			var t = t + d.nodeName + ' GBP ' + numberAsString(d.size);
			return t;
			})
		.event("mouseover", pv.Behavior.tipsy({gravity: "w", fade: true}));
		;

	partition.label.add(pv.Label)
		.visible(function(d) {
			// depth 0 for root, 0.5 for first ring, 1 for 2nd ring
			return d.angle * d.outerRadius >= 20;
			})
		;

	vis.render();
}

// TODO: put in namespace or move elsewhere
function nodeval(node) {
	var selfval = 0;
	if (node.nodeValue) {
		selfval = node.nodeValue.value;
	}
	return selfval + pv.sum(node.childNodes, nodeval);
}

function treeDepth(nodes) {
	if (nodes.length>0) {
		return 1 + treeDepth(nodes[0].childNodes);
	} else {
		return 0;
	}
}

WDMMG.explorer.nodelink = function (nodes) {
	var vis = WDMMG.explorer.getPanel();

	var ourTreeDepth = treeDepth(nodes) - 1;
	var numberNodesInFirstLevel = nodes[0].childNodes.length
	var tree = vis.add(pv.Layout.Tree)
		.nodes(nodes)
		.depth(170 / ourTreeDepth)
		.breadth(1050/numberNodesInFirstLevel)
		.orient("radial")
		;

	// normalize sizes of dots
	// first node in nodes is the root node which is the largest
	// and we normalize it to size of 1000
	var maxSize = nodes[0].nodeValue.value;
	function dotSize(node) {
		var selfval = nodeval(node);
		return 2500 * selfval / maxSize;
	}

	tree.node.add(pv.Dot)
		.fillStyle(function(n) {
			return WDMMG.explorer.color.fill(n);
			})
		.strokeStyle(function(n) {
			return WDMMG.explorer.color.stroke(n);
			})
		.title(function(d) {
			var selfval = nodeval(d);
			var t = '';
			// only >= 2nd layer ring
			if (d.parentNode && d.parentNode.parentNode) {
				var t = d.parentNode.nodeName + ' - ';
			}
			var t = t + d.nodeName + ' GBP ' + numberAsString(selfval);
			return t;
			})
		.size(function(d) {
			return dotSize(d);
			})
		.event('click', function(d) {
			WDMMG.CONFIG.currentNodeId = d.nodeValue.id;
			WDMMG.explorer.render();
			})
		;
	
	tree.label.add(pv.Label)
		.text(function(d) {
				// show node name up to 25 characters or full name if root node
				if (d.nodeName.length <= 25 || (d.parentNode==null)) {
					return d.nodeName;
				} else {
					return d.nodeName.substr(0,25) + '...';
				}
			})
		.visible(function(d) {
			return (d.parentNode==null || d.parentNode.parentNode == null);
			})
		;

	vis.render();
}

WDMMG.explorer.dendogram = function (nodes) {
	var vis = WDMMG.explorer.getPanel()
		.height(function() {(nodes.length + 1) * 12})
		.width(200)
		.left(150)
		.right(200)
		;

	var layout = vis.add(pv.Layout.Cluster)
		.nodes(nodes)
		.group(true)
		.orient("left");

	layout.link.add(pv.Line)
		.strokeStyle("#ccc")
		.lineWidth(1)
		.antialias(false);

	layout.node.add(pv.Dot)
		.fillStyle(function(n) {
			return n.firstChild ? "#aec7e8" : "#ff7f0e"
		})
		.title(function(d) {
			var selfval = nodeval(d);
			var t = d.nodeName + ' GBP ' + numberAsString(selfval);
			return t;
			})
		;

	layout.label.add(pv.Label)
		;

	vis.render();
}

