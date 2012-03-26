
OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

  OpenSpending.Bubbletree = function (elem, context, state) {
  var self = this;

  var resources = [OpenSpending.scriptRoot + "/lib/vendor/underscore.js",
                 OpenSpending.scriptRoot + "/lib/aggregator.js",
                 OpenSpending.scriptRoot + "/lib/utils/utils.js",
                 OpenSpending.scriptRoot + "/lib/vendor/jquery.qtip.min.js",
                 OpenSpending.scriptRoot + "/lib/vendor/jquery.history.js",
                 OpenSpending.scriptRoot + "/lib/vendor/raphael-min.js",
                 OpenSpending.scriptRoot + "/lib/vendor/vis4.js",
                 OpenSpending.scriptRoot + "/lib/vendor/Tween.js",
                 OpenSpending.scriptRoot + "/lib/vendor/bubbletree/2.0/bubbletree.js",
                 OpenSpending.scriptRoot + "/widgets/bubbletree/css/bubbletree.css"
                 ];

  this.$e = elem;

  this.context = context;
  this.state = state;

  this.serialize = function() { return state; };

    this.dataLoaded = function(data) {
      self.bubbleTree = new BubbleTree({
          data: data,
          container: '#' + self.$e.prop('id'),
          bubbleType: self.state.bubbleType || self.context.bubbleType || 'icon',
          // remove all colors coming from OpenSpending API
          clearColors: self.state.clearColors || false,
          tooltip: {
              qtip: true,
              delay: 800,
              content: function(node) {
                  return [node.label, '<div class="desc">'+(node.description ? node.description : 'No description given')+'</div><div class="amount">£ '+node.famount+'</div>'];
              }
          }
      });
    };
  
  this.init = function() {
    var $tooltip = $('<div class="tooltip">Tooltip</div>');
    self.$e.append($tooltip);
    $tooltip.hide();
    
    self.$e.addClass("bubbletree-widget");

    if (self.state.drilldowns) {
      // call openspending api for data
      new OpenSpending.Aggregator({
          siteUrl: self.context.siteUrl,
          dataset: self.context.dataset,
          rootNodeLabel: self.context.rootNodeLabel || 'Total',
          drilldowns: self.state.drilldowns || [],
          cuts: self.state.cuts || [],
          breakdown: self.state.breakdown,
          //localApiCache: 'aggregate.json',
          callback: self.dataLoaded
      });
    }
};

  // The rest of this function is suitable for copypasta into other
  // plugins: load all scripts we need, and return a promise object
  // that will fire when the class is ready
  var dfd = $.Deferred();
  dfd.done(function(that) {that.init();});

  // The rest of this function is suitable for copypasta into other
  // plugins: load all scripts we need, and return a promise object
  // that will fire when the class is ready
  var dfd = $.Deferred();
  dfd.done(function(that) {that.init();});

  if (!window.bubbletreeWidgetLoaded) {
    yepnope({
      load: resources,
      complete: function() {
        window.bubbletreeWidgetLoaded = true;
        dfd.resolve(self);
      }
    });
  } else {
    dfd.resolve(self);
  }
  
  return dfd.promise();
};

})(jQuery);

  