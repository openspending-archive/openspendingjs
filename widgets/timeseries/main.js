OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

OpenSpending.Timeseries = function (elem, context, state) {
  var self = this;

  var resources = [
                 OpenSpending.scriptRoot + "/widgets/timeseries/js/d3.min.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/js/d3.layout.min.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/js/rickshaw.min.js",
                 OpenSpending.scriptRoot + "/widgets/timeseries/css/rickshaw.min.css"
                 ];

  self.context = context;
  self.state = state;

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
      var searchApiUri = self.context.siteUrl + '/api/2/search';
      $.getJSON(searchApiUri,
          {
            dataset: self.context.dataset
          },
          function (data) {
            self.setDataFromAggregator(self.dataset, data);
          });
    }
  };

  self.serialize = function() {
    return self.state;
  };

  self.init = function () {
    self.$e = elem;
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
    var groupedNodes = _.groupBy(node.results, function (item) { return item.to.label; });
    for (var key in groupedNodes) {
      var result = {
        name: key,
        color: self.palette.color(),
        data: []
      };
      var values = _.map(groupedNodes[key], function (node) {
        return { x: Date.parse(node.time.name)/1000, y: node.amount };
      });

      result.data = values.sort(function (a, b) { return a.x - b.x; });

      if (values.length !== 0) {
          data.push(result);
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
    self.$e.empty();
    if (!self.data.length) {
      $(self.$e).hide();
      return;
    }
    $(self.$e).show();

    self.graph = new Rickshaw.Graph({
      element: self.$e[0],
      width: 700,
      height: 500,
      renderer: self.context.renderer || 'line',
      series: self.data
    });

    var xAxis = new Rickshaw.Graph.Axis.Time({ graph: self.graph });

    var yAxis = new Rickshaw.Graph.Axis.Y({
      graph: self.graph,
      orientation: 'left',
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      element: document.getElementById('y_axis'),
    });

    var legend = new Rickshaw.Graph.Legend({
      element: document.querySelector('#legend'),
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
        graph: self.graph
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

