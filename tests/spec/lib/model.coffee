describe 'lib/model', ->
  describe 'OpenSpending.Model', ->
    model = null

    it 'should load a config from its constructor argument', ->
      model = OpenSpending.Model(endpoint: 'http://example.com/')
      expect(model.config.endpoint).to.equal('http://example.com/')

    describe '.Dataset', ->
      dataset = null
      server = null

      beforeEach ->
        model = OpenSpending.Model(endpoint: 'http://example.com/')
        dataset = new model.Dataset(name: 'test-dataset', title: 'My New Dataset')


      it 'should construct dataset objects', ->
        expect(dataset).to.exist

      describe '.url()', ->
        it 'should return the API endpoint for the dataset object', ->
          expect(dataset.url()).to.equal('http://example.com/test-dataset.json')

      describe '.drilldownDimensions()', ->
        it 'should return the list of drilldown dimensions', ->
          ds = new model.Dataset(fixtures.datasets.sample)
          expect(ds.drilldownDimensions()).to.have.length(4)

      # describe '.fetch()', ->
      #   server = null

      #   beforeEach ->
      #     server = sinon.fakeServer.create()

      #   afterEach ->
      #     server.restore()

      #   it 'should fetch dataset metadata from the server', ->
      #     dsId = 'lbhf-spending-2010'

      #     server.respondWith(
      #       "GET", "http://example.com/#{dsId}.json",
      #       [200, { "Content-Type": "application/json" }, '{ "label": "London Borough of ..." }']
      #     )

      #     ds = new model.Dataset(id: dsId, name: dsId)
      #     ds.fetch()

      #     expect(ds.get('label')).to.equal("London Borough of ...")
