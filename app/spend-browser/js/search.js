/**********************************************************

Purpose: javascript search widget for OpenSpending.

Can configure:

  * API source
  * Default dataset

Plan:

  1. Search method ->

  *********************************************************/


jQuery(document).ready(function($) {
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

OpenSpending.Search = (function($, my) {
  my._config = {
    endpoint: 'http://openspending.org/'
  }

  my.configure = function(config) {
    my._config = config;
    my._config.searchApi = my._config.endpoint + 'api/search';
  }
  
	my.searchTo = function(to) {
		var url = my._config.searchApi + '?q=';
    var q = 'to:*' + to + '* dataset:departments'
    q = encodeURIComponent(q);
    q += '&sort=amount desc';
    url += q;
		$.ajax({
			url: url,
			success: displayData,
			dataType: 'jsonp',
			jsonp: 'json.wrf'
		});
	};

  function displayData(data) {
    $('.num-entries span').text(data.response.numFound + ' entries.');

    var out = $('#tmpl-entries-list').tmpl(data.response);
    $('#entries').html(out);
	}

  my.entryUrl = function(entry) {
    if ('name' in entry) {
      var entry_id = entry.name;
    } else {
      var entry_id = entry._id;
    }
    return my._config.endpoint + 'entry/' + entry_id;
  }

  return my;
})(jQuery, OpenSpending.Search || {});
