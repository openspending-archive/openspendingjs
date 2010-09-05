function gdocsToJavascript(gdocsSpreadsheet) {
    /*
      :return: tabular data object (hash with keys: header and data).
      
      Issues: seems google docs return columns in rows in random order and not even sure whether consistent across rows.
    */
    var results = {
	'header': [],
	'data': []
    };
    // either extract column headings from spreadsheet directly, or used supplied ones    
    if (arguments.length == 1) {
	// columnes set to all extracted
	if (gdocsSpreadsheet.feed.entry.length > 0) {
	    for (var k in gdocsSpreadsheet.feed.entry[0]) {
		if (k.substr(0,3) == 'gsx') {
		    var col=k.substr(4)
		    results.header.push(col);
		}
	    }
	}
    } else {
	// columns set to subset supplied
	results.header = arguments[1];
    }
    // converts non numberical values that should be numerical (22.3%[string] -> 0.223[float])
    var rep = /^([\d\.\-]+)\%$/;
    $.each(gdocsSpreadsheet.feed.entry, function(i,entry) {
	var row = [];
	for (var k in results.header) {
	    var col=results.header[k];
	    var _keyname = 'gsx$' + col;
	    var value=entry[_keyname]['$t'];
	    // if labelled as % and value contains %, convert
	    if(ColTypes[col] == 'percent'){
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
    // knows how to format and justify based on combination of col type labelling (via ColTypes)
    // and value based logic
    var _ColType=[];
    var _thead = $('<thead></thead>');
    $.each(tabular.header, function(i,col) {
	_thead.append($('<th></th>').append(DisplayNames[col]));
	if(ColTypes[col]){
	    _ColType[i]=ColTypes[col];
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
		var cell3=parseFloat(cell);
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

