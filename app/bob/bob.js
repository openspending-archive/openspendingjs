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
                <a class='qb-toggle close' href='#'><i class='icon-chevron-up'></i></a> \
                <h3>{{context.label}}</h3> \
                <div class='fields'> \
                </div> \
            </form> \
        </div>");

    self.context = _.extend({
        label: 'Define the data'
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
            var form = $('#' + self.id + ' .fields');
            _.each(spec, function(obj) {
                obj.id = obj.variable + '-' + Math.floor(Math.random()*11);
                var nodeClass = osw.QueryNodes[obj.type];
                if (nodeClass) {
                    self.nodes[obj.variable] = new nodeClass(self, form, obj, model);
                }
            });
            $('#' + self.id + ' .qb-toggle').click(function(e) {
                var e = $(e.currentTarget);
                e.find('i').toggleClass('icon-chevron-up').toggleClass('icon-chevron-down');
                form.slideToggle('fast');
                return false;
            });
            form.change(self.update);
            form.submit(self.update);
        }, 'jsonp');
    };

    this.render();
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
        _.each(_.keys(values), function(e, i) {
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
    };

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
        elem.trigger('change');
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
    'select': osw.SelectNode,
    'cuts': osw.CutsNode
};

// end the local closure
}(jQuery));
