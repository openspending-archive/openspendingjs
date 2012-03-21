$ = OpenSpending.$

# OpenSpending.Browser -- a thin wrapper around OpenSpending.DataTable and
# OpenSpending.Faceter to allow effective query and filter on a single dataset.

class OpenSpending.Browser

  # Public: creates an instance of OpenSpending.Browser in the passed
  # `element`, for the specified `dataset`. NB: The element may already
  # contain elements for the DataTable and Faceter, with classes
  # 'browser_datatable' and 'browser_faceter' respectively, otherwise the
  # browser will create these elements itself.
  #
  # element - A DOM element node in which to build the browser
  # dataset - The name of the dataset
  #
  # Returns: the Browser instance
  constructor: (element, @dataset) ->
    @element = $(element)
    @req = $.getJSON('/' + @dataset + '/dimensions.json')

    this._buildTable()
    this._buildFacets()

  init: () ->
    @req.then (data) =>
      @dimensions = {}
      for d in data
        @dimensions[d.key] = d

      @table.addColumn name: 'time.year', label: @dimensions.time.label
      @table.addColumn name: 'from.label', label: @dimensions.from.label
      @table.addColumn name: 'to.label', label: @dimensions.to.label
      @table.addColumn
        name: 'amount'
        label: 'Amount'
        data: (data) -> OpenSpending.Utils.formatAmountWithCommas(data.amount)
      @table.addColumn
        data: (data) => "<a href='/#{@dataset}/entries/#{data.id}'>details&raquo;</a>"
        sortable: false

      facetDimensions = for own k, d of @dimensions
                          if d.facet
                            d
                          else
                            continue
      @faceter.setDimensions(facetDimensions)

      @table.init()
      @faceter.init()
      @element.trigger('browser:init')

  # Public: add a filter on 'key:value' to this browser instance
  addFilter: (key, value) ->
    @faceter.addFilter(key, value)
    @table.addFilter(key, value)

  # Public: remove any filters on 'key'
  removeFilter: (key) ->
    @faceter.removeFilter(key)
    @table.removeFilter(key)

  # Public: refetch and redraw all subcomponents of the browser
  redraw: () ->
    @faceter.redraw()
    @table.redraw()

  # Private: build the DataTable instance for this browser
  _buildTable: ->
    tableEl = @element.find('.browser_datatable')[0]

    if tableEl.length is 0
      tableEl = $('<div class="browser_datatable"></div>').appendTo(@element)

    @table = new OpenSpending.DataTable(tableEl,
      sorting: [['amount', 'desc']]
      defaultParams: { dataset: @dataset }
    )

  # Private: build the Faceter instance for this browser
  _buildFacets: ->
    facetEl = @element.find('.browser_faceter')

    if facetEl.length is 0
      facetEl = $('<div class="browser_faceter"></div>').appendTo(@element)

    @faceter = new OpenSpending.Faceter(facetEl, [], {
      defaultParams:
        dataset: @dataset
        expand_facet_dimensions: true
    })

    # Rebind the addFilter/removeFilter events raised by the Faceter instance
    # to add/remove filters from the DataTable instance and redraw the table
    # as appropriate.
    @faceter.element.off 'faceter:addFilter'
    @faceter.element.off 'faceter:removeFilter'
    @faceter.element.on 'faceter:addFilter', (e, k, v) =>
      this.addFilter(k, v, false)
      this.redraw()
    @faceter.element.on 'faceter:removeFilter', (e, k) =>
      this.removeFilter(k, false)
      this.redraw()
