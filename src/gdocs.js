function gdocsToJavascript(gdocsSpreadsheet) {
	/*
	:return: tabular data object (hash with keys: header and data).

	Issues: seems google docs return columns in rows in random order and not even sure whether consistent across rows.
	*/
	var results = {
		'header': [],
		'data': []
	}
	if (arguments.length == 1) {
		if (gdocsSpreadsheet.feed.entry.length > 0) {
			for (var k in gdocsSpreadsheet.feed.entry[0]) {
				if (k.substr(0,3) == 'gsx') {
					results.header.push(k.substr(4));
				}
			}
		}
	} else {
		results.header = arguments[1];
	}
	$.each(gdocsSpreadsheet.feed.entry, function(i,entry) {
		var row = [];
		for (var k in results.header) {
			var _keyname = 'gsx$' + results.header[k];
			row.push(entry[_keyname]['$t']);
		}
		results.data.push(row);
	});
	return results;
}

function writeTabularAsHtml(tabular) {
	var _thead = $('<thead></thead>');
	$.each(tabular.header, function(i,col) {
		_thead.append($('<th></th>').append(col));
	});
	var _tbody = $('<tbody></tbody>');
	$.each(tabular.data, function(i,row) {
		var _newrow = $('<tr></tr>');
		$.each(row, function(j, cell) {
		  _newrow.append($('<td></td>').append(cell));
		});
		_tbody.append(_newrow);
	});
	return {'thead': _thead, 'tbody': _tbody};
}

