WDMMG.explorer = {};
WDMMG.explorer.config = {
	'dataset': 'cra',
	// current 'breakdown' keys - used in displaying the spending
	// set from html at the moment
	'breakdownKeys': [],
	'defaultBreakdownKeys': ['from', 'region'],
	// all possible keys
	'keys': ['from', 'region', 'cofog1', 'cofog2', 'cofog3'],
	'visualizationType': 'nodelink',
	'year': 2008,
	'currentNodeId': 'root'
};

WDMMG.explorer.color = {};
WDMMG.explorer.color.fill = function(node) {
	return 'rgba(129,130,133, 0.5)';
};
WDMMG.explorer.color.stroke = function(node) {
	return '#818285';
}

$(document).ready(function() {
	var queryArgs = parseQueryString();
	WDMMG.explorer.config.breakdownKeys = [];
	$.each(queryArgs, function(idx, arg) {
		if(arg[0].match('^breakdown') && arg[1]) {
			WDMMG.explorer.config.breakdownKeys.push(arg[1]);
		}
		if(arg[0] == 'vistype') {
			WDMMG.explorer.config.visualizationType = arg[1];
		}
	});
	if(WDMMG.explorer.config.breakdownKeys.length == 0) {
		WDMMG.explorer.config.breakdownKeys = WDMMG.explorer.config.defaultBreakdownKeys;
	}

	loadingMessage();
	WDMMG.datastore.loadData(WDMMG.explorer.config, function() {
		$.unblockUI();
		// only need to re-render tables and json when data changes ...
		// hide by default
		$('#data-table').hide();
		$('#data-json').hide();
		// also renders json as well as table
		WDMMG.explorer.renderTable();
		// the visualizations
		WDMMG.explorer.render();
	});
	// TODO: set checked on page (at start) based on visualizationType or vice-versa 
	$("#controls .vis-type input").click(function(e) {
		// radio, so only one
		var vistype = $('div.vis-type').find('input:checked');
		vistype = $($(vistype)[0]).attr('value');
		WDMMG.explorer.config.visualizationType = vistype;
		WDMMG.explorer.render();
	});
	
	var keys = WDMMG.explorer.config.keys;
	var theform = $('<form></form>');
	for(var i in [0,1,2]) {
		var select = $('<select id="breakdown-' + i + '" name="breakdown-' + i + '"></select>')
		select.append('<option value=""></option>');
		for(var j in keys) {
			var opt = $('<option value="' + keys[j] + '">' + keys[j] + '</option>');
			if (keys[j] == WDMMG.explorer.config.breakdownKeys[i]) {
				opt.attr('selected', '1');
			}
			select.append(opt);
		}
		theform.append(select);
		theform.append(', then<br />');
	}
	var submit = $('<input type="submit" value="Go &raquo;" name="go" />')
	submit.appendTo(theform);
	$('#controls-breakdown').append(theform);

    $("#slider").slider({
      value: WDMMG.explorer.config.year,
      min: 2004,
      max: 2010,
      step: 1,
      slide: function(event, ui) {
        $("#year").text(ui.value);
		WDMMG.explorer.config.year = ui.value;
		WDMMG.explorer.render();
      }
    });
    $("#year").text($("#slider").slider("value"));

	$('#show-data-table').click(function(e) {
		$('#data-table').show('slow');
	});
	$('#show-data-json').click(function(e) {
		$('#data-json').show('slow');
	});
	$('.hide-data').click(function(e) {
		$('#data-table').hide('slow');
		$('#data-json').hide('slow');
	});
});

WDMMG.explorer.render = function () {
	var vistype = WDMMG.explorer.config.visualizationType;
	// TODO: this is not really a config variable but something just an internal variable ...
	var nodeId = WDMMG.explorer.config.currentNodeId;
	if (vistype == 'sunburst') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 2)
		WDMMG.explorer.sunburst(nodes);
	} else if (vistype == 'nodelink') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 1)
		WDMMG.explorer.nodelink(nodes);
	} else if (vistype == 'treemap') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 2)
		WDMMG.explorer.treemap(nodes);
	} else if (vistype == 'dendrogram') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 1)
		WDMMG.explorer.dendrogram(nodes);
	} else if (vistype == 'icicle') {
		var nodes = WDMMG.explorer.getNodes(nodeId, 2)
		WDMMG.explorer.icicle(nodes);
	} else {
		alert('Visualization type not recognized ' + vistype);
	}
}

WDMMG.explorer.renderTable = function() {
	var wdmmg_data = WDMMG.datastore.getAggregate(WDMMG.explorer.config);
	var tabular = {
		header: wdmmg_data.metadata.axes.concat(wdmmg_data.metadata.dates),
		data: []
	};
	$.each(wdmmg_data.results, function(idx, entry) {
		var keys = $.map(entry[0], function(code, idx) {
            var key = wdmmg_data.metadata.axes[idx];
			return getKeyCodeName(key, code);
		});
		var values = $.map(entry[1], function(v, idx) {
			return numberAsString(v);
		});
		tabular.data.push(keys.concat(values));
	});
	var tableHtml = writeTabularAsHtml(tabular);
	var tableElem = $($('#data-table')[0]);
	tableElem.innerHTML = '';
	tableElem.append(tableHtml['thead']);
	tableElem.append(tableHtml['tbody']);
	tableElem.tablesorter({
		widgets: ['zebra']
	});
	var json = $($('#data-json')[0]);
	json.val($.toJSON(wdmmg_data));
}

WDMMG.explorer.getTree = function () {
	var wdmmg_data = WDMMG.datastore.getAggregate(WDMMG.explorer.config);
	var years = $.map(wdmmg_data.metadata.dates, function(year, idx) {
			return year.substring(0,4);
	});
	var yearIdx = years.indexOf(String(WDMMG.explorer.config.year));
	var year = wdmmg_data.metadata.dates[yearIdx];
	var hierarchy = WDMMG.explorer.config.breakdownKeys;
	var keyToIdx = {};
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
				node.name = getKeyCodeName(ourkey, ourcode);
			}
		});
	TreeUtil.calculateValues(tree);
	return tree;
}

WDMMG.explorer.getNodes = function (nodeId, depth) {
	var fullTree = WDMMG.explorer.getTree();
	var jsonTree = TreeUtil.getSubtree(fullTree, nodeId);
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
				if (a.nodeValue && a.nodeValue.value) {
					return pv.naturalOrder(b.nodeValue.value, a.nodeValue.value)
				} else {
					return pv.naturalOrder(b.nodeValue, a.nodeValue);
				}
			})
			.nodes()
	// annoyingly protovis seems to discard nodeValue material for root node so we reinstate it
	nodes[0].nodeValue = {
		id: jsonTree.id,
		value: jsonTree.value,
		name: jsonTree.name
	}

	// TODO: ugly to have this here - this whole function is clearly in need of refactoring!
	WDMMG.explorer._tree = fullTree;
	WDMMG.explorer._currentTree = jsonTree;
	WDMMG.explorer._depth = TreeUtil.getDepth(fullTree, nodeId); 
	return nodes;
}

function treeDepth(nodes) {
	if (nodes.length>0) {
		return 1 + treeDepth(nodes[0].childNodes);
	} else {
		return 0;
	}
}

function title(node) {
	var value = node.nodeValue ? node.nodeValue.value : node.size;
	var t = node.parentNode && node.parentNode.parentNode ? 
		node.parentNode.nodeName + ' - ' : '';
	var t = t + node.nodeName + ' GBP ' + numberAsString(value);
	return t;
}

function trimNodeName(node, trimLength) {
	if (node.nodeName.length <= trimLength || (node.parentNode==null)) {
		return node.nodeName;
	} else {
		return node.nodeName.substr(0,trimLength) + '..';
	}
}

function getKeyCodeName(key, code) {
    if(code == null)  {
        return 'Unknown';
    } else {
        return WDMMG.datastore.keys[key][code].name;
    }
}

WDMMG.explorer.getPanel = function() {
	var viewportHeight = window.innerHeight ? window.innerHeight : $(window).height();
	var vis = new pv.Panel()
		.width($('#fig').width())
		.height(viewportHeight-100)
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
		.title(function(d) {return title(d)})
		;

	partition.label.add(pv.Label)
		.visible(function(d) {
			// depth 0 for root, 0.5 for first ring, 1 for 2nd ring
			return d.angle * d.outerRadius >= 10;
			})
		;

	vis.render();
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
		return 2500 * Math.abs(node.nodeValue.value) / maxSize;
	}

	function makeNodeCenterOfUniverse(d) {
		WDMMG.explorer.config.currentNodeId = d.nodeValue.id;
		WDMMG.explorer.render();
	}

	var nodeDot = tree.node.add(pv.Dot)
		.fillStyle(
			pv.Colors.category19().by(function(d) {return d.nodeName
			}))
		//.fillStyle(function(n) {
		//	return WDMMG.explorer.color.fill(n);
		//	})
		.strokeStyle(
			pv.Colors.category19().by(function(d) {return d.nodeName
			}))
		.title(function(d) {return title(d)})
		.size(function(d) {
			return dotSize(d);
			})
		.cursor('pointer') 
		.event('click', makeNodeCenterOfUniverse)
		;
	
	nodeDot.anchor(function(d) {
			return d.parentNode == null ? 'center' : 'left';
		})
		.add(pv.Label)
		// turn this on in order to get mouseover events on labels
		.events('all')
		.cursor('pointer') 
		.text(function(d) {
			return d.parentNode == null ? d.nodeName : trimNodeName(d, 25);
		})
		// cribbed from protovis code
		// pv.Network.Layout this.label code
		.textMargin(10)
		.textAngle(function(n) {
			var a = n.midAngle;
			return pv.Wedge.upright(a) ? a : (a + Math.PI);
		})
		.textAlign(function(n) {
			// special case root node
			if (n.parentNode == null) {
				return 'center';
			} else {
				return pv.Wedge.upright(n.midAngle) ? 'left' : 'right';
			}
		})
		.title(function(d) {return title(d)})
		.visible(function(d) {
			return (d.parentNode==null || d.parentNode.parentNode == null);
			})
		.event('click', makeNodeCenterOfUniverse)
	;
	
	// 'contextual' dots
	var contextData = [];
	var _currentNode = nodes[0];
	// all other nodes we will get from json tree and will have attributes directly available
	_currentNode.id = _currentNode.nodeValue.id;
	_currentNode.name = _currentNode.nodeValue.name;
	_currentNode.value = _currentNode.nodeValue.value;
	for(var i=0; i<=WDMMG.explorer._depth; i++) {
		contextData.push([
			50,
			20 + (WDMMG.explorer._depth - i) * 20,
			100/(WDMMG.explorer._depth-i+1),
			_currentNode
		]);
		_currentNode = TreeUtil.getParent(WDMMG.explorer._tree, _currentNode.id);
	}
	contextData.reverse();
	vis.add(pv.Dot)
		.data(contextData)
		.left(function(d) {return d[0]})
		.top(function(d) {return d[1]})
		.size(function(d) {return d[2]})
		.title(function(d) {
			return 'GBP ' + numberAsString(d[3].value) + '\nClick to go to this level';
			})
		.fillStyle('#3a3a3c')
		.strokeStyle('#3a3a3c')
		.event('click', function(d) {
			WDMMG.explorer.config.currentNodeId = d[3].id;
			WDMMG.explorer.render();
			})
		.anchor('right').add(pv.Label)
			.text(function(d) {
				return d[3].name;
			})
		;

	vis.render();
}

WDMMG.explorer.dendrogram = function (nodes) {
	var vis = WDMMG.explorer.getPanel()
		.height(function() {(nodes.length + 1) * 12})
		.width(200)
		.left(60)
		.right(200)
		.top(20)
		.bottom(20)
	;

	var layout = vis.add(pv.Layout.Cluster)
		.nodes(nodes)
		.group(true)
		.orient("left");

	var maxSize = nodes[0].nodeValue.value;
	function dotSize(node) {
		return 2500 * node.nodeValue.value / maxSize;
	}

	layout.node.add(pv.Dot)
		.fillStyle(function(n) {
			return n.firstChild ? "#aec7e8" : "#ff7f0e"
		})
		.title(function(d) {return title(d)})
		.size(function(node) {
			return dotSize(node);
			})
		// TODO: cannot have 2 anchors ...
//		.anchor('top').add(pv.Label)
//			.text(function(d) {
//				return d.firstChild ? d.nodeValue.name : '';
//			})
//			.textAlign(function(node) {
//				return 'right';
//			})
//		;
		.anchor('right').add(pv.Label)
			.text(function(d) {
				return d.nodeValue.name;
			})
			.textAlign(function(node) {
				return 'left';
			})
		;

	vis.render();
}

WDMMG.explorer.icicle = function (nodes) {
	var vis = WDMMG.explorer.getPanel();

	var layout = vis.add(pv.Layout.Partition.Fill)
		.nodes(nodes)
		.order('descending')
		.orient('top')
		.size(function(d) {return d.nodeValue.value})

	layout.node.add(pv.Bar)
		.fillStyle(pv.Colors.category19().by(function(d) {
			return d.parentNode && d.parentNode.nodeName;
			}))
		.strokeStyle('rgba(255,255,255,.5)')
		.lineWidth(1)
		.antialias(false)
		.title(function(d) {return title(d)})
		;

	layout.label.add(pv.Label)
		.textAngle(-Math.PI / 2)
		.visible(function(d) {
			return d.dx > 6
			})
		;

	vis.render();
}

WDMMG.explorer.treemap = function (nodes) {
	var vis = WDMMG.explorer.getPanel();

	function matchtitle(d) {
		return d.parentNode ? (title(d.parentNode) + "." + d.nodeName) : d.nodeName;
	}

	var re = '',
		color = pv.Colors.category19().by(function(d) {return d.parentNode.nodeName});

	var layout = vis.add(pv.Layout.Treemap)
		.nodes(nodes)
		.round(true)
		.size(function(d) {return d.nodeValue.value})
		;

	layout.leaf.add(pv.Panel)
		.fillStyle(function(d) {return color(d).alpha(matchtitle(d).match(re) ? 1 : .2)})
		.strokeStyle("#fff")
		.lineWidth(1)
		.antialias(false)
		.title(function(d) {return title(d)})
		;

	layout.label.add(pv.Label)
		.visible(function(d) {
			// only show on first layer and where large enough
			return (
				(d.parentNode && d.parentNode.parentNode == null)
				&&
				(d.dx > 20 && d.dy > 20)
			);
		})
		;

	vis.render();
}
