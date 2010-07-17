function displayModel(modelConfig, htmlTable, flotChartDiv) {
	/**
	  Display a budget 'model'.

	  modelConfig - see budgetizer-config.js
	  */
	var apiurl = modelConfig.spreadsheet_feed_url;
	$.getJSON(apiurl, function(data) {
		var tabular = gdocsToJavascript(data, modelConfig.columns);
		var filterFunc = function(row) {
			return row[0] != 'NOTES';
		}
		tabular.data = tabular.data.filter(filterFunc);
		var tabularHtml = writeTabularAsHtml(tabular);
		htmlTable.append(tabularHtml['thead']);
		htmlTable.append(tabularHtml['tbody']);
		htmlTable.tablesorter();
		flotDatasets = {};
		$.each(['gdp', 'receipts', 'expenditure', 'deficit'], function(i,col) {
			flotDatasets[col] = {
				'label': col,
				data: makeSeries(tabular, 'period', col)
			};
		});
		setupFlot(flotDatasets, flotChartDiv);
		doFlotPlot(flotDatasets, flotChartDiv);
	});
}
