$(document).ready(function() {
	// department then region
	var api_url = "http://data.wheredoesmymoneygo.org/api/aggregate?slice=cra&breakdown-from=yes&breakdown-region=yes&callback=?";
    $.getJSON(api_url, function(data) {
		// render(dept_region);
		render(data);
	});
	$("#visualize a").click(function(e) {
		e.preventDefault();
		render();
	});
});

function render(wdmmg_data) {
	//var dom = pv.dom(cofog);
	//	.leaf(function(d) d.amount);
	//var nodes = dom.root("cofog").nodes();
	// var dom = pv.dom(flare);
	// var nodes = dom.root("flare").nodes();
	var tree = pv.tree(wdmmg_data.results)
		// reverse array so we get dept then region
		// TODO: make this more robust (read out metadata and use that)
		.keys(function(d) {return d[0].reverse()})
		.value(function(d) {return d[1][d.length-1]})
		.map();
	var dom = pv.dom(tree);
	var nodes = dom.root("Total Spending").nodes();
	// $.each(dept_region.results, function(i,result) {
	//		});
	sunburst(nodes);
}

function sunburst(data) {
	var vis = new pv.Panel()
		.width(900)
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
		.title(function(d) {return d.nodeName + ' GBP ' + d.nodeValue/1000000 + 'm'})
		;

	partition.label.add(pv.Label)
		.visible(function(d) {return d.angle * d.outerRadius >= 6});

	vis.render();
}
