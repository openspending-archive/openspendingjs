
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
          'render': function(coll, obj) {
            return OpenSpending.Utils.formatAmountWithCommas(obj || 0);
          }
        });

    self.dataTable = new OpenSpending.DataTable(self.$e, {
      source: context.siteUrl + '/api/2/aggregate',
      fullCount: function(data) {return data.summary.num_drilldowns;},
      resultCollection: 'drilldown',
      sorting: [],
      tableOptions: {
        bFilter: false,
        sDom: "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
        sPaginationType: "bootstrap"
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

    $.get(context.siteUrl + '/' + context.dataset + '/model.json', function(data) {
      self.mapping = data.mapping;
      self.update(self.state);
    });
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

  