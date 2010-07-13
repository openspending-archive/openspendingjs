function gdocsToJavascript(gdocsSpreadsheet) {
	/*

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
