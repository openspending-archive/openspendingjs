describe 'lib/utils/utils', ->
  describe 'OpenSpending.Utils.formatAmount(amount)', ->
    testset = [
      [9000, '9k']
      [9000000, '9m']
      [9000000000, '9bn']
      [-9000, '-9k']
      [-9000000, '-9m']
    ]

    for x in testset
      it "should format #{x[0]} as #{x[1]}", ->
        expect(OpenSpending.Utils.formatAmount(x[0])).to.equal(x[1])

  describe 'OpenSpending.Utils.formatAmountWithCommas(amount)', ->

    testset = [
      [9000, '9,000']
      [9000000, '9,000,000']
      [9000000000, '9,000,000,000']
      [-9000, '-9,000']
      [-9000000, '-9,000,000']
    ]

    for x in testset
      it "should format #{x[0]} as #{x[1]}", ->
        expect(OpenSpending.Utils.formatAmountWithCommas(x[0])).to.equal(x[1])

  describe 'OpenSpending.Utils.formatAmountWithCommas(amount, 2)', ->

    testset = [
      [9000, '9,000.00']
      [-9000, '-9,000.00']
    ]

    for x in testset
      it "should format #{x[0]} as #{x[1]}", ->
        expect(OpenSpending.Utils.formatAmountWithCommas(x[0], 2)).to.equal(x[1])


  describe 'parseQueryString(qs)', ->
    it 'should parse a query string', ->
      testdata = 'i=main&mode=front&sid=de8d49b78a85a322c4155015fdce22c4&enc=+Hello%20&empty'
      out = parseQueryString(testdata)
      exp = [
        ['i', "main"]
        ['mode', "front"]
        ['sid', "de8d49b78a85a322c4155015fdce22c4"]
        ['enc', " Hello "]
        ['empty', ""]
      ];
      expect(out).to.eql(exp)

  describe 'writeTabularAsHtml({header: [...], data: [...]}, options)', ->

    header = null
    data = null
    out = null

    beforeEach ->
      header = ['column-1', 'column-2']
      data = [
        ['1', 'A']
        ['2', 'b']
        ['3', 'c']
      ]
      out = writeTabularAsHtml(header: header, data: data)

    it 'should return an object with "tbody" and "thead" entries', ->
      expect(out).to.have.keys(['tbody', 'thead'])

    it 'should write column headers into the "thead" html', ->
      expect(out.thead.html()).to.have.string('<th>column-1</th>')
      expect(out.thead.html()).to.have.string('<th>column-2</th>')

    it 'should set column names from options.displayNames, if provided', ->
      out = writeTabularAsHtml(
        {header: header, data: data},
        {displayNames: {'column-2': 'Column 2'}}
      )
      expect(out.thead.html()).to.have.string('<th>Column 2</th>')
      expect(out.thead.html()).to.not.have.string('<th>column-2</th>')

    it 'should write data into the "tbody" html', ->
      res = (x.innerHTML for x in out.tbody.find('td'))
      expect(res).to.eql(['1', 'A', '2', 'b', '3', 'c'])



