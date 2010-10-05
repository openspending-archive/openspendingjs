module('utils');

test('parseQueryString', function() {
	var testdata = 'i=main&mode=front&sid=de8d49b78a85a322c4155015fdce22c4&enc=+Hello%20&empty'
	var out = parseQueryString(testdata);
	var exp = [
		['i', "main"],
		['mode', "front"],
		['sid', "de8d49b78a85a322c4155015fdce22c4"],
		['enc', " Hello "],
		['empty', ""]
	];
	same(out, exp);
});

test("writeTabularAsHtml", function() {
	var res1 = {
		header: ['column-2', 'column-1'],
		data: [
			['1', 'A'],
			['2', 'b'],
			['3', 'c']
		]
	}
	var out = writeTabularAsHtml(res1);
	var tbody = out['tbody'];
	var thead = out['thead'];
	equals(tbody[0].nodeName, 'TBODY');
	equals(thead[0].nodeName, 'THEAD');
	equals(thead[0].innerHTML.substr(0,12), '<th>column-2');

	var out = writeTabularAsHtml(res1, {'displayNames': {'column-2': 'Column 2'}});
	var thead = out['thead'];
	equals(thead[0].innerHTML.substr(0,12), '<th>Column 2');
});

