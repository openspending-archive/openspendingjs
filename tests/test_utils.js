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

