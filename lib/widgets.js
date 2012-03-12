var OpenSpending = OpenSpending || {};

(function ($) {

/*

*/

OpenSpending.VisualizationChooser = function(elem, widgets, callback) {
    var self = this;

    this.$e = elem;
    this.widgets = widgets;
    this.callback = callback;

    OpenSpending.addWidgetMetadata = function(name, data) {
        self.widgets[name] = _.extend(self.widgets[name], data);
        var html = self.widget_template(self.widgets[name]);
        self.$e.find("#widgets-select-list").append(html);
        self.$e.find("#select-" + name).click(function(e) {
            self.callback(self.widgets[name]);
            //return false;
        });
    };

    this.render = function() {
        var tmpl = Handlebars.compile(self.list_template);
        self.$e.html(self.list_template);
        for (var name in this.widgets) {
            $.ajax({
                url: this.widgets[name].base + '/metadata.json',
                dataType: 'jsonp'
            });
        }
        
    };

    this.widget_template = Handlebars.compile(" \
        <div class='widget-option'> \
            <h2>{{title}}</h2> \
            <p>{{description}}</p> \
            <a class='btn' id='select-{{name}}' href='#configure'>Select and configure</a> \
        </div> \
    ");

    this.list_template = " \
        <div class='row'> \
            <div class='offset4 span8' id='widgets-select-list'> \
            </div> \
        </div> \
    ";
};

OpenSpending.VisualizationEditor = Backbone.Router.extend({

  routes: {
    "":             "choose",
    "choose":       "choose",
    "configure":    "configure",
    "use":          "use"
  },

  initialize: function(options) {
    this.options = options;
  },

  choose: function() {
    var self = this;
    this.chooser = new OpenSpending.VisualizationChooser(this.options.elem, this.options.widgets,
        function(widget) {
            self.widget_metadata = widget;
            //self.configure();
        });
    this.chooser.render();
  },

  configure: function() {
    var self = this;
    $.getScript(this.widget_metadata.js).then(function() {
        widget_class = eval(self.widget_metadata.class_name);
        self.widget = new widget_class(self.options.elem, self.options.context, {});
    });
  },

  use: function() {}
});


// end the local closure
}(jQuery));
