
(function ($) {

OpenSpending.AggregateTable = function (elem, context, state) {
  var self = this;

  var resources = [
                OpenSpending.scriptRoot + "/lib/vendor/underscore.js",
                OpenSpending.scriptRoot + "/lib/aggregator.js",
                OpenSpending.scriptRoot + "/lib/utils/utils.js",
                OpenSpending.scriptRoot + "/lib/vendor/datatables/js/jquery.dataTables.js",
                OpenSpending.scriptRoot + "/lib/vendor/datatables/css/jquery.dataTables.css",
                OpenSpending.scriptRoot + "/app/data_table/openspending.data_table.js",
                OpenSpending.scriptRoot + "/lib/vendor/datatables/dataTables.bootstrap.js",
                OpenSpending.scriptRoot + "/lib/vendor/datatables/dataTables.bootstrap.css"
            ];

  this.context = context;
  this.state = state;

  this.configure = function(endConfigure) {
    self.$qb.empty();
    var qb = new OpenSpending.Widgets.QueryBuilder(
      self.$qb, self.update, endConfigure, self.context, [
            {
              variable: 'drilldowns',
              label: 'Columns:',
              type: 'select',
              'default': self.state.drilldowns,
              help: 'Each selected dimension will display as a column, and values will be drilled down by it.'
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

  this.serialize = function() {
    return self.state;
  };

  this.update = function(state) {
    //console.log(state);
    self.$e.empty();
    self.state = state;

    var cuts = [];
    for (var field in self.state.cuts) {
      cuts.push(field + ':' + self.state.cuts[field]);
    }

    if (self.state.year) {
      cuts.push('time.year:' + self.state.year);
    }

    if (cuts.length) {
      cuts = cuts.join('|');
    }

    var drilldowns = self.state.drilldowns || [];
    var columns = _.map(drilldowns, function(d) {
      return {name: d, label: self.mapping[d].label};
    });
    drilldowns = drilldowns.join('|');
    columns.push({
          'name': 'amount',
          'label': self.mapping['amount'].label,
          'width': '15%',
          'render': function(coll, obj) {
            return OpenSpending.Utils.formatAmountWithCommas(obj || 0);
          }
        });
    columns.push({
          'name': '__amount_pct',
          'label': '%',
          'width': '7%',
          'render': function(coll, obj) {
            obj = (obj || 0) * 100;
            return obj.toFixed(2) + '%';
          }
        });

    self.dataTable = new OpenSpending.DataTable(self.$e, {
      source: context.siteUrl + '/api/2/aggregate',
      fullCount: function(data) {return data.summary.num_drilldowns;},
      resultCollection: function(data) {
        return _.map(data.drilldown, function(d) {
          if (data.summary.amount) {
            d.__amount_pct = d.amount / data.summary.amount;
          }
          return d;
        });
      },
      sorting: [],
      tableOptions: {
        bFilter: false,
        sDom: "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
        sPaginationType: "bootstrap",
        iDisplayLength: context.pagesize || 15
      },
      defaultParams: {
        dataset: context.dataset,
        drilldown: drilldowns,
        cut: cuts
      },
      columns: columns
    });
    self.dataTable.init();
    
  };
  
  this.init = function() {
    self.$e = elem;
    self.$e.empty();
    self.$e.before('<div class="table-qb"></div>');
    self.$qb = elem.prev();
    self.$e.addClass("table-widget");

    $.ajax({
      url: context.siteUrl + '/' + context.dataset + '/model.json', 
      cache: true,
      jsonpCallback: 'model',
      success: function(data) {
        self.mapping = data.mapping;
        self.update(self.state);
        }, 
      dataType: 'jsonp'
      });
};

  // The rest of this function is suitable for copypasta into other
  // plugins: load all scripts we need, and return a promise object
  // that will fire when the class is ready
  var dfd = $.Deferred();
  dfd.done(function(that) {that.init();});

  if (!window.aggregateTableWidgetLoaded) {
    yepnope({
      load: resources,
      complete: function() {
        window.aggregateTableWidgetLoaded = true;
        dfd.resolve(self);
      }
    });
  } else {
    dfd.resolve(self);
  }
  
  return dfd.promise();
};

})(jQuery);

  