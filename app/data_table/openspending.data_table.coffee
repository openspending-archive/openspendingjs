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
    if not item?.label?
      return item
    out = item.label;
    if item?.html_url?
      out = '<a data-name="' + item.name + '" href="' + item.html_url + '">' + out + '</a>'
    return out

class OpenSpending.DataTable
  options:
    source: '/api/2/search'
    columns: []
    resultCollection: (data) -> data.results
    fullCount: (data) -> data.stats.results_count_query
    defaultParams: {}
    tableOptions: {}

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
    tableOptions = 
      bDestroy: true # destroy any previous datatable residing here
      bProcessing: true
      bServerSide: true
      iDisplayLength: 15
      bLengthChange: false
      aoColumnDefs: this._columnDefs()
      aaSorting: this._sorting()
      sAjaxSource: @options.source
      fnServerData: => this._serverData.apply(this, arguments)
    @table = @element.find('table').dataTable $.extend(tableOptions, @options.tableOptions)

  addColumn: (colspec) ->
    c = new Column(colspec)
    c.width = c.width or 'auto'
    @columns[c.name] = c
    @columnOrder.push(c.name)
    @element.find('thead tr').append("<th width='#{c.width}'>#{c.label}</th>")
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
    [_.indexOf(@columnOrder,s[0]), s[1]] for s in @options.sorting

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
    @lastParams = newparams

    # Make data request
    rq = $.ajax
      url: @options.source
      jsonpCallback: 'key_' + btoa($.param(newparams)).replace(/\=/g, '')
      cache: true
      data: newparams
      dataType: 'jsonp'
    
    rq.fail OpenSpending.ajaxError("Source request failed. Params: #{JSON.stringify(params)}")

    rq.then (data) =>
      $(conf.oInstance).trigger('xhr', conf)
      callback(_parseResponse(data, params.sEcho, @options))

    conf.jqXHR = rq # provide compatibility with original "fnServerData"

_parseResponse = (data, echo, options) ->
  sEcho: echo
  iTotalRecords: options.fullCount(data)
  iTotalDisplayRecords: options.fullCount(data)
  aaData: options.resultCollection(data)
