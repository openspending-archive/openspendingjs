OpenSpending.App = {} || OpenSpending.App;

OpenSpending.App.SpendBrowser = (function($) {
  var my = {};

  return function(config) {
    var my = {
      initialize: function() { 
        var $target = $(config.target);
        $target.append(this.tmplNavigator);
        $target.append(this.tmplResults);

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
          target: config.target + ' .navigator .filters-current .list',
        }));
        manager.init();

        var $form = $(config.target + ' form');
        var $to = $form.find('input[name=recipient]');

        $form.submit(function(e) {
          e.preventDefault();

          // Get data from our form and normalize
          var f = $(e.target);
          var to = $to.val();
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
              dataset: config.dataset
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
        $(config.target + ' form .clear-search').click(function(e) {
          e.preventDefault();
          $to.val('');
          $form.submit();
        });

        // start us off with a simple search
        $('form').submit();
      },

      tmplNavigator: ' \
        <div class="navigator"> \
          <div class="filters-current"> \
            <h2>Filters</h2> \
            <div class="list"> \
            </div> \
          </div> \
          <div class="form"> \
            <h2>Search</h2> \
            <form> \
              <input name="recipient" type="text" value="" placeholder="Recipient ..." /> \
              <button type="submit" name="search">Search &raquo;</button> \
              <a href="#" class="clear-search">Clear Search</a> \
            </form> \
             \
            <div class="facets"> \
              <div class="department-facet"></div> \
            </div> \
          </div> \
        </div> \
        ',
      
      tmplResults: ' \
        <div class="results"> \
          <div class="messages"> \
          </div> \
          <div class="num-entries"> \
            <span> \
            </span> \
          </div> \
          <div class="result-list"></div> \
        </div> \
        '
    };

    return my;
  };

})(jQuery);

