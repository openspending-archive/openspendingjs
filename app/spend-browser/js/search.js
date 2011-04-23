OpenSpending.App = {} || OpenSpending.App;

OpenSpending.App.SpendBrowser = (function($) {
  var my = {};

  my.initialize = function(config) {
    OpenSpending.Search.configure(config);
    var manager = OpenSpending.Search.Manager;
    manager.addWidget(new OpenSpending.Search.ResultWidget({
        id: 'result',
        target: config.target + ' .results'
      })
    );
    manager.addWidget(new OpenSpending.Search.PagerWidget({
        id: 'pager',
        target: config.target + ' .pager'
      })
    );
    manager.addWidget(new OpenSpending.Search.DropDownFacetWidget({
      id: 'department',
      target: config.target + ' .department-facet',
      field: 'from.label_str'
      })
    );
    manager.addWidget(new OpenSpending.Search.CurrentSearchWidget({
      id: 'currentsearch',
      target: config.target + ' .search-navigator .filters-current .list',
    }));
    manager.init();

    $(config.target + ' form').submit(function(e) {
      e.preventDefault();

      // Get data from our form and normalize
      var f = $(e.target);
      var to = f.find('input[name=supplier]').val();
      to = to.toLowerCase();

      // Perform the search
      // Set up our search parameters
      // These are as for solr with exception of
      // qparams which is a convenient way of searching by field in data
      // (internally we add these to 'q' parameter)
      var params = {
        q: '',
        qparams: {
          to: '*' + to + '*',
          dataset: 'departments'
        },
        sort: 'amount desc',
        facet: true,
        'facet.field': [ 'from.label_str' ],
        'facet.limit': 20,
        'facet.mincount': 1,
        'json.nl': 'map'
      };
      OpenSpending.Search.search(params);
    });

    // start us off with a simple search
    $('form').submit();
  };

  return my 
})(jQuery);

