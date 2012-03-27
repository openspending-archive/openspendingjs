var OpenSpending = OpenSpending || {};
OpenSpending.Widgets = OpenSpending.Widgets || {};

(function ($) {

var osw = OpenSpending.Widgets;
osw.embedCode = "<iframe width='<%= w %>' height='<%= h %>' src='<%= url %>' frameborder='0'></iframe>";

osw.Chooser = function(elem, widgets, callback) {
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
                cache: true,
                url: this.widgets[name].base + '/metadata.json',
                dataType: 'jsonp'
            });
        }
        
    };

    this.widget_template = Handlebars.compile(" \
        <tr> \
            <td class='preview'> \
                <img src='{{preview}}' /> \
            </td> \
            <td class='desc'> \
                <h3>{{title}}</h3> \
                <p>{{description}}</p> \
            </td> \
            <td> \
                <a class='btn' id='select-{{name}}' href='#configure'><i class='icon-ok'></i></a> \
            </td> \
        </tr> \
    ");

    this.list_template = " \
        <div class='row'> \
            <div class='span8'> \
                <table id='widgets-select-list' class=table'> \
                </table> \
            </div> \
        </div> \
    ";
};

osw.Use = function(elem, context, widget, widget_name) {
    var self = this;

    this.render = function() {
        elem.append(this.template);
        self.$e = $('#embedder');
        self.$e.find('form').change(this.updateEmbed);
        self.$f = $('#save-view');
        self.$f.submit(this.saveView);
        this.updateEmbed();
    };

    this.saveView = function() {
        if (!self.$f.find('#field-label').val().length) {
            self.$f.find('#field-label').parents('.control-group').addClass('error');
            return false;
        }
        self.$f.find('#field-widget').val(widget_name);
        self.$f.find('#field-state').val(JSON.stringify(widget.serialize()));
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
        self.$e.find('#embedcode').val(_.template(osw.embedCode, embedParams));
    };

    

    this.template = $("#widget-finalize").html();
};

osw.Editor = function(options) {
    var self = this;
    self.options = options;

    self.clear = function() {
        self.options.elem.empty();
        self.options.elem.append('<div id="editor-inner"></div>');
        self.elem = self.options.elem.find('#editor-inner');
    };

    self.choose = function() {
        self.clear();
        self.chooser = new osw.Chooser(self.elem, self.options.widgets,
            function(widget) {
                self.widget_metadata = widget;
                self.configure();
            });
        self.chooser.render();
    };
    
    self.configure = function() {
        $.ajax({url: this.widget_metadata.js, cache: true, dataType: 'script'}).done(function() {
            widget_class = eval(self.widget_metadata.class_name);
            dfd = new widget_class(self.elem, self.options.context, {});
            dfd.done(function(w) {
                self.widget = w;
                if (self.widget.configure) {
                    self.widget.configure(self.use);
                }
            });
        });
    };

    self.use = function() {
        self.clear();
        this.embedder = new osw.Use(self.elem,
                self.options.context, self.widget, self.widget_metadata.name);
        this.embedder.render();
    };

    self.choose();
};


osw.Embedder = function (widget, context, widget_name) {
    var self = this;

    this.template = " \
        <div class='modal hide fade' id='embedder'> \
            <div class='modal-header'> \
                <a class='close' data-dismiss='modal'>×</a> \
                <h3>Embed this visualization.</h3> \
            </div> \
            <div class='modal-body'> \
                <form class='form-horizontal'> \
                <div class='row'> \
                    <p class='help-block span7'>You can copy and paste the embed code into \
                    a CMS or blog software that supports raw HTML.<br/><br/></p> \
                </div> \
                <div class='row'> \
                    <div class='span3'> \
                        <div class='control-group'> \
                            <label class='control-label' for='width'>Width:</label> \
                            <div class='controls'><input id='width' class='span1' value='700'></div> \
                        </div> \
                        <div class='control-group'> \
                            <label class='control-label' for='height'>Height:</label> \
                            <div class='controls'><input id='height' class='span1' value='400'></div> \
                        </div> \
                    </div> \
                    <div class='span3'> \
                        <textarea id='embedcode' class='xlarge' rows='4'></textarea> \
                    </div> \
                </div> \
                </form> \
            </div> \
        </div>";

    this.render = function() {
        if (!$('#embedder').length) {
            $('body').append(this.template);
            self.$e = $('#embedder');
        }
        self.$e.modal();
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
        self.$e.find('#embedcode').val(_.template(osw.embedCode, embedParams));
    };
};

// end the local closure
}(jQuery));
