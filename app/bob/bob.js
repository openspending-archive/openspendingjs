var OpenSpending = OpenSpending || {};
OpenSpending.Widgets = OpenSpending.Widgets || {};

(function ($) {

var osw = OpenSpending.Widgets;

osw.QueryBuilder = function(elem, callback, finish, context, spec) {
    var self = this;

    var resources = ["//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js",
                     "//ajax.googleapis.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min.js",
                     OpenSpending.scriptRoot + "/app/bob/css/query-builder/jquery-ui-1.8.18.custom.css",
                     OpenSpending.scriptRoot + "/lib/vendor/handlebars.js"
                 ];

    self.nodes = {};
    self.hasFinish = finish instanceof Function;
    self.noFinish = !self.hasFinish;

    self.context = _.extend({
        }, context);

    self.serialize = function() {
        state = {};
        _.each(spec, function(obj) {
            var node = self.nodes[obj.variable];
            if (node) state[obj.variable] = node.serialize();
            state[obj.variable] = state[obj.variable] || obj['default'];
        });
        return state;
    };

    self.update = function() {
        callback(self.serialize());
        return false;
    };

    self.render = function() {
        $.ajax({
            url: context.siteUrl + '/' + context.dataset + '/model.json', 
            cache: true,
            jsonpCallback: 'qbmodel',
            success: function(model) {
                model.dimensions = {};
                model.measures = {};
                _.each(_.keys(model.mapping), function (k) {
                    var obj = model.mapping[k];
                    obj.name = k;
                    if (obj.type == 'measure') {
                        model.measures[k] = obj;
                    } else {
                        model.dimensions[k] = obj;
                    }
                });
                self.id = 'qb' + Math.floor(Math.random()*11);
                elem.append(self.template(self));
                var form = $('#' + self.id + ' .insert-here');
                _.each(spec, function(obj) {
                    obj.id = obj.variable + '-' + Math.floor(Math.random()*11);
                    var nodeClass = osw.QueryNodes[obj.type];
                    if (nodeClass) {
                        self.nodes[obj.variable] = new nodeClass(self, form, obj, model);
                    }
                });
                $('#' + self.id + ' .qb-toggle').click(function(e) {
                    var el = $(e.currentTarget);
                    el.find('i').toggleClass('icon-chevron-up').toggleClass('icon-chevron-down');
                    $('#' + self.id + ' .fields').slideToggle('fast');
                    return false;
                });
                $('#' + self.id + ' .qb-quit').click(function(e) {
                    $('#' + self.id).parents('.query-builder').remove();
                    return false;
                });
                form.change(self.update);
                form.submit(self.update);
                elem.find('.finish').click(function(e){finish(); return false;});
            }, 
            dataType: 'jsonp'});
    };

    self.fetchDistinct = function(dimension, attribute, query) {
        var dfd = $.ajax({
            url: context.siteUrl + '/' + context.dataset + '/' + dimension + '.distinct',
            data: {attribute: attribute, q: query, limit: 20},
            dataType: 'jsonp',
            cache: true,
            jsonpCallback: 'distinct_' + btoa(dimension + '__' + attribute + '__' + query).replace(/\=/g, '')
            });
        return dfd.promise();
    };

    self.initTemplates = function() {
        self.template = Handlebars.compile(" \
            <div class='well query-builder'> \
                <form id='{{id}}' class='form-horizontal'> \
                    {{#noFinish}} \
                        <a class='qb-quit close' href='#'><i class='icon-remove'></i></a> \
                    {{/noFinish}} \
                    {{#hasFinish}} \
                        <a class='qb-toggle close' href='#'><i class='icon-chevron-up'></i></a> \
                    {{/hasFinish}} \
                    <div class='fields'> \
                    <div class='insert-here'></div> \
                    {{#hasFinish}} \
                    <div class='control-group'> \
                        <div class='controls'> \
                            <a href='#' class='btn finish'><i class='icon-ok'></i> Save or embed this view</a> \
                        </div> \
                    </div> \
                    {{/hasFinish}} \
                    </div> \
                </form> \
            </div>");
    };

    self.init = function() {
        self.initTemplates();
        self.render();
    };

    if (!window.queryBuilderLoaded) {
        yepnope({
            load: resources,
            complete: function() {
                window.queryBuilderLoaded = true;
                self.init();
            }
        });
    } else {
        self.init();
    }
};

osw.SliderNode = function(builder, elem, obj, model) {
    var self = this;

    obj = _.extend({
        label: 'Year',
        dimension: 'time',
        attribute: 'year'
        }, obj);

    self.serialize = function() {
        return self.value;
    };

    self.update = function(value) {
        if (value != self.value) {
            self.value = value;
            self.nodeElem.find('.num').html(value);
            builder.update();
        }
    };

    self.nodeTemplate = Handlebars.compile(" \
        <div class='{{obj.type}} control-group' id='{{obj.id}}'> \
            <label for='{{obj.id}}' class='control-label'>{{obj.label}}</label> \
            <div class='controls'> \
                <div class='num'></div> \
                <div class='slider'></div> \
                {{#obj.help}}<p class='help-block'>{{this}}</p>{{/obj.help}} \
            </div> \
        </div>");

    elem.append(self.nodeTemplate({obj: obj}));
    self.nodeElem = elem.find('#' + obj.id);
    self.sliderElem = self.nodeElem.find('.slider');
    builder.fetchDistinct(obj.dimension, obj.attribute).then(function(distinct) {
        var values = _.map(distinct.results, function(d) {
            return parseFloat(d[obj.attribute]);
        });
        self.sliderElem.slider({
            value: self.value,
            min: _.min(values),
            max: _.max(values),
            step: 1,
            change: function(event, ui) {
                self.update(ui.value);
            }
        });
        self.sliderElem.slider('value', obj['default'] || _.max(values));
    });
};

osw.SelectNode = function(builder, elem, obj, model) {
    var self = this;

    obj = _.extend({
        label: 'Drilldowns',
        nullable: false,
        options: 'dimensions',
        single: false
        }, obj);
    var fallback = obj.single ? '' : [''];
    var values = obj['default'] || fallback;

    var options = _.sortBy(_.values(model[obj.options]), function(o) {
        return o.label;
    });


    self.nodeTemplate = Handlebars.compile(" \
        <div class='{{obj.type}} control-group' id='{{obj.id}}'> \
            <label for='{{obj.id}}' class='control-label'>{{obj.label}}</label> \
            <div class='controls'> \
                <a class='add-level btn btn-small' href='#'><i class='icon-plus-sign'></i> \
                Add a level</a> \
                {{#obj.help}}<p class='help-block'>{{this}}</p>{{/obj.help}} \
            </div> \
        </div>");

    self.levelTemplate = Handlebars.compile(" \
        <div class='level'> \
            <select class='drilldown'> \
                {{#obj.nullable}} \
                    <option value=''>(no selection)</option> \
                {{/obj.nullable}} \
                {{#options}} \
                    <option value='{{name}}'>{{label}}</option> \
                {{/options}} \
            </select> \
            <a class='remove-level' href='#'><i class='icon-minus-sign'></i></a> \
        </div> \
        ");

    self.serialize = function() {
        var vals = [];
        self.nodeElem.find('.drilldown').each(function(i, e){
            vals.push($(e).val());
        });
        if (obj.single) return vals[0];
        return vals;
    };

    self.addLevel = function() {
        var html = self.levelTemplate({options: options, obj: obj});
        self.nodeElem.find('.add-level').before(html);
        var el = self.nodeElem.find('.level').last();
        if (obj.single) {
            el.find('.remove-level').remove();
        } else {
            el.find('.remove-level').click(self.removeLevel);
        }
        return false;
    };

    self.removeLevel = function(e) {
        $(e.target).parents('.level').remove();
        elem.trigger('change');
        return false;
    };

    elem.append(self.nodeTemplate({obj: obj}));
    self.nodeElem = elem.find('#' + obj.id);
    if (obj.single) {
        self.addLevel();
        self.nodeElem.find('.drilldown').val(obj['default']);
        self.nodeElem.find('.add-level').remove();
    } else {
        _.each(values, function(e) {
            self.addLevel();
            var el = self.nodeElem.find('.level').last();
            el.find('.drilldown').val(e);
        });
        self.nodeElem.find('.add-level').click(self.addLevel);
    }
};

osw.CutsNode = function(builder, elem, obj, model) {
    var self = this;

    self.filterTemplate = Handlebars.compile(" \
        <div class='filter'> \
            <select class='dimension'> \
                {{#dimensions}} \
                    <option value='{{name}}'>{{label}}</option> \
                {{/dimensions}} \
            </select> \
            <select class='attribute'></select> \
            <input class='value' /> \
            <a class='remove-filter' href='#'><i class='icon-minus-sign'></i></a> \
        </div> \
        ")

    self.nodeTemplate = Handlebars.compile(" \
        <div class='{{obj.type}} control-group' id='{{obj.id}}'> \
            <label for='{{obj.id}}' class='control-label'>{{obj.label}}</label> \
            <div class='controls'> \
                <a class='add-filter btn btn-small' href='#'><i class='icon-plus-sign'></i> Add a filter</a> \
                {{#obj.help}}<p class='help-block'>{{this}}</p>{{/obj.help}} \
            </div> \
        </div>");

    self.serialize = function() {
        var val = {};
        self.nodeElem.find('.filter').each(function(i, e) {
            var el = $(e);
            var key = el.find('.dimension').val();
            var attribute = el.find('.attribute').val();
            var value = el.find('.value').val();
            if (attribute) {
                key = key + '.' + attribute;
            }
            if (val[key]) {
                val[key] = [value].concat(val[key]);    
            } else {
                val[key] = value;    
            }
            
        });
        return val;
    };

    obj = _.extend({label: 'Filters'}, obj);
    var cuts = obj['default'] || {};
    var dimensions = _.sortBy(_.values(model.dimensions), function(o) {
        return o.label;
    });

    self.autoComplete = function(dimension, attribute) {
        return function(request, response) {
            builder.fetchDistinct(dimension, attribute, request.term).then(function(distinct) {
                response(_.map(distinct.results, function(res) {
                    return attribute ? res[attribute] : res;
                }));
            });
        }
    };

    self.setFilter = function(el, dimension, attribute, value) {
        var dimEl = el.find('.dimension');
        var attrEl = el.find('.attribute');
        var valueEl = el.find('.value').hide();
        dimension = dimEl.val(dimension).val();
        var dimModel = model.dimensions[dimension];
        attrEl.empty();
        if (dimModel.attributes) {
            _.each(_.keys(dimModel.attributes), function (a) {
                attrEl.append("<option name='" + a + "'>" + a + "</option>");
            });
            attribute = attrEl.val(attribute || 'label').val();
            attrEl.show();
        } else {
            attrEl.val('');
            attrEl.hide();
        }

        builder.fetchDistinct(dimension, attribute).then(function(distinct) {
            if (distinct.count > 20) {
                valueEl.replaceWith("<input class='value' />");
                valueEl = el.find('.value');
                valueEl.autocomplete({
                    source: self.autoComplete(dimension, attribute),
                    select: function(e) {
                        valueEl.trigger('change');
                    }
                });
            } else {
                valueEl.replaceWith("<select class='value' />");
                valueEl = el.find('.value');
                _.each(distinct.results, function(d) {
                    if (typeof d !== 'string' && attribute) {
                        d = d[attribute];
                    }
                    valueEl.append('<option value="' + d + '">' + d + '</option>');
                });
            }
            valueEl.val(value);
            elem.trigger('change');
        });
    };

    self.dimensionChange = function(e) {
        var filter = $(e.target).parents('.filter');
        self.setFilter(filter, filter.find('.dimension').val()); 
        return false;
    }

    self.attributeChange = function(e) {
        var filter = $(e.target).parents('.filter');
        self.setFilter(filter, filter.find('.dimension').val(),
            filter.find('.attribute').val()); 
        return false;
    }

    self.addFilter = function(e, dimension, attribute, value) {
        var html = self.filterTemplate({dimensions: dimensions});
        self.nodeElem.find('.add-filter').before(html);
        var el = self.nodeElem.find('.filter').last();
        el.find('.remove-filter').click(self.removeFilter);
        el.find('.dimension').change(self.dimensionChange);
        el.find('.attribute').change(self.attributeChange);
        self.setFilter(el, dimension, attribute, value);
        return false;
    };

    self.removeFilter = function(e) {
        $(e.target).parents('.filter').remove();
        elem.trigger('change');
        return false;
    };

    elem.append(self.nodeTemplate({obj: obj}));
    self.nodeElem = elem.find('#' + obj.id);
    _.each(_.keys(cuts), function(e, i) {
        var dimension = e.split('.')[0],
            attribute = e.split('.')[1];
        self.addFilter(null, dimension, attribute, cuts[e]);
    });
    self.nodeElem.find('.add-filter').click(self.addFilter);
};

osw.QueryNodes = {
    'select': osw.SelectNode,
    'cuts': osw.CutsNode,
    'slider': osw.SliderNode
};

// end the local closure
}(jQuery));
