module('datastore');

test('Test Datastore', function() {
  var config = {
    endpoint: "http://my.openspending.org/"
  };
  var datastore = OpenSpending.Datastore(config);
  equals(datastore.config.endpoint, config.endpoint);
});
