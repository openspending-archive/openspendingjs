module('model');

// TODO: mocks

test('Test Dataset', function() {
  var indata = {
    name: 'test-dataset',
    title: 'My New Dataset'
  };
  config = {
    endpoint: 'http://localhost:5000/'
  }
  var model = OpenSpending.Model(config);

  var dataset = new model.Dataset(indata);
  equals(dataset.url(), config.endpoint + indata.name + '.json');
  equals(dataset.get('title'), indata.title);
  var out = dataset.toJSON();
  equals(out.title, indata.title);

  var dataset = new model.Dataset(fixtures.datasets.sample);
  drilldownDims = dataset.drilldownDimensions();
  equals(drilldownDims.length, 4);

  var datasetId = 'lbhf-spending-2010';
  var dataset = new model.Dataset({
    'id': datasetId,
    'name': datasetId
  });
  // TODO: reenable once domain issues sorted
  // dataset.fetch();
  // equals(dataset.get('label'), 'London Borough of Hammersmith and Fulham Spending 2010');
});

