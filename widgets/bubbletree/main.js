
OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

  OpenSpending.Bubbletree = function (elem, context, state) {
  var self = this;

  var resources = [
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
    var qb = new OpenSpending.Widgets.QueryBuilder(
      self.$qb, self.update, endConfigure, self.context, [
            {
              variable: 'drilldowns',
              label: 'Levels:',
              type: 'select',
              'default': self.state.drilldowns,
              help: 'Each selected dimension will display as an additional level of bubbles.'
            },
            {
              variable: 'year',
              label: 'Year:',
              type: 'slider',
              'dimension': 'time',
              'attribute': 'year',
              'default': self.state.year,
              help: 'Filter by year.'
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

  this.serialize = function() { return self.state; };

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
                  var formattedAmount = OpenSpending.Utils.formatAmountWithCommas(node.amount,0,node.currency);
                  return [node.label, '<div class="desc">'+(node.description ? node.description : 'No description given')+'</div><div class="amount">'+formattedAmount+'</div>'];
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
      self.aggregator = new OpenSpending.Aggregator({
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

  this.getDownlaodURL = function() {
    return self.aggregator.getCSVURL();
  };
  
  this.init = function() {
    // BubbleTree gets its height from the container so we need to set the
    // height if there isn't one defined in the stylesheets
    // First we try to get either height or min-height parsed as integers
    // (we parse them since they've been appended with 'px' so the string
    // will be interpreted as true)
    var $height = parseInt(elem.css('height')) || parseInt(elem.css('min-height'));
    // If the height hasn't been defined we set a default value
    if (!$height) elem.css({height:'400px'});

    self.$e = elem;
    self.$e.before('<div class="bubbletree-qb"></div>');
    self.$qb = elem.prev();
    self.$e.addClass("bubbletree-widget");
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

  
