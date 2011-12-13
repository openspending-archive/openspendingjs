# PluginFactory. Make a jQuery plugin out of a Class.
$.plugin = (name, object) ->
  # create a new plugin with the given name on the global jQuery object
  jQuery.fn[name] = (options) ->

    args = Array::slice.call(arguments, 1)
    this.each ->

      # check the data() cache, if it's there we'll call the method requested
      instance = $.data(this, name)
      if instance
        options && instance[options].apply(instance, args)
      else
        instance = new object(this, options)
        $.data(this, name, instance)

$.a2o = (ary) ->
  obj = {}

  walk = (o, path, value) ->
    key = path[0]

    # Path started as something like foo[bar][], indicating that foo.bar is an
    # array
    if path.length == 2 and path[1] == ''
      o[key] = [] unless $.type(o[key]) is 'array'
      o[key].push(value)

    # At the end of the walk
    # FIXME
    else if path.length == 1
      if key isnt "key"
        o[key] = value
      else if value is "true"
        o[key] = true

    # Keep walking down the object
    else
      o[key] = {} unless $.type(o[key]) is 'object'
      walk(o[key], path[1..-1], value)

  $.each ary, ->
    path = this.name.split('[')
    path = [path[0], (p[0..-2] for p in path[1..-1])...]
    walk(obj, path, this.value)

  obj

# Serialize a form to a nested JSON object
$.fn.serializeObject = ->
  ary = this.serializeArray()
  $.a2o(ary)

