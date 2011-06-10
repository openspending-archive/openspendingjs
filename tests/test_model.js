module('model');

// TODO: mocks

test('Test Dataset', function() {
  var indata = {
    title: 'My New Dataset',
  };
  var model = OpenSpending.Model();
  var dataset = new model.Dataset(indata);

  equals(dataset.get('title'), indata.title);
  var out = dataset.toJSON();
  equals(out.title, indata.title);
});

