OpenSpending.Treetable = function (elem, context, filters, drilldowns) {
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

  return {
    render: render,
    context: context,
    filters: filters,
    drilldowns: drilldowns
  }
};
