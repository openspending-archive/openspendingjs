/**********************************************************
  Javascript library for OpenSpending search.

OpenSpending's search interface mimics that of Solr, see
http://openspending.org/api.

This JS library's API is therefore also similar to Solr.
***********************************************************/


(function($) {
  $(function() {
    config = {
      endpoint: 'http://uat.openspending.org/'
    }
    OpenSpending.Search.configure(config);

    $('form').submit(function(e) {
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
  });
})(jQuery);

OpenSpending.Search = (function($, my) {
  // default config
  my._config = {
    endpoint: 'http://openspending.org/'
  }

  Manager = null;
  my.configure = function(config) {
    my._config = config;
    my._config.searchApi = my._config.endpoint + 'api/search';
    // slight hack here is AjaxSolr expects base solr url and then appends servlet (defaults to 'select')
    Manager = new AjaxSolr.Manager({
      solrUrl: my._config.searchApi,
      servlet: ''
      });
    Manager.addWidget(new my.ResultWidget({
      id: 'result',
      target: '.results'
    }));
    Manager.addWidget(new AjaxSolr.PagerWidget({
      id: 'pager',
      target: '.pager',
      innerWindow: 2,
      outerWindow: 1,
      renderHeader: function (perPage, offset, total) {
        $('#pager-header').html($('<span/>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
      },
      renderLinks: function(links) {
        if (this.totalPages) {
          links.unshift(this.pageLinkOrSpan(this.previousPage(), [ 'pager-disabled', 'pager-prev' ], this.prevLabel));
          links.push(this.pageLinkOrSpan(this.nextPage(), [ 'pager-disabled', 'pager-next' ], this.nextLabel));

          var res = $('<ul />');
          $.each(links, function(idx, link) {
            var _li = $('<li />');
            _li.append(link);
            res.append(_li);
            });
          $(this.target).append(res);
        }
      }
    }));
    Manager.init();
    // default search query - all records
    // Manager.store.addByValue('q', '*:*');
    // Manager.doRequest();
  }

  my.search = function(params) {
    _params = $.extend(true, {}, params);
    _params.q = _params.q || '';
    if ('qparams' in _params) {
      for (var k in _params.qparams) {
        _params.q += ' ' + k + ':' + _params.qparams[k];
      }
    }
    delete _params['qparams'];
    for (var name in _params) {
      Manager.store.addByValue(name, _params[name]);
    }
    Manager.doRequest();
  };

  my.entryUrl = function(entry) {
    if ('name' in entry) {
      var entry_id = entry.name;
    } else {
      var entry_id = entry._id;
    }
    return my._config.endpoint + 'entry/' + entry_id;
  };

  my.ResultWidget = AjaxSolr.AbstractWidget.extend({
    init: function () {
      this.$target = $(this.target);
      this.$messages = this.$target.find('.messages');
      this.$resultlist = this.$target.find('.result-list');
    },

    beforeRequest: function () {
      this.$messages.html($('<img/>').attr('src', 'http://assets.okfn.org/images/icons/ajaxload-circle.gif'));
    },

    afterRequest: function () {
      this.$messages.empty();
      var data = this.manager.response;

      this.$target.find('.num-entries span').html(data.response.numFound + ' entries.');

      var out = $('#tmpl-entries-list').tmpl(data.response);
      this.$resultlist.empty().append(out);
    }
  });

  return my;
})(jQuery, OpenSpending.Search || {});
