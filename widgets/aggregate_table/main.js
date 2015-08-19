
(function ($) {

OpenSpending.AggregateTable = function (elem, context, state) {
  var self = this;

  var resources = [
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

  this.getDownloadURL = function() {
    var data = self.dataTable.lastParams;
    data['format'] = 'csv';
    return self.dataTable.options.source + '?' + $.param(data);
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
    var columns = self.generateColumns(drilldowns);
    drilldowns = drilldowns.join('|');

    self.dataTable = new OpenSpending.DataTable(self.$e, {
      source: context.siteUrl + '/api/2/aggregate',
      fullCount: function(data) {return data.summary.num_drilldowns;},
      resultCollection: self.calculateRowsValues,
      sorting: [],
      tableOptions: {
        bFilter: false,
        sDom: "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
        sPaginationType: "bootstrap",
        iDisplayLength: context.pagesize || 15,
        fnDrawCallback: self.addClassToTotalRow
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
  
  this.generateColumns = function(drilldowns) {
    var columns = _.map(drilldowns, function(d) {
      return {name: d, label: self.mapping[d].label};
    });
    columns.push({
          'name': 'amount',
          'label': self.mapping['amount'].label + ' (<span class="currency"></span>)',
          'width': '15%',
          'render': function(coll, obj) {
            return OpenSpending.Utils.formatAmountWithCommas(obj || 0,
              0, coll.aData['__amount_currency']);
          }
        });
    columns.push({
          'name': '__amount_pct',
          'label': '%',
          'width': '7%',
          'render': function(coll, obj) {
            obj = (obj || 0) * 100;
            return OpenSpending.Utils.formatAmountWithCommas(obj, 2) + '%';
          }
        });
    return columns;
  };

  this.calculateRowsValues = function(data) {
    function _showCurrencySymbol() {
      var symbol = OpenSpending.Utils.currencySymbol(data.summary.currency.amount);
      self.$e.find('.currency').text(symbol);
    };
    function _calculateTotalRow(data) {
      var total = {
        __amount_pct: 1,
        amount: data.summary.amount,
        num_entries: data.summary.num_entries
      }
      if (data.drilldown.length > 0) {
        var sampleData = data.drilldown[0];
        var drilldowns = _.difference(_.keys(sampleData), _.keys(total));
        var drilldownTotal = {
          label: 'Total'
        };
        for (var i in drilldowns) {
          total[drilldowns[i]] = drilldownTotal;
        }
      }
      return total;
    };

    var rows = _.map(data.drilldown, function(d) {
      if (data.summary.amount) {
        d.__amount_pct = d.amount / data.summary.amount;
      } else {
        d.__amount_pct = 0.0;
      }
      return d;
    });

    if (data.summary.num_entries > 0) {
      rows.push(_calculateTotalRow(data));
    }
    _showCurrencySymbol();

    return rows;
  };

  this.addClassToTotalRow = function(oSettings) {
    var data = oSettings.aoData;
    var totalRow = data[data.length - 1];
    if (totalRow) {
      $(totalRow.nTr).addClass('total');
    }
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

  
