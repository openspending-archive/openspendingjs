(function() {
  var AddDimensionWidget, DEFAULT_MAPPING, DIMENSION_TYPE_META, Delegator, DimensionWidget, DimensionsWidget, FIELDS_META, ModelEditor, UniquesWidget, Widget, dim_config, log, util,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $.plugin = function(name, object) {
    return jQuery.fn[name] = function(options) {
      var args;
      args = Array.prototype.slice.call(arguments, 1);
      return this.each(function() {
        var instance;
        instance = $.data(this, name);
        if (instance) {
          return options && instance[options].apply(instance, args);
        } else {
          instance = new object(this, options);
          return $.data(this, name, instance);
        }
      });
    };
  };

  $.a2o = function(ary) {
    var obj, walk;
    obj = {};
    walk = function(o, path, value) {
      var key;
      key = path[0];
      if (path.length === 2 && path[1] === '') {
        if ($.type(o[key]) !== 'array') o[key] = [];
        return o[key].push(value);
      } else if (path.length === 1) {
        if ($.inArray(key, ["key", "facet"]) === -1) {
          return o[key] = value;
        } else if (value === "true") {
          return o[key] = true;
        } else {
          return delete o[key];
        }
      } else {
        if ($.type(o[key]) !== 'object') o[key] = {};
        return walk(o[key], path.slice(1), value);
      }
    };
    $.each(ary, function() {
      var p, path;
      path = this.name.split('[');
      path = [path[0]].concat(__slice.call((function() {
          var _i, _len, _ref, _results;
          _ref = path.slice(1);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            p = _ref[_i];
            _results.push(p.slice(0, -1));
          }
          return _results;
        })()));
      return walk(obj, path, this.value);
    });
    return obj;
  };

  $.fn.serializeObject = function() {
    var ary;
    ary = this.serializeArray();
    return $.a2o(ary);
  };

  $.fn.insertAt = function(idx, element) {
    var lastIdx;
    lastIdx = this.children().size();
    if (idx < 0) idx = Math.max(0, lastIdx + 1 + idx);
    this.append(element);
    if (idx < lastIdx) this.children().eq(idx).before(this.children().last());
    return this;
  };

  Delegator = (function() {

    Delegator.prototype.events = {};

    Delegator.prototype.options = {};

    Delegator.prototype.element = null;

    function Delegator(element, options) {
      this.options = $.extend(true, {}, this.options, options);
      this.element = $(element);
      this.on = this.subscribe;
      this.addEvents();
    }

    Delegator.prototype.addEvents = function() {
      var event, functionName, sel, selector, _i, _ref, _ref2, _results;
      _ref = this.events;
      _results = [];
      for (sel in _ref) {
        functionName = _ref[sel];
        _ref2 = sel.split(' '), selector = 2 <= _ref2.length ? __slice.call(_ref2, 0, _i = _ref2.length - 1) : (_i = 0, []), event = _ref2[_i++];
        _results.push(this.addEvent(selector.join(' '), event, functionName));
      }
      return _results;
    };

    Delegator.prototype.addEvent = function(bindTo, event, functionName) {
      var closure, isBlankSelector,
        _this = this;
      closure = function() {
        return _this[functionName].apply(_this, arguments);
      };
      isBlankSelector = typeof bindTo === 'string' && bindTo.replace(/\s+/g, '') === '';
      if (isBlankSelector) bindTo = this.element;
      if (typeof bindTo === 'string') {
        this.element.delegate(bindTo, event, closure);
      } else {
        if (this.isCustomEvent(event)) {
          this.subscribe(event, closure);
        } else {
          $(bindTo).bind(event, closure);
        }
      }
      return this;
    };

    Delegator.prototype.isCustomEvent = function(event) {
      var natives;
      natives = "blur focus focusin focusout load resize scroll unload click dblclick\nmousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\nchange select submit keydown keypress keyup error".split(/[^a-z]+/);
      event = event.split('.')[0];
      return $.inArray(event, natives) === -1;
    };

    Delegator.prototype.publish = function() {
      this.element.triggerHandler.apply(this.element, arguments);
      return this;
    };

    Delegator.prototype.subscribe = function(event, callback) {
      var closure;
      closure = function() {
        return callback.apply(this, [].slice.call(arguments, 1));
      };
      closure.guid = callback.guid = ($.guid += 1);
      this.element.bind(event, closure);
      return this;
    };

    Delegator.prototype.unsubscribe = function() {
      this.element.unbind.apply(this.element, arguments);
      return this;
    };

    return Delegator;

  })();

  DEFAULT_MAPPING = {
    amount: {
      type: 'measure',
      datatype: 'float',
      label: 'Amount'
    },
    time: {
      type: 'date',
      datatype: 'date',
      label: 'Time'
    }
  };

  DIMENSION_TYPE_META = {
    date: {
      fixedDataType: true,
      helpText: 'The time dimension represents the time or period over which the\nspending occurred. Please choose the column of your dataset which\ncontains an ISO8601 formatted date (YYYY, YYYY-MM, YYYY-MM-DD, etc.).'
    },
    measure: {
      fixedDataType: true,
      helpText: 'The most important field in the dataset. Please choose which of\nthe columns in your dataset represents the value of the spending,\nand how you\'d like it to be displayed.'
    }
  };

  FIELDS_META = {
    label: {
      required: true
    },
    name: {
      required: true
    }
  };

  log = function(s) {
    return console.log(s);
  };

  util = {
    flattenObject: function(obj) {
      var flat, pathStr, walk;
      flat = {};
      pathStr = function(path) {
        var ary, p;
        ary = [path[0]];
        ary = ary.concat((function() {
          var _i, _len, _ref, _results;
          _ref = path.slice(1);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            p = _ref[_i];
            _results.push("[" + p + "]");
          }
          return _results;
        })());
        return ary.join('');
      };
      walk = function(path, o) {
        var key, newpath, value, _results;
        _results = [];
        for (key in o) {
          value = o[key];
          newpath = $.extend([], path);
          newpath.push(key);
          if ($.type(value) === 'object') {
            _results.push(walk(newpath, value));
          } else {
            if ($.type(value) === 'array') newpath.push('');
            _results.push(flat[pathStr(newpath)] = value);
          }
        }
        return _results;
      };
      walk([], obj);
      return flat;
    },
    compoundType: function(type) {
      return $.inArray(type, ['attribute', 'value', 'date', 'measure']) === -1;
    },
    flattenForm: function(data, form) {
      var el, elt_is_bool, k, str_of_bool, v, _ref, _results;
      str_of_bool = function(b) {
        if (b) {
          return "true";
        } else {
          return "false";
        }
      };
      elt_is_bool = function(elt) {
        return elt.hasClass('boolean');
      };
      _ref = util.flattenObject(data);
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        el = form.find("[name=\"" + k + "\"]");
        v = elt_is_bool(el) ? str_of_bool(v) : v;
        _results.push(el.val(v));
      }
      return _results;
    },
    validId: function(s) {
      return /[a-z0-9_-]/.test(s);
    },
    sanitiseId: function(s) {
      return s.replace(/[a-zA-Z0-9_-]/i, '');
    },
    flatten: function(arr) {
      return arr.reduce((function(xs, el) {
        if (Array.isArray(el)) {
          return xs.concat(util.flatten(el));
        } else {
          return xs.concat([el]);
        }
      }), []);
    },
    titlize: function(s) {
      return s.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
        return p1 + p2.toUpperCase();
      });
    },
    cmp: function(a, b) {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    },
    tabName: function(modelEditor, name) {
      var meName;
      meName = $(modelEditor).attr('id');
      return "" + meName + "_dim_" + name;
    }
  };

  Widget = (function() {

    __extends(Widget, Delegator);

    function Widget() {
      Widget.__super__.constructor.apply(this, arguments);
    }

    Widget.prototype.deserialize = function(data) {};

    return Widget;

  })();

  DimensionWidget = (function() {

    __extends(DimensionWidget, Widget);

    DimensionWidget.prototype.events = {
      '.add_field click': 'onAddFieldClick',
      '.field_rm click': 'onFieldRemoveClick'
    };

    function DimensionWidget(name, container, nameContainer, modelEditor, options) {
      this.formFieldRequired = __bind(this.formFieldRequired, this);
      this.formFieldPrefix = __bind(this.formFieldPrefix, this);
      var el, idx;
      this.name = name;
      el = $("<fieldset class='dimension tab-pane' data-dimension-name='" + this.name + "'>            </fieldset>").appendTo(container);
      DimensionWidget.__super__.constructor.call(this, el, options);
      this.id = util.tabName(modelEditor, name);
      idx = this.getInsertIndex(this.name, nameContainer);
      nameContainer.insertAt(idx, this.linkText());
      this.element.attr('id', this.id);
    }

    DimensionWidget.prototype.getInsertIndex = function(name, nameContainer) {
      var at, items;
      at = 0;
      items = nameContainer.children();
      items.each(function(idx, item) {
        var txt;
        txt = $($(item).children()[0]).html();
        if (name > txt) return at = idx + 1;
      });
      return at;
    };

    DimensionWidget.prototype.linkText = function() {
      return $("<li><a href='#" + this.id + "'>" + this.name + "</li>");
    };

    DimensionWidget.prototype.deserialize = function(data) {
      var formObj;
      this.data = (data != null ? data[this.name] : void 0) || {};
      this.meta = DIMENSION_TYPE_META[this.data['type']] || {};
      if (util.compoundType(data.type) && !('attributes' in this.data)) {
        this.data.attributes = {
          'name': {
            'datatype': 'id'
          },
          'label': {
            'datatype': 'string'
          }
        };
      }
      this.element.html($.tmpl('tpl_dimension', this));
      this.element.trigger('fillColumnsRequest', [this.element.find('select.column')]);
      formObj = {};
      formObj[this.name] = this.data;
      return util.flattenForm(formObj, this.element);
    };

    DimensionWidget.prototype.formFieldPrefix = function(fieldName) {
      return "" + this.name + "[attributes][" + fieldName + "]";
    };

    DimensionWidget.prototype.formFieldRequired = function(fieldName) {
      var _ref;
      return ((_ref = FIELDS_META[fieldName]) != null ? _ref['required'] : void 0) || false;
    };

    DimensionWidget.prototype.onAddFieldClick = function(e) {
      var name, row;
      name = prompt("Field name:").trim();
      row = this._makeFieldRow(name);
      row.appendTo(this.element.find('tbody'));
      this.element.trigger('fillColumnsRequest', [row.find('select.column')]);
      return false;
    };

    DimensionWidget.prototype.onFieldRemoveClick = function(e) {
      $(e.currentTarget).parents('tr').first().remove();
      this.element.parents('form').first().change();
      return false;
    };

    DimensionWidget.prototype._makeFieldRow = function(name, constant) {
      if (constant == null) constant = false;
      return $.tmpl('tpl_dimension_field', {
        'fieldName': name,
        'prefix': this.formFieldPrefix,
        'required': this.formFieldRequired
      });
    };

    return DimensionWidget;

  })();

  dim_config = {
    attribute: {
      "default": "",
      props: {
        type: "attribute"
      }
    },
    compound: {
      "default": "",
      props: {
        type: "compound"
      }
    },
    date: {
      "default": "time",
      props: {
        type: "date",
        datatype: "date"
      }
    },
    measure: {
      "default": "amount",
      props: {
        type: "measure",
        datatype: "float"
      }
    }
  };

  AddDimensionWidget = (function() {

    __extends(AddDimensionWidget, Widget);

    AddDimensionWidget.prototype.events = {
      'form #dimension_type change': 'onTypeChange',
      '.add_dimension click': 'onAddDimensionClick',
      '.cancel_add_dimension click': 'onCancelAddDimensionClick'
    };

    function AddDimensionWidget(element, modelEditor, options) {
      AddDimensionWidget.__super__.constructor.apply(this, arguments);
      this.modelEditor = modelEditor;
    }

    AddDimensionWidget.prototype.setName = function(s) {
      return this.element.find('[name=new-dimension-name]').val(s);
    };

    AddDimensionWidget.prototype.getName = function() {
      return this.element.find('[name=new-dimension-name]').val();
    };

    AddDimensionWidget.prototype.getType = function() {
      return this.element.find('[name=new-dimension-type]').val();
    };

    AddDimensionWidget.prototype.onTypeChange = function(e) {
      var name, suggestion, type, _ref;
      type = this.getType();
      name = this.getName();
      suggestion = (_ref = dim_config[type]) != null ? _ref['default'] : void 0;
      if (!suggestion.length) {
        if (name in this.modelEditor.data) {
          this.setName('');
        } else {
          return false;
        }
      }
      if (suggestion in this.modelEditor.data) return false;
      return this.setName(suggestion);
    };

    AddDimensionWidget.prototype.saneName = function(name) {
      return name.length && /^[a-zA-Z0-9_-]*$/.test(name);
    };

    AddDimensionWidget.prototype.nameUnavailable = function(name) {
      return name in this.modelEditor.data;
    };

    AddDimensionWidget.prototype.saveNewDimension = function(name, type) {
      var dwidget;
      dwidget = this.modelEditor.widgetInfo['.dimensions_widget'][0];
      return dwidget.autoAddDimension(name, type);
    };

    AddDimensionWidget.prototype.onAddDimensionClick = function(e) {
      var name, tabTo, type;
      name = this.getName();
      type = this.getType();
      if (!this.saneName(name)) {
        alert("Please use only letters, numbers and dashes for names");
        return;
      }
      if (this.nameUnavailable(name)) {
        alert("That name is already taken.");
        return;
      }
      this.saveNewDimension(name, type);
      this.element.modal('hide');
      this.modelEditor.element.trigger('formChange');
      tabTo = 'li a[href="#' + util.tabName(this.modelEditor, name) + '"]';
      return $(tabTo).click();
    };

    AddDimensionWidget.prototype.onCancelAddDimensionClick = function(e) {
      return this.element.modal('hide');
    };

    return AddDimensionWidget;

  })();

  UniquesWidget = (function() {

    __extends(UniquesWidget, Widget);

    UniquesWidget.prototype.events = {
      '.set_uniques click': 'onSetUniquesClick',
      'show': 'onShow'
    };

    function UniquesWidget(element, modelEditor, options) {
      UniquesWidget.__super__.constructor.apply(this, arguments);
      this.modelEditor = modelEditor;
    }

    UniquesWidget.prototype.onShow = function(e) {
      var add, dim, list, _results,
        _this = this;
      list = this.element.find('#uniques');
      list.empty();
      add = function(dim) {
        var checked, falseX, optionHtml, trueX, txt;
        checked = _this.modelEditor.data[dim]['key'];
        trueX = '';
        falseX = '';
        if (checked) {
          trueX = ' selected';
        } else {
          falseX = ' selected';
        }
        optionHtml = ("<option value='true'" + trueX + ">Yes</option>") + ("<option value='false'" + falseX + ">No</option>");
        txt = "<select name='" + dim + "'>" + optionHtml + "</select> " + dim;
        return $("<li>" + txt + "</li>").appendTo(list);
      };
      _results = [];
      for (dim in this.modelEditor.data) {
        _results.push(add(dim));
      }
      return _results;
    };

    UniquesWidget.prototype.onSetUniquesClick = function(e) {
      var found, list, selected,
        _this = this;
      selected = function(index) {
        return $(this).val() === 'true';
      };
      list = this.element.find('#uniques');
      found = list.find('select :selected').filter(selected);
      if (found.length) {
        list.find('select').each(function(idx, elt) {
          var dim, tgt;
          dim = $(elt).attr('name');
          tgt = $("[name=\"" + dim + "[key]\"]");
          return tgt.val($(elt).val());
        });
        this.element.modal('hide');
        list.empty();
        return this.modelEditor.element.trigger('formChange');
      } else {
        return alert("You must specify at least one dimension as unique");
      }
    };

    return UniquesWidget;

  })();

  DimensionsWidget = (function() {

    __extends(DimensionsWidget, Delegator);

    DimensionsWidget.prototype.events = {
      '.add_attribute_dimension click': 'onAddAttributeDimensionClick',
      '.add_compound_dimension click': 'onAddCompoundDimensionClick',
      '.add_date_dimension click': 'onAddDateDimensionClick',
      '.add_measure click': 'onAddMeasureClick',
      '.rm_dimension click': 'onRemoveDimensionClick',
      '.rm_all_dimensions click': 'onRemoveAllDimensionsClick'
    };

    function DimensionsWidget(element, modelEditor, options) {
      DimensionsWidget.__super__.constructor.apply(this, arguments);
      this.widgets = [];
      this.dimsEl = $('.dimensions').get(0);
      this.dimNamesEl = $(modelEditor != null ? modelEditor.namesHook : void 0) || this.element.find('.dimension-names').get(0);
      this.modelEditor = modelEditor;
    }

    DimensionsWidget.prototype.addDimension = function(name) {
      var w;
      w = new DimensionWidget(name, this.dimsEl, this.dimNamesEl, this.modelEditor);
      this.widgets.push(w);
      return w;
    };

    DimensionsWidget.prototype.refreshNames = function() {
      var tmp, w, _i, _len, _results;
      $(this.dimNamesEl).empty();
      tmp = this.widgets;
      tmp.sort(function(a, b) {
        return util.cmp(a.id, b.id);
      });
      _results = [];
      for (_i = 0, _len = tmp.length; _i < _len; _i++) {
        w = tmp[_i];
        _results.push(w.linkText().appendTo(this.dimNamesEl));
      }
      return _results;
    };

    DimensionsWidget.prototype.removeDimension = function(name) {
      var idx, w, _i, _len, _ref;
      idx = null;
      _ref = this.widgets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        w = _ref[_i];
        if (w.name === name) {
          idx = this.widgets.indexOf(w);
          break;
        }
      }
      if (idx !== null) this.widgets.splice(idx, 1)[0].element.remove();
      delete this.modelEditor.data[name];
      this.refreshNames();
      return this.element.trigger('modelChange');
    };

    DimensionsWidget.prototype.deserialize = function(data) {
      var dims, name, obj, toRemove, widget, _i, _j, _len, _len2, _ref;
      if (this.ignoreParent) return;
      dims = data || {};
      toRemove = [];
      _ref = this.widgets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        widget = _ref[_i];
        if (widget.name in dims) {
          widget.deserialize(data);
          delete dims[widget.name];
        } else {
          toRemove.push(widget.name);
        }
      }
      for (_j = 0, _len2 = toRemove.length; _j < _len2; _j++) {
        name = toRemove[_j];
        this.removeDimension(name);
      }
      for (name in dims) {
        obj = dims[name];
        this.addDimension(name).deserialize(data);
      }
      this.setDimensionCounter();
      return this.updateColumnNames();
    };

    DimensionsWidget.prototype.setDimensionCounter = function() {
      var count, payload;
      count = $(this.dimNamesEl).children().length;
      payload = "Dimensions (" + count + ")";
      return $('#dimension-count').html(payload);
    };

    DimensionsWidget.prototype.updateColumnNames = function() {
      var _this = this;
      return $('#column-names code').each(function(idx, elt) {
        var name;
        name = elt.innerHTML;
        if (_this.modelEditor.columnUsed(name)) {
          return $(elt).addClass('used');
        } else {
          return $(elt).removeClass('used');
        }
      });
    };

    DimensionsWidget.prototype.createDimension = function(name, props) {
      var data;
      data = {};
      data[name] = props;
      data[name]['label'] = util.titlize(name);
      this.addDimension(name.trim()).deserialize(data);
      return this.setDimensionCounter();
    };

    DimensionsWidget.prototype.promptAddDimension = function(suggestion, props) {
      var name;
      name = prompt("Please enter a name for the dimension (without spaces):", suggestion);
      if (!name) return false;
      return this.createDimension(name, props);
    };

    DimensionsWidget.prototype.autoAddDimension = function(name, type) {
      var props;
      props = dim_config[type]['props'];
      return this.createDimension(name, props);
    };

    DimensionsWidget.prototype.onAddDimension = function(type) {
      var meta;
      meta = dim_config[type];
      this.promptAddDimension(meta['default'], meta['props']);
      return false;
    };

    DimensionsWidget.prototype.onAddAttributeDimensionClick = function(e) {
      return this.onAddDimension('attribute');
    };

    DimensionsWidget.prototype.onAddCompoundDimensionClick = function(e) {
      return this.onAddDimension('compound');
    };

    DimensionsWidget.prototype.onAddDateDimensionClick = function(e) {
      return this.onAddDimension('date');
    };

    DimensionsWidget.prototype.onAddMeasureClick = function(e) {
      return this.onAddDimension('measure');
    };

    DimensionsWidget.prototype.onRemoveDimensionClick = function(e) {
      var dimension;
      dimension = $(e.currentTarget).attr('rm-dim');
      this.removeDimension(dimension);
      return false;
    };

    DimensionsWidget.prototype.onRemoveAllDimensionsClick = function(e) {
      var name;
      for (name in this.modelEditor.data) {
        this.removeDimension(name);
      }
      return false;
    };

    return DimensionsWidget;

  })();

  ModelEditor = (function() {

    __extends(ModelEditor, Delegator);

    ModelEditor.prototype.widgetTypes = {
      '.dimensions_widget': DimensionsWidget,
      '#check-uniques': UniquesWidget,
      '#add-dimension': AddDimensionWidget
    };

    ModelEditor.prototype.events = {
      'modelChange': 'onModelChange',
      'fillColumnsRequest': 'onFillColumnsRequest',
      '.forms form submit': 'onFormSubmit',
      '.forms form change': 'onFormChange',
      'formChange': 'onFormChange'
    };

    function ModelEditor(element, options) {
      var ctor, data, e, mapping, selector, w, _i, _len, _ref, _ref2;
      ModelEditor.__super__.constructor.apply(this, arguments);
      this.target = options.target;
      mapping = JSON.parse($(this.target).html());
      data = mapping || DEFAULT_MAPPING;
      this.data = $.extend(true, {}, data);
      this.widgets = [];
      this.widgetInfo = {};
      this.namesHook = options != null ? options.namesHook : void 0;
      this.form = $(element).find('.forms form').eq(0);
      this.id = this.element.attr('id');
      if (!(this.id != null)) {
        this.id = Math.floor(Math.random() * 0xffffffff).toString(16);
        this.element.attr('id', this.id);
      }
      this.element.find('script[type="text/x-jquery-tmpl"]').each(function() {
        return $(this).template($(this).attr('id'));
      });
      this.element.find('select.column').each(function() {
        return $(this).trigger('fillColumnsRequest', [this]);
      });
      _ref = this.widgetTypes;
      for (selector in _ref) {
        ctor = _ref[selector];
        this.widgetInfo[selector] = [];
        _ref2 = this.element.find(selector).get();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          e = _ref2[_i];
          w = new ctor(e, this);
          this.widgets.push(w);
          this.widgetInfo[selector].push(w);
        }
      }
      this.element.trigger('modelChange');
    }

    ModelEditor.prototype.onFormChange = function(e) {
      if (this.ignoreFormChange) return;
      this.data = this.form.serializeObject();
      this.ignoreFormChange = true;
      this.element.trigger('modelChange');
      return this.ignoreFormChange = false;
    };

    ModelEditor.prototype.onFormSubmit = function(e) {
      return false;
    };

    ModelEditor.prototype.onModelChange = function() {
      var payload, w, _i, _len, _ref;
      util.flattenForm(this.data, this.form);
      _ref = this.widgets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        w = _ref[_i];
        w.deserialize($.extend(true, {}, this.data));
      }
      payload = JSON.stringify(this.data, null, 2);
      $(this.options.target).val(payload);
      return this.updateEditor(payload);
    };

    ModelEditor.prototype.onFillColumnsRequest = function(elem) {
      var x;
      return $(elem).html(((function() {
        var _i, _len, _ref, _results;
        _ref = this.options.columns.sort();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          _results.push("<option name='" + x + "'>" + x + "</option>");
        }
        return _results;
      }).call(this)).join('\n'));
    };

    ModelEditor.prototype.updateEditor = function(data) {
      var getEditor, _ref;
      getEditor = this.options.getEditor;
      return typeof getEditor === "function" ? (_ref = getEditor()) != null ? _ref.getSession().setValue(data) : void 0 : void 0;
    };

    ModelEditor.prototype.columnsUsed = function() {
      var cols_in_dim, d,
        _this = this;
      cols_in_dim = function(d) {
        var attr, dim, _results;
        dim = _this.data[d];
        if (dim['attributes']) {
          _results = [];
          for (attr in dim['attributes']) {
            _results.push(dim['attributes'][attr]['column']);
          }
          return _results;
        } else {
          return [dim['column']];
        }
      };
      return util.flatten((function() {
        var _results;
        _results = [];
        for (d in this.data) {
          _results.push(cols_in_dim(d));
        }
        return _results;
      }).call(this));
    };

    ModelEditor.prototype.columnUsed = function(s) {
      return $.inArray(s, this.columnsUsed()) > -1;
    };

    return ModelEditor;

  })();

  $.plugin('modelEditor', ModelEditor);

  this.ModelEditor = ModelEditor;

}).call(this);
