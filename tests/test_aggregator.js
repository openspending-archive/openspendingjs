module('aggregator');

test('Test aggregatorConfigFromQueryString', function() {
  var queryString = 'drilldown=abc|xyz&breakdown=region&cut=time.year:2011&page=5'
  var out = OpenSpending.aggregatorConfigFromQueryString(queryString);
  console.log(out);
  deepEqual(out.drilldowns, ['abc', 'xyz']);
  deepEqual(out.breakdown, 'region');
  deepEqual(out.cuts, ['time.year:2011']);
});

