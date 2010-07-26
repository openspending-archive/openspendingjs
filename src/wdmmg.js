function createTreeMap(json, elementId, amountLabel) {
    var get = function(id){
        return document.getElementById(id);
    };
    var infovis = get(elementId);
    var w = infovis.offsetWidth, h = infovis.offsetHeight;
    infovis.style.width = w + 'px';
    infovis.style.height = h + 'px';

    //init tm
    var tm = new TM.Squarified({
        //The id of the treemap container
        rootId: elementId,
        //Set the max. depth to be shown for a subtree
        levelsToShow: 1,

        //Add click handlers for
        //zooming the Treemap in and out
        addLeftClickHandler: true,
        addRightClickHandler: true,
        
        //When hovering a node highlight the nodes
        //between the root node and the hovered node. This
        //is done by adding the 'in-path' CSS class to each node.
        selectPathOnHover: true,

        titleHeight: 20,
        
        Color: {  
            //Allow coloring  
            allow: true,  
            //Set min value and max value constraints  
            //for the *$color* property value.  
            //Default's to -100 and 100.  
            minValue: 0,  
            maxValue: 50,  
            //Set color range. Default's to reddish and greenish.  
            //It takes an array of three  
            //integers as R, G and B values.  
            minColorValue: [168, 69, 66],  
            // maxColorValue: [68, 68, 68]  
            maxColorValue: [0, 0, 0]  
        },  
                
        //Allow tips
        Tips: {
          allow: true,
          //add positioning offsets
          offsetX: 20,
          offsetY: 20,
          //implement the onShow method to
          //add content to the tooltip when a node
          //is hovered
          onShow: function(tip, node, isLeaf, domElement) {
              tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>" + 
                "<div class=\"tip-text\">" + this.makeHTMLFromData(node.data) + "</div>"; 
          },  

          //Aux method: Build the tooltip inner html by using the data property
          makeHTMLFromData: function(data){
              var html = '';
              html += amountLabel + ': ' + data.$area + '<br />';
              return html;
          }
        },

        //Implement this method for retrieving a requested
        //subtree that has as root a node with id = nodeId,
        //and level as depth. This method could also make a server-side
        //call for the requested subtree. When completed, the onComplete 
        //callback method should be called.
        request: function(nodeId, level, onComplete){
            var tree = eval('(' + json + ')');
            var subtree = TreeUtil.getSubtree(tree, nodeId);
            TreeUtil.prune(subtree, 1);
            onComplete.onComplete(nodeId, subtree);
        },
        
        //Remove all events for the element before destroying it.
        onDestroyElement: function(content, tree, isLeaf, leaf){
            if(leaf.clearAttributes) leaf.clearAttributes();
        }
    });
  
    var pjson = eval('(' + json + ')');
    TreeUtil.prune(pjson, 1);
    tm.loadJSON(pjson);
    //end
}

function makeSeries(tabular, firstColumnName, secondColumnName) {
	var idx1 = tabular.header.indexOf(firstColumnName);
	var idx2 = tabular.header.indexOf(secondColumnName);
	var series = [];
	$.each(tabular.data, function(i,row) {
		series.push([ row[idx1], row[idx2] ]);
	});
	return series;
}

function setupFlot(all_datasets, flotChart, options, flotGroup0) {
	/*
	Plot a set of datasets using flot.

	:param all_datasets: list of datasets. Should look like:

		"series-1": {
			label: "Label 1",
			data: [[1988, 483994], [1989, 479060]]
			},        
		"series-2": {
			label: "Label 2",
			data: [[1988, 218000], [1989, 203000]]
		}
	*/
    // hard-code color indices to prevent them from shifting as
    // series are turned on/off
    var i = 0;
    $.each(all_datasets, function(key, val) {
	val.color = i;
	++i;
    });
	
    // setup checkboxes 
    var seriesList = flotChart.find(".flot-select-series");
    if(flotGroup0){
	var groups=[];
	for (var datasetKey in all_datasets) {
	    var group=all_datasets[datasetKey].group;
	    if(!groups[group]){
		groups[group]=1;
		var input = $('<input type="radio"></input>');
		input.attr('name', 'flot-radio');
		input.attr('value', group);
		input.attr('checked', 'checked');
		seriesList.append(input);
		seriesList.append(group);
	    }
	}
    }else{
	for (var datasetKey in all_datasets) {
	    var input = $('<input type="checkbox"></input>');
	    input.attr('name', datasetKey);
	    input.attr('value', datasetKey);
	    input.attr('checked', 'checked');
	    seriesList.append(input);
	    seriesList.append(all_datasets[datasetKey].label);
	}
    }

    flotChart.find('.flot-chart-controls').find('input').live('click', function() {
	doFlotPlot(all_datasets, flotChart, options, flotGroup0);
    });
    
    // setup charttype
    var chartType = "lines";
    var x = flotChart.find(".flot-chart-type").find("input[value="+chartType+"]");
    x.attr("checked", true);
}

function doFlotPlot(all_datasets, flotChart, options, flotGroup0) {
    /*
      :param options: optional set of options to be passed to flot plot.
    */
    if (!options) {
	options = {};
    }

    // select datesets according to current state
    var datasets_to_plot = []
    flotChart.find(".flot-select-series").find("input:checked").each(function () {
	var key = $(this).attr("value");
	if (key) {
	    if(flotGroup0){
		var flotSet=flotGroup0[key];
		$.each(flotSet, function(i, keys) {
		    if (all_datasets[keys]) {
			datasets_to_plot.push(all_datasets[keys]);
		    }
		});
	    }else{
		if (all_datasets[key]) {
		    datasets_to_plot.push(all_datasets[key]);
		}
	    }
	}
    });

    // select plot type according to current state
    flotChart.find(".flot-chart-type").find("input:checked").each(function() {
	var value = $(this).attr("value");
	options[value] = { show: true };
    });

    // select range according to current state
    flotChart.find(".flot-select-range").find("input:checked").each(function() {
        var key=$(this).attr("value");
        if(key=='plusminusfive'){
            options['xaxis'] = { min: 2005, max: 2015 };
        }else{
	    options['xaxis'] = {};
	}
    });
    var chartDiv = flotChart.find('.flot-chart')[0]; 
    $.plot(chartDiv, datasets_to_plot, options);
}
