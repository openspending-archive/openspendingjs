/**********************************************************
  Javascript library for OpenSpending search.
***********************************************************/


(function($) {
  $(function() {
    config = {
      endpoint: 'http://uat.openspending.org/'
    }
    OpenSpending.Search.configure(config);

    $('form').submit(function(e) {
      e.preventDefault();
      var f = $(e.target);
      var to = f.find('input[name=supplier]').val();
      to = to.toLowerCase();
      OpenSpending.Search.searchTo(to);
    });
    $('form').submit();
  });
})(jQuery);

OpenSpending.Search = (function($, my) {
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
    Manager.init();
    // default search query - all records
    // Manager.store.addByValue('q', '*:*');
    // Manager.doRequest();
  }

	my.searchTo = function(to) {
    var q = 'to:*' + to + '* dataset:departments'
    Manager.store.addByValue('q', q);
    Manager.store.addByValue('sore', 'amount desc');
    Manager.doRequest();
	};

  my.entryUrl = function(entry) {
    if ('name' in entry) {
      var entry_id = entry.name;
    } else {
      var entry_id = entry._id;
    }
    return my._config.endpoint + 'entry/' + entry_id;
  }

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
