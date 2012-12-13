OpenSpending.Treetable = function (elem, context, drilldowns) {
  var treemapElem = $('<div id="vis_widget" />').appendTo(elem);
  var aggregateTableElem = $('<div id="table_widget" />').appendTo(elem);

  function render(state, callback) {
    var treemap_ctx = _.extend(context, {
      click: function(node) { callback(node.data.name); }
    });

    new OpenSpending.Treemap(treemapElem, treemap_ctx, state);
    new OpenSpending.AggregateTable(aggregateTableElem, context, state).then(function(widget) {
      widget.$e.unbind('click', 'td a');
      widget.$e.on('click', 'td a', function(e) {
        var name = $(e.target).data('name') + '';
        callback(name);
        return false;
      });
    });
  }

  function drilldown(filters, callback) {
    var currentDrilldown = _.find(drilldowns, function(d) {
      return -1 == _.indexOf(_.keys(filters), d);
    });

    var state = {
      drilldowns: [currentDrilldown],
      cuts: filters
    };

    render(state, function(name) {
      if (_.indexOf(drilldowns, currentDrilldown) >= drilldowns.length-1) {
        context.callback(name);
      } else {
        callback(name, filters, currentDrilldown);
      }
    });
  }

  return {
    render: render,
    drilldown: drilldown
  }
};
