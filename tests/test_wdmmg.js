module("wdmmg.html");

test("test makeSeries", function() {
  var tabular = {
    'header': ['column-2', 'column-1'],
    data: [
      ['1','A'],
      ['2','B'],
      ['3','C']
    ]
  }
  var series = makeSeries(tabular, 'column-1','column-2');
  var exp = [['A','1'],['B','2'], ['C','3']];
  same(series, exp);
});

