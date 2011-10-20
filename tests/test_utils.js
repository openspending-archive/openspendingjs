module('utils');

test('formatNumber', function() {
  var testset = [
    [9000, '9k'],
    [9000000, '9m'],
    [9000000000, '9bn'],
    [-9000, '-9k'],
    [-9000000, '-9m'],
  ];
  for(var i in testset) {
    equals(OpenSpending.Utils.formatAmount(testset[i][0]), testset[i][1]);
  }
});

test('formatNumberWithCommas', function() {
  var testset = [
    [9000, '9,000'],
    [9000000, '9,000,000'],
    [9000000000, '9,000,000,000'],
    [-9000, '-9,000'],
    [-9000000, '-9,000,000'],
  ];
  for(var i in testset) {
    equals(OpenSpending.Utils.formatAmountWithCommas(testset[i][0]), testset[i][1]);
  }
  var testset = [
    [9000, '9,000.00'],
    [-9000, '-9,000.00'],
  ];
  for(var i in testset) {
    equals(OpenSpending.Utils.formatAmountWithCommas(testset[i][0], 2), testset[i][1]);
  }
});

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

