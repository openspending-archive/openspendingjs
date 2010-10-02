module('datastore');

test('breakdownIdentifierString', function() {
	console.log(WDMMG.datastore);
	var out = WDMMG.datastore.breakdownIdentifierString(
		{
			dataset: 'cra',
			breakdownKeys: ['from', 'region']
		}
	);
	var exp = 'slice=cra&breakdown-from=yes&breakdown-region=yes';
	equals(out, exp);

	var out = WDMMG.datastore.breakdownIdentifierString(
		{
			dataset: 'cra',
		}
	);
	var exp = 'slice=cra';
	equals(out, exp);
});

