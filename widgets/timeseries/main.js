OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

OpenSpending.Timeseries = function (elem, context, state) {
  var self = this;

  var resources = [
                 "//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js",
                 "//ajax.googleapis.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/js/d3.min.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/js/d3.layout.min.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/js/rickshaw.min.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/css/rickshaw.min.css",
                 OpenSpending.scriptRoot + "/app/bob/bob.js",
                 OpenSpending.scriptRoot + "/lib/aggregator.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/css/timeseries.css"
                 ];

  self.context = context;
  self.state = state;

  self.configure = function(endConfigure) {
    self.$qb.empty();
    var qb = new OpenSpending.Widgets.QueryBuilder(
      self.$qb, self.update, endConfigure, self.context, [
            {
              variable: 'drilldowns',
              label: 'Tiles:',
              type: 'select',
              'default': self.state.drilldowns,
              help: 'Each selected dimension will display as an additional level of tiles for the treemap.'
            },
            {
              variable: 'year',
              label: 'Year:',
              type: 'slider',
              'default': self.state.year,
              dimension: 'time',
              attribute: 'year',
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

  self.update = function(state) {
    self.state = state;
    self.state.drilldowns = self.state.drilldowns || [self.state.drilldown];
    self.state.cuts = self.state.cuts || {};

    var cuts = [];
    for (var field in self.state.cuts) {
      cuts.push(field + ':' + self.state.cuts[field]);
    }

    if (self.state.year) {
      cuts.push('time.year:' + self.state.year);
    }

    if (typeof self.context.member !== 'undefined' && typeof self.context.dimension !== 'undefined') {
      cuts.push(self.context.dimension + ':' + self.context.member);
    }

    if (self.state.drilldowns) {
      self.aggregator = new OpenSpending.Aggregator({
        siteUrl: self.context.siteUrl,
        dataset: self.context.dataset,
        drilldowns: self.state.drilldowns,
        order: self.context.order,
        cuts: cuts,
        rootNodeLabel: 'Total',
        callback: function(data) {
          self.setDataFromAggregator(this.dataset, data);
        }
      });
    }
  };

  self.serialize = function() {
    return self.state;
  };

  self.init = function () {
    self.$e = elem;
    self.$e.before('<div class="timeseries-qb"></div>');
    self.$qb = elem.prev();
    self.palette = new Rickshaw.Color.Palette();
    self.update(self.state);
  };

  self.setDataFromAggregator = function (dataset, data) {
    self.currency = data.currency;
    self.level = 0;
    self.setNode(data);
  };

  self.setNode = function (node) {
    var data = [];
    var results = node.children.slice(0, self.context.numberOfEntities);
    for (var i in results) {
      var result = results[i];
      var resultData = {
        name: result.label,
        color: self.palette.color(),
        data: []
      };
      var values = _.map(result.children, function (node) {
        return { x: Date.parse(node.name)/1000, y: node.amount };
      });

      resultData.data = values.sort(function (a, b) { return a.x - b.x; });

      if (values.length !== 0) {
          data.push(resultData);
      }
    };

    Rickshaw.Series.zeroFill(data);
    self.data = data;
    self.draw();
  };

  self.drilldown = function(tile) {
    if (!tile.data.node.children.length) {
      self.context.click(tile);
    } else {
      self.setNode(tile.data.node);
    }
  };

  self.draw = function () {
    var yAxisElement;
    var graphElement;
    var legendElement;
    self.$e.empty();
    if (!self.data.length) {
      $(self.$e).hide();
      return;
    }
    $(self.$e).show();
    self.$e[0].innerHTML = '<div id="y-axis"></div><div id="graph"></div><div id="legend"></div>';
    yAxisElement = document.querySelector('#y-axis');
    graphElement = document.querySelector('#graph');
    legendElement = document.querySelector('#legend');

    self.graph = new Rickshaw.Graph({
      element: graphElement,
      renderer: self.context.renderer || 'line',
      series: self.data
    });

    var xAxis = new Rickshaw.Graph.Axis.Time({ graph: self.graph });

    var yAxis = new Rickshaw.Graph.Axis.Y({
      graph: self.graph,
      orientation: 'left',
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      element: yAxisElement
    });

    var legend = new Rickshaw.Graph.Legend({
      element: legendElement,
      graph: self.graph
    });

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: self.graph,
        legend: legend
    });

    var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
        graph: self.graph,
        legend: legend
    });

    var hoverDetail = new Rickshaw.Graph.HoverDetail({
        graph: self.graph,
        yFormatter: function (y) { return OpenSpending.Utils.formatAmountWithCommas(y, 0, self.currency); }
    });

    self.graph.render();
  };

  // The rest of this function is suitable for copypasta into other
  // plugins: load all scripts we need, and return a promise object
  // that will fire when the class is ready
  var dfd = $.Deferred();
  dfd.done(function(that) {that.init();});

  if (!window.timeseriesWidgetLoaded) {
    yepnope({
      load: resources,
      complete: function() {
        window.timeseriesWidgetLoaded = true;
        dfd.resolve(self);
      }
    });
  } else {
    dfd.resolve(self);
  }

  return dfd.promise();
};

})(jQuery);

