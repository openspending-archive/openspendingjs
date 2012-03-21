$ = OpenSpending.$

class OpenSpending.Faceter
  options:
    source: '/api/2/search'
    defaultParams: {}

  constructor: (element, @dimensions, options) ->
    @options = $.extend(true, {}, @options, options)
    @element = $(element)
    @element.html('')
    @facetEls = {}
    @filters = {}

    @element.on 'click', '.filter',     => this.onFacetFilter.apply(this, arguments)
    @element.on 'click', '.unfilter',   => this.onFacetUnfilter.apply(this, arguments)
    @element.on 'faceter:addFilter', =>
      this.addFilter.apply(this, arguments)
      this.redraw()
    @element.on 'faceter:removeFilter', =>
      this.removeFilter.apply(this, arguments)
      this.redraw()

  init: () ->
    this.redraw()

  redraw: () ->
    params = $.extend(true, {}, @options.defaultParams, {
      pagesize: 0
      facet_field: (d.key for d in @dimensions).join('|')
      filter: ("#{k}:#{v}" for own k, v of @filters).join("|")
    })
    rq = $.getJSON(@options.source, params)

    rq.then (data) =>
      @facets = data.facets
      @element.empty()
      for dim in @dimensions
        this._drawDimension(dim)

    rq.fail OpenSpending.ajaxError("Source request failed. Params: #{JSON.stringify(params)}")

  addFilter: (k, v) ->
    @filters[k] = v

  removeFilter: (k) ->
    if k of @filters
      delete @filters[k]

  setDimensions: (d) ->
    @dimensions = d

  onFacetFilter: (e) ->
    k = $(e.target).attr('data-key')
    v = $(e.target).attr('data-value')

    @element.trigger('faceter:addFilter', [k, v])
    return false

  onFacetUnfilter: (e) ->
    k = $(e.target).attr('data-key')

    @element.trigger('faceter:removeFilter', [k])
    return false

  _drawDimension: (dim) ->
    @facetEls[dim.key] = $("""
      <h4>#{dim.label or dim.name}</h4>
      <table class="table table-condensed facets"><tbody></tbody></table>
    """).appendTo(@element)

    for [member, count] in @facets[dim.key]
      key = dim.key
      value = if member.name? then member.name else member
      label = if member.label? then member.label else member
      if key not of @filters or @filters[key] is value
        @facetEls[dim.key].find('tbody').append("""
          <tr>
            <td width="5%" class="count num">#{count}</td>
            <td>
              <a class="#{if key of @filters then 'unfilter' else 'filter'}"
                 data-key="#{key}"
                 data-value="#{value}"
                 href="#">
                #{label}
              </a>
            </td>
          </tr>
        """)
