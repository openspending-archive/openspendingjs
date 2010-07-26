function displayModel(modelConfig, htmlTable, flotChartDiv, ColDisplay, index, flotDatasets0) {
    /**
       Display a budget 'model'.
       
       modelConfig - see budgetizer-config.js
    */
    var apiurl = modelConfig.spreadsheet_feed_url;
    $.getJSON(apiurl, function(data) {
	var tabular=gdocsToJavascript(data, modelConfig.columns);
	var filterFunc = function(row) {
	    return row[0] != 'NOTES';
	}
	tabular.data = tabular.data.filter(filterFunc);
	var tabularHtml = writeTabularAsHtml(tabular);
	htmlTable.append(tabularHtml['thead']);
	htmlTable.append(tabularHtml['tbody']);
	htmlTable.tablesorter();
	flotDatasets = {};
	$.each(ColDisplay, function(i,col) {
	    flotDatasets[col] = {
		'label': col,
		data: makeSeries(tabular, 'period', col)
	    };
	    flotDatasets0[col+index] = {
		'label': col,
		data: makeSeries(tabular, 'period', col)
	    };
	});
	setupFlot(flotDatasets, flotChartDiv);
	doFlotPlot(flotDatasets, flotChartDiv);

	// do post processing once all datasets loaded
	if(--ExpectedResponses == 0){
	    displayModels(flotDatasets0);
	}
	debug(ExpectedResponses);

    });
}

function displayModels(flotDatasets0){
      var flotChart0 = $('#flot-chart');
      setupFlot(flotDatasets0, flotChart0);
      doFlotPlot(flotDatasets0, flotChart0);
}