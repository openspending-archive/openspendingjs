var OpenSpending = OpenSpending || {};
OpenSpending.Widgets = OpenSpending.Widgets || {};

(function ($) {

OpenSpending.Widgets.QueryBuilder = function(elem, callback, context, spec) {
    var self = this;
    self.nodes = {};

    self.template = Handlebars.compile(" \
        <form id='{{id}}'> \
        </form>");

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
                var nodeClass = OpenSpending.Widgets.QueryNodes[obj.type];
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

OpenSpending.Widgets.SingleDrilldownNode = function(builder, elem, obj, model) {
    var self = this;

    self.serialize = function() {
        return elem.find('#' + obj.id).val();
    };

    var template = Handlebars.compile(" \
        <div class='{{type}}'> \
            <label for='{{id}}'>{{label}}</label> \
            <input name='{{id}}' id='{{id}}' /> \
        </div>");
    elem.append(template(obj));
};

OpenSpending.Widgets.SingleDrilldownNode = function(builder, elem, obj, model) {
    var self = this;

    self.serialize = function() {
        var val = elem.find('#' + obj.id).val();
        if (obj.nullable && !val) val = null;
        return val;
    };

    obj = _.extend({label: 'Drilldown', nullable: false}, obj);

    var dimensions = _.map(_.keys(model.dimensions), function(k) {
        var o = model.dimensions[k];
        o.name = k;
        return o;
    });
    dimensions = _.sortBy(dimensions, function(o) {
        return o.label;
    });

    var template = Handlebars.compile(" \
        <div class='{{obj.type}}'> \
            <label for='{{obj.id}}'>{{obj.label}}</label> \
            <select name='{{obj.id}}' id='{{obj.id}}'> \
                {{#obj.nullable}} \
                    <option value=''>(no selection)</option> \
                {{/obj.nullable}} \
                {{#dimensions}} \
                    <option value='{{name}}'>{{label}}</option> \
                {{/dimensions}} \
            </select> \
        </div>");
    elem.append(template({obj: obj, dimensions: dimensions}));
    if (obj['default']) {
        elem.find('#' + obj.id).val(obj['default']);
    }
};

OpenSpending.Widgets.MeasureNode = function(builder, elem, obj, model) {
    var self = this;

    self.serialize = function() {
        var val = elem.find('#' + obj.id).val();
        if (obj.nullable && !val) val = null;
        return val;
    };

    obj = _.extend({label: 'Measure', nullable: false}, obj);

    var measures = _.map(_.keys(model.measures), function(k) {
        var o = model.measures[k];
        o.name = k;
        return o;
    });
    measures = _.sortBy(measures, function(o) {
        return o.label;
    });

    var template = Handlebars.compile(" \
        <div class='{{obj.type}}'> \
            <label for='{{obj.id}}'>{{obj.label}}</label> \
            <select name='{{obj.id}}' id='{{obj.id}}'> \
                {{#obj.nullable}} \
                    <option value=''>(no selection)</option> \
                {{/obj.nullable}} \
                {{#measures}} \
                    <option value='{{name}}'>{{label}}</option> \
                {{/measures}} \
            </select> \
        </div>");
    elem.append(template({obj: obj, measures: measures}));
    if (obj['default']) {
        elem.find('#' + obj.id).val(obj['default']);
    }
};


OpenSpending.Widgets.QueryNodes = {
    'single-dimension': OpenSpending.Widgets.SingleDrilldownNode,
    'measure': OpenSpending.Widgets.MeasureNode
};

// end the local closure
}(jQuery));
