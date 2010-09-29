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
}

WDMMG.DATA_CACHE = {
	'breakdown': {
	},
	'keys': {
	}
}
WDMMG.sunburst = {};

$(document).ready(function() {
	var callback = WDMMG.sunburst.render;
	// department then region
	WDMMG.sunburst.loadData(callback);
	// TODO: set checked on page (at start) based on visualizationType or vice-versa 
	$("#controls .vis-type input").click(function(e) {
		// radio, so only one
		var vistype = $('div.vis-type').find('input:checked');
		vistype = $($(vistype)[0]).attr('value');
		WDMMG.CONFIG.visualizationType = vistype;
		WDMMG.sunburst.render();
	});

    $("#slider").slider({
      value: WDMMG.CONFIG.year,
      min: 2004,
      max: 2010,
      step: 1,
      slide: function(event, ui) {
        $("#year").text(ui.value);
		WDMMG.CONFIG.year = ui.value;
		WDMMG.sunburst.render();
      }
    });
    $("#year").text($("#slider").slider("value"));
});

WDMMG.sunburst.loadData = function(callback) {
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

WDMMG.sunburst.render = function () {
	var vistype = WDMMG.CONFIG.visualizationType;
	if (vistype == 'sunburst') {
		var nodes = WDMMG.sunburst.getNodes('root', 2)
		WDMMG.sunburst.sunburst(nodes);
	} else if (vistype == 'nodelink') {
		var nodes = WDMMG.sunburst.getNodes('root', 2)
		WDMMG.sunburst.nodelink(nodes);
	} else if (vistype == 'dendogram') {
		var nodes = WDMMG.sunburst.getNodes('root', 1)
		WDMMG.sunburst.dendogram(nodes);
	} else {
		alert('Visualization type not recognized ' + vistype);
	}
}

WDMMG.sunburst.getTree = function () {
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
		name: 'Total Spending',
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

WDMMG.sunburst.getNodes = function (nodeId, depth) {
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
	var jsonTree = WDMMG.sunburst.getTree();
	// only show top level
	TreeUtil.prune(jsonTree, depth);
	function convertToProtovisTree(node) {
		if (node.children.length == 0) {
			return node.value;
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
	var dom = pv.dom(protovisTree);
	// TODO: use data from jsonTree
	var nodes =
		dom.root("Total Spending " + year)
			.sort(function(a, b) {
				return pv.naturalOrder(b.nodeValue, a.nodeValue)
			})
			.nodes()
	return nodes;
}

WDMMG.sunburst.getPanel = function() {
	var vis = new pv.Panel()
		.width(700)
		.height(600)
		.canvas('fig')
		;
	return vis;
}

WDMMG.sunburst.sunburst = function (data) {
	var vis = WDMMG.sunburst.getPanel();

	var partition = vis.add(pv.Layout.Partition.Fill)
		.nodes(data)
		.size(function(d) {return d.nodeValue})
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
		selfval = node.nodeValue;
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

WDMMG.sunburst.nodelink = function (nodes) {
	var vis = WDMMG.sunburst.getPanel();

	var ourTreeDepth = treeDepth(nodes) - 1;
	console.log(ourTreeDepth);
	var tree = vis.add(pv.Layout.Tree)
		.nodes(nodes)
		.depth(290 / ourTreeDepth)
		.breadth(Math.pow(30, 1/ourTreeDepth))
		.orient("radial")
		;

	tree.link.add(pv.Line);

	function dotSize(node) {
		var selfval = nodeval(node);
		// divide by 0.1 billion
		return selfval / (0.5 * 1000000 * 1000);
	}

	tree.node.add(pv.Dot)
		.fillStyle(function(n) {
			return n.firstChild ? "#aec7e8" : "#ff7f0e"
			})
		.title(function(d) {
			var selfval = nodeval(d);
			var t = '';
			console.log(d.parentNode);
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
		;
	
	tree.label.add(pv.Label)
		.visible(function(d) {
			return d.parentNode == null;
			})
		;

	vis.render();
}

WDMMG.sunburst.dendogram = function (nodes) {
	var vis = WDMMG.sunburst.getPanel()
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

