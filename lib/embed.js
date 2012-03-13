var OpenSpending = OpenSpending || {};

(function ($) {

/*

*/
OpenSpending.Embedder = function (widget, context, widget_name) {
    var self = this;

    this.template = " \
        <div class='modal hide fade' id='embedder'> \
            <div class='modal-header'> \
                <a class='close' data-dismiss='modal'>×</a> \
                <h3>Embed a visualization.</h3> \
            </div> \
            <div class='modal-body'> \
                <form class='form-horizontal'> \
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

    this.embedCode = "<iframe width='<%= w %>' height='<%= h %>' src='<%= url %>' frameborder='0'></iframe>";

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
        self.$e.find('#embedcode').val(_.template(self.embedCode, embedParams));
    };

};

}(jQuery));