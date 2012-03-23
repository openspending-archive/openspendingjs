var OpenSpending = OpenSpending || {};
OpenSpending.Widgets = OpenSpending.Widgets || {};

(function ($) {

var osw = OpenSpending.Widgets;

osw.QueryBuilder = function(elem, callback, context, spec) {
    var self = this;
    self.nodes = {};

    self.template = Handlebars.compile(" \
        <div class='well query-builder'> \
            <form id='{{id}}' class='form-horizontal'> \
            </form> \
        </div>");

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
        $.get(context.siteUrl + '/' + context.dataset + '/model.json', function(model) {
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
            var form = $('#' + self.id);
            _.each(spec, function(obj) {
                obj.id = obj.variable + '-' + Math.floor(Math.random()*11);
                var nodeClass = osw.QueryNodes[obj.type];
                if (nodeClass) {
                    self.nodes[obj.variable] = new nodeClass(self, form, obj, model);
                }
            });
            form.change(self.update);
            form.submit(self.update);
        }, 'jsonp');
    };

    this.render();
};

osw.SingleDrilldownNode = function(builder, elem, obj, model) {
    var self = this;

    self.serialize = function() {
        var val = elem.find('#' + obj.id).val();
        if (obj.nullable && !val) val = null;
        return val;
    };

    obj = _.extend({label: 'Drilldown', nullable: false, options: 'dimensions'}, obj);

    self.options = _.sortBy(_.values(model[obj.options]), function(o) {
        return o.label;
    });

    var template = Handlebars.compile(" \
        <div class='{{obj.type}}' class='control-group'> \
            <label for='{{obj.id}}' class='control-label'>{{obj.label}}</label> \
            <div class='controls'> \
                <select name='{{obj.id}}' id='{{obj.id}}'> \
                    {{#obj.nullable}} \
                        <option value=''>(no selection)</option> \
                    {{/obj.nullable}} \
                    {{#options}} \
                        <option value='{{name}}'>{{label}}</option> \
                    {{/options}} \
                </select> \
                {{#obj.help}}<p class='help-block'>{{this}}</p>{{/obj.help}} \
            </div> \
        </div>");
    elem.append(template({obj: obj, options: self.options}));
    if (obj['default']) {
        elem.find('#' + obj.id).val(obj['default']);
    }
};

osw.MultiDrilldownNode = function(builder, elem, obj, model) {
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


    var nodeTemplate = Handlebars.compile(" \
        <div class='{{obj.type}} control-group' id='{{obj.id}}'> \
            <label for='{{obj.id}}' class='control-label'>{{obj.label}}</label> \
            <div class='controls'> \
                {{{levels}}} \
                <a class='add-level btn btn-small' href='#'><i class='icon-plus-sign'></i> \
                Add a level</a> \
            </div> \
        </div>");

    var levelTemplate = Handlebars.compile(" \
        <select class='level level{{i}}' data-level='{{i}}'> \
            {{#obj.nullable}} \
                <option value=''>(no selection)</option> \
            {{/obj.nullable}} \
            {{#options}} \
                <option value='{{name}}'>{{label}}</option> \
            {{/options}} \
        </select> \
        <a class='remove-level' data-level='{{i}}' href='#'><i class='icon-minus-sign'></i></a> \
        <br/> \
        ");

    self.serialize = function() {
        var vals = _.filter(values, function(e) { return e.length>0; });
        if (obj.single) {
            return vals[0];
        }
        return vals;
    };

    self.addLevel = function() {
        values.push('');
        self.render();
        self.nodeElem.trigger('change');
        return false;
    };

    self.removeLevel = function(e) {
        var level = $(e.currentTarget).data('level');
        if (values.length > 1) {
            values = _.filter(values, function(e, i) { return i != level; });
        }
        self.render();
        self.nodeElem.trigger('change');
        return false;
    };

    self.updateLevel = function(e) {
        var cur = $(e.currentTarget);
        values[cur.data('level')] = cur.val();
    };

    self.render = function() {
        var levels = '';
        _.each(values, function(value, i) {
            levels = levels + levelTemplate({i: i, obj: obj, options: options});
        });
        nodeHtml = nodeTemplate({obj: obj, levels: levels, nextLevel: values.length-1});
        if (self.nodeElem) {
            self.nodeElem.replaceWith(nodeHtml);
        } else {
            elem.append(nodeHtml);
        }
        self.nodeElem = elem.find('#' + obj.id);
        
        _.each(values, function(value, i) {
            self.nodeElem.find('.level' + i).val(value);
        });
        self.nodeElem.find('.add-level').click(self.addLevel);
        self.nodeElem.find('.remove-level').click(self.removeLevel);
        self.nodeElem.find('.level').change(self.updateLevel);
    };

    self.render();
};

osw.MeasureNode = function(builder, elem, obj, model) {
    var self = this;

    self.serialize = function() {
        var val = elem.find('#' + obj.id).val();
        if (obj.nullable && !val) val = null;
        return val;
    };

    obj = _.extend({label: 'Measure', nullable: false}, obj);
    var measures = _.sortBy(_.values(model.measures), function(o) {
        return o.label;
    });

    var template = Handlebars.compile(" \
        <div class='{{obj.type}} control-group'> \
            <label for='{{obj.id}}' class='control-label'>{{obj.label}}</label> \
            <div class='controls'> \
                <select name='{{obj.id}}' id='{{obj.id}}'> \
                    {{#obj.nullable}} \
                        <option value=''>(no selection)</option> \
                    {{/obj.nullable}} \
                    {{#measures}} \
                        <option value='{{name}}'>{{label}}</option> \
                    {{/measures}} \
                </select> \
            </div> \
        </div>");
    elem.append(template({obj: obj, measures: measures}));
    if (obj['default']) {
        elem.find('#' + obj.id).val(obj['default']);
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
        <div class='{{obj.type}}' id='{{obj.id}}' class='control-group'> \
            <label for='{{obj.id}}' class='control-label'>{{obj.label}}</label> \
            <div class='controls'> \
                <a class='add-filter btn btn-small' href='#'><i class='icon-plus-sign'></i>Add a filter</a> \
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

    self.updateAttributes = function(e) {
        var filter = $(e.target).parents('.filter');
        var dimension = model.dimensions[filter.find('.dimension').val()];
        var attributes = filter.find('.attribute');
        if (dimension.attributes) {
            attributes.empty();
            _.each(_.keys(dimension.attributes), function (e) {
                attributes.append("<option name='" + e + "'>" + e + "</option>");
            });
            attributes.show();
        } else {
            attributes.hide();
        }
    }

    self.addFilter = function(e) {
        var html = self.filterTemplate({dimensions: dimensions});
        self.nodeElem.find('.add-filter').before(html);
        var el = self.nodeElem.find('.filter').last();
        el.find('.remove-filter').click(self.removeFilter);
        el.find('.dimension').change(self.updateAttributes);
        el.find('.dimension').trigger('change');
        return false;
    };

    self.removeFilter = function(e) {
        $(e.target).parents('.filter').remove();
        return false;
    };

    elem.append(self.nodeTemplate({obj: obj}));
    self.nodeElem = elem.find('#' + obj.id);
    _.each(_.keys(cuts), function(e, i) {
        self.addFilter();
        var el = self.nodeElem.find('.filter').last();
        e = e.split('.', 1);
        el.find('.dimension').val(e[0]);
        el.find('.attribute').val(e[1]);
        el.find('.value').val(cuts[e]);
    });
    self.nodeElem.find('.add-filter').click(self.addFilter);
};

osw.QueryNodes = {
    'single-dimension': osw.SingleDrilldownNode,
    'multi-dimension': osw.MultiDrilldownNode,
    'cuts': osw.CutsNode,
    'measure': osw.MeasureNode
};

// end the local closure
}(jQuery));
