module('datastore');

test('Test Datastore', function() {
  config = {
    endpoint: "http://my.openspending.org/"
  }
  var datastore = OpenSpending.Datastore(config);
  equals(datastore.config.endpoint, config.endpoint);
});
