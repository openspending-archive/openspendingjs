var WDMMG = {};

WDMMG.CONFIG = {
    'wdmmg_api': 'http://data.wheredoesmymoneygo.org/api'
}

WDMMG.DATA_CACHE = {
    'breakdown': {
    },
    'keys': {
    }
}

$(document).ready(function() {
	// department then region
    var breakdownIdentifier = 'slice=cra&breakdown-from=yes&breakdown-region=yes';
    if (DEBUG) {
        WDMMG.DATA_CACHE['breakdown'][breakdownIdentifier] = dept_region;
        WDMMG.DATA_CACHE['keys']['from'] = key_from['enumeration_values'];
        WDMMG.DATA_CACHE['keys']['region'] = key_region['enumeration_values'];
        WDMMG.sunburst.render(breakdownIdentifier);
    } else {
        var api_url = "http://data.wheredoesmymoneygo.org/api/aggregate?" + breakdownIdentifier + "&callback=?";
        $.getJSON(api_url, function(data) {
            WDMMG.DATA_CACHE['breakdown'][breakdownIdentifier] = data;
            // need to do work to ensure we only call render after *all* data loaded
            var done = 2; // number of total requests
            $.each(data.metadata.axes, function(i,key) {
                var api_url = WDMMG.CONFIG['wdmmg_api'] + '/rest/key/' + key + '?callback=?';
                $.getJSON(api_url, function(data) {
                    WDMMG.DATA_CACHE['keys'][key] = data['enumeration_values'];
                    done -= 1;
                    if(done == 0) {
                        // finally call render
                        WDMMG.sunburst.render(breakdownIdentifier);
                    }
                });
            });
        });
    }
	$("#visualize a").click(function(e) {
		e.preventDefault();
		WDMMG.sunburst.render();
	});
});

WDMMG.sunburst = {};
WDMMG.sunburst.render = function (breakdownIdentifier) {
	//var dom = pv.dom(cofog);
	//	.leaf(function(d) d.amount);
	//var nodes = dom.root("cofog").nodes();
	// var dom = pv.dom(flare);
	// var nodes = dom.root("flare").nodes();
    var wdmmg_data = WDMMG.DATA_CACHE['breakdown'][breakdownIdentifier];
    var yearIdx = 5;
    var year = wdmmg_data.metadata.dates[yearIdx];
    var idxToKey = {};
    $.each(wdmmg_data.metadata.axes, function(idx, key){
        idxToKey[idx] = key;
    });
	var tree = pv.tree(wdmmg_data.results)
		// reverse array so we get dept then region
		// TODO: make this more robust (read out metadata and use that)
		.keys(function(d) {
                var labels = $.map(d[0], function(code,idx) {
                    var k = idxToKey[idx];

                    return WDMMG.DATA_CACHE.keys[k][code]['name'];
                });
                return labels.reverse();
            })
		.value(function(d) {return d[1][yearIdx]})
		.map();
	var dom = pv.dom(tree);
	var nodes = dom.root("Total Spending " + year).nodes();
	WDMMG.sunburst.sunburst(nodes);
}

// TODO: put this in utils
function numberAsString(num) {
    var billion = 1000000000;
    var million = 1000000;
    var thousand = 1000; 
    if (num > billion) {
        return num / billion + 'bn';
    }
    if (num > (million/2)) {
        return num/million + 'm';
    }
    if (num > thousand) {
        return num/thousand + 'k';
    } else {
        return num; 
    }
}

WDMMG.sunburst.sunburst = function (data) {
	var vis = new pv.Panel()
		.width(700)
		.height(600)
		.canvas('fig')
		;

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
            return d.nodeName + ' GBP ' + numberAsString(d.size);
            })
		.visible(function(d) {
            return d.angle * d.outerRadius >= 3
            })
		;

	partition.label.add(pv.Label)
		.visible(function(d) {
            return d.angle * d.outerRadius >= 6
            })
        ;

	vis.render();
}
