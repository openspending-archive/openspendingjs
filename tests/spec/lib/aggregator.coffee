describe 'lib/aggregator', ->
  describe 'OpenSpending.aggregatorConfigFromQueryString', ->
    qs = null
    res = null

    beforeEach ->
      qs = 'drilldown=abc|xyz&breakdown=region&cut=time.year:2011&page=5'
      res = OpenSpending.aggregatorConfigFromQueryString(qs)

    it 'should parse drilldowns', ->
      expect(res.drilldowns).to.eql(['abc', 'xyz'])

    it 'should parse breakdown', ->
      expect(res.breakdown).to.eql('region')

    it 'should parse cuts', ->
      expect(res.cuts).to.eql(['time.year:2011'])
