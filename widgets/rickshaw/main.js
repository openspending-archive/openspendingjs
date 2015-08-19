OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

OpenSpending.RickshawLineChart = function (elem, context, state) {
  var self = this;

  var resources = [
                 OpenSpending.scriptRoot + "/lib/vendor/rickshaw/d3.min.js",
                 OpenSpending.scriptRoot + "/lib/vendor/rickshaw/d3.layout.min.js",
                 OpenSpending.scriptRoot + "/lib/vendor/rickshaw/rickshaw.min.js",
                 OpenSpending.scriptRoot + "/lib/vendor/rickshaw/rickshaw.min.css"
                 ];


  self.context = _.extend({
    }, context);
  this.state = state;

  this.configure = function(endConfigure) {
    self.$qb.empty();
    var qb = new OpenSpending.Widgets.QueryBuilder(
      self.$qb, self.update, endConfigure, self.context, [
            {
              variable: 'drilldown',
              label: 'Tiles:',
              type: 'select',
              single: true,
              'default': self.state.drilldown,
              help: 'The sum for each member of this dimension will be presented as a tile on the treemap.'
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

  this.update = function(state) {
    self.$e.empty();
    self.state = state;
    self.state.cuts = self.state.cuts || {};

    var cuts = [];
    for (var field in self.state.cuts) {
      cuts.push(field + ':' + self.state.cuts[field]);
    }

    if (self.state.year) {
      cuts.push('time.year:' + self.state.year);
    }

    /*
    if (typeof self.context.member !== 'undefined' && typeof self.context.dimension !== 'undefined') {
      cuts.push(self.context.dimension + ':' + self.context.member);
    }
    */

    console.log(cuts);

    $.ajax({
        url: context.siteUrl + '/api/2/aggregate',
        cache: true,
        data: {
          dataset: context.dataset,
          cut: cuts.join('|')
        },
        jsonpCallback: 'I_Want_To_Be_A_Unique_Thing',
        success: self.render,
        dataType: 'jsonp'});
  };

  this.getDownloadURL = function() {
    alert("NOT IMPLEMENTED.")
  };

  this.serialize = function() {
    return self.state;
  };

  this.init = function () {
    self.$e = elem;
    self.$e.before('<div class="rs-qb"></div>');
    self.$qb = elem.prev();
    self.update(self.state);
  };

  this.render = function(data) {
    self.graph = new Rickshaw.Graph( {
      element: self.$e.get(0),
      renderer: 'line',
      series: [
        {
          color: "#c05020",
          data: [{x: 2009, y: 1}, {x: 2010, y: 2}],
          name: 'New York'
        }, {
          color: "#30c020",
          data: [{x: 2009, y: 4}, {x: 2010, y: 1}],
          name: 'London'
        }, {
          color: "#6060c0",
          data: [{x: 2009, y: 6}, {x: 2010, y: 3}],
          name: 'Tokyo'
        }
      ]
    });

    self.graph.render();

    self.hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph: self.graph
    });

    self.axes = new Rickshaw.Graph.Axis.Time({
      graph: self.graph
    });
    self.axes.render();
  }

  // The rest of this function is suitable for copypasta into other
  // plugins: load all scripts we need, and return a promise object
  // that will fire when the class is ready
  var dfd = $.Deferred();
  dfd.done(function(that) {that.init();});

  if (!window.rickshawLCWidgetLoaded) {
    yepnope({
      load: resources,
      complete: function() {
        window.rickshawLCWidgetLoaded = true;
        dfd.resolve(self);
      }
    });
  } else {
    dfd.resolve(self);
  }
  
  return dfd.promise();
};

})(jQuery);

