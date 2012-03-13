var OpenSpending = OpenSpending || {};
OpenSpending.Widgets = OpenSpending.Widgets || {};

(function ($) {

/*

*/

OpenSpending.Widgets.Chooser = function(elem, widgets, callback) {
    var self = this;

    this.$e = elem;
    this.widgets = widgets;
    this.callback = callback;

    // This is called via JSONP from the widget metadata.
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

OpenSpending.VisualizationEmbedder = function(elem, context, widget, widget_name) {
    var self = this;

    this.render = function() {
        elem.append(this.template);
        self.$e = $('#embedder');
        self.$e.find('form').change(this.updateEmbed);
        this.updateEmbed();
    };

    this.updateEmbed = function() {
        var embedParams = {
            w: self.$e.find('#width').val(), 
            h: self.$e.find('#height').val()};
        var url = context.siteUrl + '/' + context.dataset + '/embed';
        url = url + '?widget=' + encodeURIComponent(widget_name);
        url = url + '&state=' + encodeURIComponent(JSON.stringify(widget.serialize()));
        url = url + '&width=' + embedParams.w;
        url = url + '&height=' + embedParams.h;
        embedParams.url = url;
        self.$e.find('#embedcode').val(_.template(self.embedCode, embedParams));
    };

    this.embedCode = "<iframe width='<%= w %>' height='<%= h %>' src='<%= url %>' frameborder='0'></iframe>";

    this.template = " \
        <div class='row'> \
            <div class='offset4 span8' id='embedder'> \
                <form class='form-horizontal'> \
                <div class='row'> \
                    <div class='span4'> \
                        <div class='control-group'> \
                            <label class='control-label' for='width'>Width:</label> \
                            <div class='controls'><input id='width' class='span1' value='700'></div> \
                        </div> \
                        <div class='control-group'> \
                            <label class='control-label' for='height'>Height:</label> \
                            <div class='controls'><input id='height' class='span1' value='400'></div> \
                        </div> \
                    </div> \
                    <div class='span4'> \
                        <textarea id='embedcode' class='xlarge' rows='4'></textarea> \
                    </div> \
                </div> \
                </form> \
            </div> \
        </div>";

};

OpenSpending.Widgets.Editor = function(options) {
    var self = this;
    self.options = options;

    self.setStep = function(step) {
        $("#stages li").removeClass("active");
        $("#stages li#menu-" + step).addClass("active");
        self.options.elem.empty();
    };

    self.choose = function() {
        self.setStep('choose');
        self.chooser = new OpenSpending.Widgets.Chooser(self.options.elem, self.options.widgets,
            function(widget) {
                self.widget_metadata = widget;
                $("#stages li").removeClass("inactive");
                self.configure();
            });
        self.chooser.render();
    };
    
    self.configure = function() {
        var self = this;
        if (!this.widget_metadata) {
            self.choose();
        } else {
            self.setStep('configure');
            $.getScript(this.widget_metadata.js).then(function() {
                widget_class = eval(self.widget_metadata.class_name);
                dfd = new widget_class(self.options.elem, self.options.context, {});
                dfd.then(function(w) {
                    self.widget = w;
                    if (self.widget.configure) {
                        self.widget.configure();
                    }
                });
            });
        }
    };

    self.use = function() {
        var self = this;
        if (!this.widget_metadata) {
            self.choose();
        } else {
            self.setStep('use');
            console.log(self.widget.serialize());
            this.embedder = new OpenSpending.VisualizationEmbedder(self.options.elem,
                self.options.context, self.widget, self.widget_metadata.name);
            this.embedder.render();
        }
    };
    
    $("#stages li#menu-choose").click(function(e) { self.choose(); return false; });
    $("#stages li#menu-configure").click(function(e) { self.configure(); return false; });
    $("#stages li#menu-use").click(function(e) { self.use(); return false; });

    self.choose();
};


// end the local closure
}(jQuery));
