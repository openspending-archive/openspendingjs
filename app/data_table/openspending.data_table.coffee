$ = OpenSpending.$

HTML = """
<table class="table table-striped table-condensed" cellpadding="0" cellspacing="0" border="0">
  <thead>
    <tr></tr>
  </thead>
  <tbody>
    <tr>
      <td class="dataTables_empty"> Loading data from server&hellip; </td>
    </tr>
  </tbody>
</table>
"""

class Column
  constructor: (@spec) ->
    if typeof @spec is 'string'
      @spec = {name: @spec}

    $.extend(this, @spec)

    if not @data?
      @data = @name

    if not @name?
      @label = '&nbsp;'

    if not @label?
      @label = @name

  render: (obj, item) ->
    console.log(item)
    if not item?.label?
      return item
    out = item.label;
    if item?.html_url?
      out = '<a href="' + item.html_url + '">' + out + '</a>'
    return out

class OpenSpending.DataTable
  options:
    source: '/api/2/search'
    columns: []
    defaultParams: {}

  constructor: (element, options) ->
    @options = $.extend(true, {}, @options, options)
    @element = $(element)
    @columns = {}
    @columnOrder = []
    @filters = {}

    # Reset HTML
    @element.html(HTML)

    # Parse and add columns
    for colspec in @options.columns
      this.addColumn(colspec)

  init: () ->
    @table = @element.find('table').dataTable
      bDestroy: true # destroy any previous datatable residing here
      bProcessing: true
      bServerSide: true
      iDisplayLength: 20
      bLengthChange: false
      aoColumnDefs: this._columnDefs()
      aaSorting: this._sorting()
      sAjaxSource: @options.source
      fnServerData: => this._serverData.apply(this, arguments)

  addColumn: (colspec) ->
    c = new Column(colspec)
    @columns[c.name] = c
    @columnOrder.push(c.name)
    @element.find('thead tr').append("<td>#{c.label}</td>")
    @element.find('.dataTables_empty').attr('colspan', @columns.length)

  addFilter: (key, value) ->
    @filters[key] = value

  removeFilter: (key) ->
    delete @filters[key]

  redraw: () ->
    @table.fnDraw()

  _columnDefs: () ->
    i = 0
    out = []
    for name in @columnOrder
      out.push
        aTargets: [i]
        mDataProp: @columns[name].data
        bSortable: @columns[name].sortable
        fnRender: @columns[name].render
      i += 1
    out

  _sorting: () ->
    [@columnOrder.indexOf(s[0]), s[1]] for s in @options.sorting

  _serverData: (src, params, callback, conf) ->
    # parse params into a single object
    p = {}
    for o in params
      p[o.name] = o.value
    params = p

    # translate dodgy hungarian notation into our own query language
    newparams = $.extend(true, {}, @options.defaultParams)

    # OFFSET and LIMIT
    newparams.page = (params.iDisplayStart / params.iDisplayLength) + 1
    newparams.pagesize = params.iDisplayLength

    # send ORDER BY as a single formatted field rather than many
    newparams.order = []
    for i in [0...params.iSortingCols]
      col = @columnOrder[params["iSortCol_#{i}"]]
      dir = params["sSortDir_#{i}"]
      newparams.order.push("#{col}:#{dir}")
    newparams.order = newparams.order.join("|")

    # filter
    newparams.filter = []
    for own k, v of @filters
      newparams.filter.push("#{k}:#{v}")
    newparams.filter = newparams.filter.join("|")

    # query
    newparams.q = params.sSearch

    # Make data request
    rq = $.get(@options.source, newparams)
    rq.fail OpenSpending.ajaxError("Source request failed. Params: #{JSON.stringify(params)}")

    rq.then (data) =>
      $(conf.oInstance).trigger('xhr', conf)
      callback(_parseResponse(data, params.sEcho))

    conf.jqXHR = rq # provide compatibility with original "fnServerData"

_parseResponse = (data, echo) ->
  sEcho: echo
  iTotalRecords: data.stats.results_count_query
  iTotalDisplayRecords: data.stats.results_count_query
  aaData: data.results
