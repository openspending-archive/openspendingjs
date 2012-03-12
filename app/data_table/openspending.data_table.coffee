$ = OpenSpending.$

ajaxError = (msg) ->
  return (rq, _, status) ->
    console.error("OpenSpending Ajax Error: #{msg} (#{status})", rq)

class OpenSpending.DataTable
  options:
    source: '/api/2/search'
    columnDefs: []
    defaultParams: {}

  constructor: (element, options) ->
    @options = $.extend(true, {}, @options, options)
    @element = $(element)
    @filters = {}

    @table = @element.dataTable
      bDestroy: true # destroy any previous datatable residing here
      bProcessing: true
      bServerSide: true
      aoColumnDefs: @options.columnDefs
      aaSorting: @options.sorting
      sAjaxSource: @options.source
      fnServerData: => this._serverData.apply(this, arguments)

  addFilter: (key, value) ->
    @filters[key] = value

  removeFilter: (key) ->
    delete @filters[key]

  draw: () ->
    @table.fnDraw()

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
      col = @element.find('th').eq(params["iSortCol_#{i}"]).data('field')
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
    rq.fail ajaxError("Source request failed. Params: #{JSON.stringify(params)}")

    rq.then (data) =>
      $(conf.oInstance).trigger('xhr', conf)
      callback(this._parseResponse(data, params.sEcho))

    conf.jqXHR = rq # provide compatibility with original "fnServerData"

  _parseResponse: (data, echo) ->
    sEcho: echo
    iTotalRecords: data.stats.results_count_query
    iTotalDisplayRecords: data.stats.results_count_query
    aaData: data.results
