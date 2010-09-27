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

function writeTabularAsHtml(tabular) {
	/*
	Write tabular data as HTML table.
	
		:tabular: tabular data object (dict with header and data keys).
		:options: optional keyword arguments:
			colTypes: types of columns keyed by column name
			displayNames: ditto for display names for columns
   */
	var options = {};
	if (arguments.length > 1) {
		options = arguments[1];
	}
	var colTypes = {};
	var displayNames = {};
	if (options.colTypes) {
		colTypes = options.colTypes;
	}
	if (options.displayNames) {
		displayNames = options.displayNames;
	}
	// knows how to format and justify based on combination of col type labelling (via colTypes)
	// and value based logic
	var _ColType=[];
	var _thead = $('<thead></thead>');
	$.each(tabular.header, function(i,col) {
		var tempDisplayName = displayNames[col] ? displayNames[col] : col;
		_thead.append($('<th></th>').append(tempDisplayName));
		if (colTypes[col]) {
			_ColType[i]=colTypes[col];
		}
	});
	var _tbody = $('<tbody></tbody>');
	// var red = /^(19|20)\d{2}$/; - replaced by _ColType
	// var rep = /^([\d\.\-]+)\%$/; - replaced by _ColType
	var ren = /^[\d\.\-]+$/;
	var reb = /^$/;
	$.each(tabular.data, function(i,row) {
	var _newrow = $('<tr></tr>');
	$.each(row, function(j, cell) {
		// decide action depending on type
		var cell2;
		if(_ColType[j] == 'range'){
		// year range
		var cell3 = parseFloat(cell);
		cell3++;
		cell2=cell+'-'+cell3;
		   	_newrow.append($('<td></td>').append(cell2));
		}else if(reb.test(cell)){
		// blank
		cell2='';
		_newrow.append($('<td></td>').append(cell2));
		}else if(_ColType[j] == 'percent'){
		// percent
		// 20.5% saved as 0.205. Converted back here to 20.5%
		var cell3=cell*100;
		cell2=cell3.toFixed(1)+'%';
		_newrow.append($('<td class="amount"></td>').append(cell2));
		}else if(ren.test(cell)){
		// number
		var cell3=parseFloat(cell);
		cell2=cell3.toFixed(0);
		_newrow.append($('<td class="amount"></td>').append(cell2));
		}else{
		// other
		cell2=cell;
		_newrow.append($('<td></td>').append(cell2));
		}
	});
	_tbody.append(_newrow);
	});
	return {'thead': _thead, 'tbody': _tbody};
}

