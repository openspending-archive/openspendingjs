DEFAULT_MAPPING =
  amount:
    type: 'measure'
    datatype: 'float'
    label: 'Amount'
  time:
    type: 'date'
    datatype: 'date'
    label: 'Time'
#  from:
#    type: 'compound'
#    label: 'Spender'
#  to:
#    type: 'compound'
#    label: 'Recipient'

DIMENSION_TYPE_META =
  date:
    fixedDataType: true
    helpText: '''
              The time dimension represents the time or period over which the
              spending occurred. Please choose the column of your dataset which
              contains an ISO8601 formatted date (YYYY, YYYY-MM, YYYY-MM-DD, etc.).
              '''
  measure:
    fixedDataType: true
    helpText: '''
              The most important field in the dataset. Please choose which of
              the columns in your dataset represents the value of the spending,
              and how you'd like it to be displayed.
              '''



FIELDS_META =
  label:
    required: true
  name:
    required: true


util =
  # Turns a nested object into a flat mapping with PHP-like query string
  # parameters as keys.
  #
  # Examples
  #
  #   # Flatten a nested object structure
  #   flattenObject({'one': {'two': 'foo'}})
  #   # => Returns {'one[two]': 'foo'}
  #
  #   # Flatten an object containing arrays
  #   flattenObject({'list': [1,2,3]})
  #   # => Returns {'list[]': [1,2,3]}
  #
  # Returns the flattened object
  flattenObject: (obj) ->
    flat = {}

    pathStr = (path) ->
      ary = [path[0]]
      ary = ary.concat("[#{p}]" for p in path[1..-1])
      ary.join ''

    walk = (path, o) ->
      for key, value of o
        newpath = $.extend([], path)
        newpath.push(key)

        if $.type(value) is 'object'
          walk newpath, value
        else
          if $.type(value) is 'array'
            newpath.push ''

          flat[pathStr(newpath)] = value

    walk([], obj)
    flat

  compoundType: (type) ->
    $.inArray(type, ['attribute', 'value', 'date', 'measure']) == -1

  # FIXME? this may not deal with complex form elements such as radio
  # buttons or <select multiple>.
  flattenForm: (data, form) ->
    str_of_bool = (b)   -> if b then "true" else "false"
    elt_is_bool = (elt) -> elt.hasClass('boolean')

    # Populate straightforward bits
    for k, v of util.flattenObject(data)
      el = form.find("[name=\"#{k}\"]")
      v = if (elt_is_bool el) then (str_of_bool v) else v
      el.val(v)


class Widget extends Delegator
  deserialize: (data) ->


class DimensionWidget extends Widget
  events:
    '.add_field click': 'onAddFieldClick'
    '.field_rm click': 'onFieldRemoveClick'

  constructor: (name, container, nameContainer, options) ->
    @name = name
    el = $("<fieldset class='dimension tab-pane' data-dimension-name='#{@name}'>
            </fieldset>").appendTo(container)

    super el, options

    @id = "#{@element.parents('.modeleditor').attr('id')}_dim_#{@name}"
    this.linkText().appendTo(nameContainer)
    @element.attr('id', @id)
    
    #@meta = DIMENSION_TYPE_META[@name] or {}

  linkText: () ->
    $("<li><a href='##{@id}'>#{@name}</li>")

  deserialize: (data) ->

    @data = data?[@name] or {}
    @meta = DIMENSION_TYPE_META[@data['type']] or {}

    # Prepopulate field-less dimensions with a label field
    if util.compoundType(data.type) and 'attributes' not of @data
      @data.attributes = {'name': {'datatype': 'id'}, 'label': {'datatype': 'string'}}

    @element.html($.tmpl('tpl_dimension', this))
    @element.trigger('fillColumnsRequest', [@element.find('select.column')])

    formObj = {}
    formObj[@name] = @data

    util.flattenForm(formObj, @element)

  formFieldPrefix: (fieldName) =>
    "#{@name}[attributes][#{fieldName}]"

  formFieldRequired: (fieldName) =>
    FIELDS_META[fieldName]?['required'] or false

  onAddFieldClick: (e) ->
    name = prompt("Field name:").trim()
    row = this._makeFieldRow(name)
    row.appendTo(@element.find('tbody'))

    @element.trigger('fillColumnsRequest', [row.find('select.column')])
    return false

  onFieldRemoveClick: (e) ->
    $(e.currentTarget).parents('tr').first().remove()
    @element.parents('form').first().change()
    return false

  _makeFieldRow: (name, constant=false) ->
    $.tmpl 'tpl_dimension_field',
      'fieldName': name
      'prefix': this.formFieldPrefix
      'required': this.formFieldRequired

class DimensionsWidget extends Delegator
  events:
    '.add_attribute_dimension click': 'onAddAttributeDimensionClick'
    '.add_compound_dimension click': 'onAddCompoundDimensionClick'
    '.add_date_dimension click': 'onAddDateDimensionClick'
    '.add_measure click': 'onAddMeasureClick'
    '.rm_dimension click': 'onRemoveDimensionClick'

  constructor: (element, modelEditor, options) ->
    super

    @widgets = []
    @dimsEl = @element.find('.dimensions').get(0)
    @dimNamesEl = $(modelEditor?.namesHook) || @element.find('.dimension-names').get(0)
    @modelEditor = modelEditor

  addDimension: (name) ->
    w = new DimensionWidget(name, @dimsEl, @dimNamesEl)
    @widgets.push(w)
    return w

  refreshNames: () ->
    $(@dimNamesEl).empty()
    w.linkText().appendTo(@dimNamesEl) for w in @widgets

  removeDimension: (name) ->
    idx = null

    for w in @widgets
      if w.name is name
        idx = @widgets.indexOf(w)
        break

    if idx isnt null
      @widgets.splice(idx, 1)[0].element.remove()

    delete @modelEditor.data[name]
    this.refreshNames()
    @element.trigger('modelChange')

  deserialize: (data) ->
    return if @ignoreParent

    dims = data or {}
    toRemove = []

    for widget in @widgets
      if widget.name of dims
        widget.deserialize(data)
        delete dims[widget.name]
      else
        toRemove.push(widget.name)

    # Remove any widgets not in dims
    for name in toRemove
      this.removeDimension(name)

    # Any keys left in dims need to be added
    for name, obj of dims
      this.addDimension(name).deserialize(data)

  promptAddDimension: (props) ->
    name = prompt("Dimension name:")
    return false unless name
    data = {}
    data[name] = props
    this.addDimension(name.trim()).deserialize(data)

  onAddAttributeDimensionClick: (e) ->
    this.promptAddDimension({'type': 'attribute'})
    return false

  onAddCompoundDimensionClick: (e) ->
    this.promptAddDimension({'type': 'compound'})
    return false
  
  onAddDateDimensionClick: (e) ->
    this.promptAddDimension({'type': 'date', 'datatype': 'date'})
    return false
  
  onAddMeasureClick: (e) ->
    this.promptAddDimension({'type': 'measure', 'datatype': 'float'})
    return false

  onRemoveDimensionClick: (e) ->
    dimension = $(e.srcElement).attr('rm-dim')
    this.removeDimension(dimension)
    return false

class ModelEditor extends Delegator
  widgetTypes:
    '.dimensions_widget': DimensionsWidget

  events:
    'modelChange': 'onModelChange'
    'fillColumnsRequest': 'onFillColumnsRequest'
    '.forms form submit': 'onFormSubmit'
    '.forms form change': 'onFormChange'

  constructor: (element, options) ->
    super
    data = options.mapping || options.analysis.mapping || DEFAULT_MAPPING
    @target = options.target
    @data = $.extend(true, {}, data)
    @widgets = []
    @namesHook = options?.namesHook

    @form = $(element).find('.forms form').eq(0)

    @id = @element.attr('id')
    if not @id?
      @id = Math.floor((Math.random()*0xffffffff)).toString(16)
      @element.attr('id', @id)

    # Precompile templates
    @element.find('script[type="text/x-jquery-tmpl"]').each  ->
      $(this).template($(this).attr('id'))

    # Initialize column select boxes
    @element.find('select.column').each ->
      $(this).trigger('fillColumnsRequest', [this])

    # Initialize widgets
    for selector, ctor of @widgetTypes
      @widgets.push(new ctor(e, this)) for e in @element.find(selector).get()

    @element.trigger 'modelChange'

  onFormChange: (e) ->
    return if @ignoreFormChange

    @data = @form.serializeObject()

    @ignoreFormChange = true
    @element.trigger 'modelChange'
    @ignoreFormChange = false

  onFormSubmit: (e) ->
    return false

  onModelChange: () ->
    util.flattenForm(@data, @form)

    # Send updated model copy to each subcomponent, as more complex
    # components may not have been correctly filled out by the above.
    for w in @widgets
      w.deserialize($.extend(true, {}, @data))

    payload = JSON.stringify(@data, null, 2)
    $(@options.target).val(payload)
    @updateEditor(payload)

  onFillColumnsRequest: (elem) ->
    $(elem).html(
      ("<option name='#{x}'>#{x}</option>" for x in @options.columns).join('\n')
    )

  updateEditor: (data) ->
    getEditor = @options.getEditor
    return getEditor?()?.getSession().setValue(data)

$.plugin 'modelEditor', ModelEditor

this.ModelEditor = ModelEditor
