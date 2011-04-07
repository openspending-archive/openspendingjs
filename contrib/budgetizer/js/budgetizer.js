function displayModel(modelConfig, htmlTable, flotChartDiv, flotLegendDiv, ColDisplay, index, flotDatasets0, flotGroup0) {
    /**
       Display a budget 'model'.
       
       modelConfig - see budgetizer-config.js
    */
    var apiurl = modelConfig.spreadsheet_feed_url;
    $.getJSON(apiurl, function(data) {
	var tabular = gdocsToJavascript(data,
		{
			columnsToUse: modelConfig.columns,
			colTypes: ColTypes
		}
	);
	var filterFunc = function(row) {
	    return row[0] != 'NOTES';
	}
	tabular.data = tabular.data.filter(filterFunc);
	var tabularHtml = writeTabularAsHtml(tabular,
		{colTypes: ColTypes, displayNames: DisplayNames}
	);
	htmlTable.append(tabularHtml['thead']);
	htmlTable.append(tabularHtml['tbody']);
	htmlTable.tablesorter();
	flotDatasets = {};
	$.each(ColDisplay, function(i,col) {
	    // this is timeseries specific plot (potentially dual axis)
	    var yaxis=1;
	    if(ColDisplayTypes[col]){yaxis=2;}
	    var DisplayLabel=DisplayNames[col];
	    flotDatasets[col] = {
		'label': DisplayLabel,
		'yaxis': yaxis,
		data: makeSeries(tabular, 'period', col, 'label', 'Forcast')
	    };
	    // this is plot that combines all time series
	    var col1=col+index;
	    var index1=index+1;
	    flotDatasets0[col1] = {
		'label': DisplayLabel+':'+modelConfig.notes,
		'group': col,
		'setid': index1,
		data: makeSeries(tabular, 'period', col, 'label', 'Forcast')
	    };
	    flotGroup0[col][index]=col1;
	});
	
	var options = {
	    'legend': {
		'container': flotLegendDiv,
		'noColumns': 1,
	    }
	};

	setupFlot(flotDatasets, flotChartDiv, options);
	doFlotPlot(flotDatasets, flotChartDiv, options);

	// do post processing once all datasets loaded
	if(--ExpectedResponses == 0){
	    displayModels(flotDatasets0, flotGroup0);
	}

    });
}

function displayModels(flotDatasets0, flotGroup0){
    var flotChart0 = $('#flot-chart');
    var flotLegend0 = $('#flot-legend');
    var options = {
	'legend': {
	    'container': flotLegend0,
	}
    };
    setupFlot(flotDatasets0, flotChart0, options, flotGroup0);
    doFlotPlot(flotDatasets0, flotChart0, options, flotGroup0);
}
