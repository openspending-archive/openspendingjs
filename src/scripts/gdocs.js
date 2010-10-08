function gdocsToJavascript(gdocsSpreadsheet) {
	/*
	:options: (optional) optional argument dictionary:
		columnsToUse: list of columns to use (specified by header names)
		colTypes: dictionary (with column names as keys) specifying types (e.g. range, percent for use in conversion).
	:return: tabular data object (hash with keys: header and data).
	  
	Issues: seems google docs return columns in rows in random order and not even sure whether consistent across rows.
	*/
	var options = {};
	if (arguments.length > 1) {
		options = arguments[1];
	}
	var results = {
		'header': [],
		'data': []
	};
	// default is no special info on type of columns
	var colTypes = {};
	if (options.colTypes) {
		colTypes = options.colTypes;
	} 
	// either extract column headings from spreadsheet directly, or used supplied ones
	if (options.columnsToUse ) {
		// columns set to subset supplied
		results.header = options.columnsToUse;
	} else {
		// set columns to use to be all available
		if (gdocsSpreadsheet.feed.entry.length > 0) {
			for (var k in gdocsSpreadsheet.feed.entry[0]) {
				if (k.substr(0,3) == 'gsx') {
					var col=k.substr(4)
					results.header.push(col);
				}
			}
		}
	}

	// converts non numberical values that should be numerical (22.3%[string] -> 0.223[float])
	var rep = /^([\d\.\-]+)\%$/;
	$.each(gdocsSpreadsheet.feed.entry, function(i,entry) {
		var row = [];
		for (var k in results.header) {
			var col = results.header[k];
			var _keyname = 'gsx$' + col;
			var value = entry[_keyname]['$t'];
			// if labelled as % and value contains %, convert
			if (colTypes[col] == 'percent') {
				if(rep.test(value)){
					var value2=rep.exec(value);
					var value3=parseFloat(value2);
					value=value3/100;
				}
			}
			row.push(value);
		}
		results.data.push(row);
	});
	return results;
}

