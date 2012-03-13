
OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

  OpenSpending.Bubbletree = function (elem, context, state) {
  var self = this;

  var scripts = ["http://assets.openspending.org/openspendingjs/master/lib/vendor/underscore.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/aggregator.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/utils/utils.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/vendor/jquery.qtip.min.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/vendor/jquery.history.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/vendor/raphael-min.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/vendor/vis4.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/vendor/Tween.js",
                 "http://assets.openspending.org/openspendingjs/master/lib/vendor/bubbletree/2.0/bubbletree.js"
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

  // Brutal, but it makes debugging much easier
  //$.ajaxSetup({cache: true});
  var loaders = $.map(scripts, function(url, i) {return $.getScript(url);});
  $.when.apply(null, loaders).done(function() {dfd.resolve(self);});

  return dfd.promise();
};

})(jQuery);

  