describe 'lib/datastore', ->
  describe 'OpenSpending.Datastore', ->
    it 'should load config from its constructor argument', ->
      config = {
        endpoint: "http://my.openspending.org/"
      }
      datastore = OpenSpending.Datastore(config)
      expect(datastore.config.endpoint).to.eql(config.endpoint)
