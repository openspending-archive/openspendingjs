
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

  this.context = context;
  this.state = state;

  this.configure = function(endConfigure) {
    self.$qb.empty();
    self.context.label = 'Create a BubbleTree visualisation';
    var qb = new OpenSpending.Widgets.QueryBuilder(
      self.$qb, self.update, endConfigure, self.context, [
            {
              variable: 'drilldowns',
              label: 'Levels:',
              type: 'select',
              'default': self.state.drilldown,
              help: 'Each selected dimension will display as an additional level of bubbles.'
            },
            {
              variable: 'cuts',
              label: 'Filters:',
              type: 'cuts',
              'default': self.state.cuts,
              help: 'Limit the set of data to display.'
            }
          ]
    );
  };

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

  this.update = function(state) {
    //console.log(state);
    self.$e.empty();
    self.state = state;

    var cuts = [];
    for (var field in self.state.cuts) {
      cuts.push(field + ':' + self.state.cuts[field]);
    }
    if (self.state.drilldowns) {
      // call openspending api for data
      new OpenSpending.Aggregator({
          siteUrl: self.context.siteUrl,
          dataset: self.context.dataset,
          rootNodeLabel: self.context.rootNodeLabel || 'Total',
          drilldowns: self.state.drilldowns || [],
          cuts: cuts,
          breakdown: self.state.breakdown,
          callback: self.dataLoaded
      });
    }
  };
  
  this.init = function() {
    elem.addClass('bubbletree-container');
    elem.html('<div class="bubbletree-qb"></div><div class="bubbletree-widget-wrapper"><div id="bubbletree-wrapper" class="bubbletree-vis bubbletree-widget"></div></div>');
    self.$e = elem.find('.bubbletree-vis');
    self.$qb = elem.find('.bubbletree-qb');
    var $tooltip = $('<div class="tooltip">Tooltip</div>');
    elem.append($tooltip);
    $tooltip.hide();
  
    this.update(self.state);
    
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

  