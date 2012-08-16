var OpenSpending = OpenSpending || {}

OpenSpending.EntriesSearch = function (input, categories, searchResults, template, pageSize, maxPages) {
  window.onhashchange = function () {
    var params = _getParams();
    if (!params['q']) { return; }

    input.val(params['q']);
    categories.filter('[value='+params['category']+']').attr('checked', true);
    _search(params);
  };
  window.onhashchange();

  input.closest('form').submit(function (evt) {
    _extendParams({'q': input.val(),
                   'category': categories.filter(':checked').val(),
                   'page': 1});

    evt.preventDefault();
  });

  function _getParams() {
    var hash = window.location.hash.substring(1),
        query = location.search.substring(1),
        params = {};

    var paramsArray = query.split('&').concat(hash.split('&'));

    for (i in paramsArray) {
      var keyValue = paramsArray[i].split('=');
      if (keyValue[0].length>0) {
        params[keyValue[0]] = decodeURIComponent(keyValue[1]);
      }
    }

    console.log(params);
    return params;
  };

  function _extendParams(newAttributes) {
    var newParams = $.extend(_getParams(), newAttributes);

    window.location.hash = _paramsToHash(newParams);

    return newParams;
  };

  function _paramsToHash(params) {
    var values = [];

    for (key in params) {
      values = values.concat(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }

    return values.join('&');
  };

  function _search(params) {
    var defaultParams = { 'pagesize': pageSize, 'order': 'amount:desc' };

    params = $.extend(defaultParams, params);

    _toggleSpinner();

    $.getJSON("/api/2/search", params, function (data) {
      _toggleSpinner();

      if (data.results.length === 0) {
        searchResults.html('<div class="alert alert-warning">No data available for this query.</div>');
        return;
      }

      _displayResults(data, searchResults);
      searchResults.highlight(params['q']);
    });
  };

  function _displayResults(data, element) {
    element.html('');

    for (i in data.results) {
      element.append(_prepareResult(data.results[i]));
    }

    _displayPagination(data.stats.results_count_query, element);
  };

  function _displayPagination(resultsNumber, element) {
    var paginationDiv = $('<div class="pagination" />');

    _displayPaginationPages(resultsNumber, paginationDiv);
    var infoEl = $('#pagination-info');
    _displayPaginationMessage(resultsNumber, infoEl);

    element.append(paginationDiv);
  };

  function _displayPaginationPages(resultsNumber, element) {
    var pagesCount = Math.ceil(resultsNumber / pageSize),
        pagesDiv = $('<div />'),
        pagesLinks = $('<ul />'),
        maxPagesHalf = Math.floor(maxPages / 2),
        currentPage = _currentPage(),
        startingPage,
        endingPage;

    if (pagesCount < maxPages) {
      startingPage = 1;
      endingPage = pagesCount;
    }
    else if (currentPage <= maxPagesHalf) {
      startingPage = 1;
      endingPage = maxPages;
    }
    else if (currentPage >= (pagesCount - maxPagesHalf)) {
      startingPage = pagesCount - maxPages + 1;
      endingPage = pagesCount;
    }
    else {
      startingPage = currentPage - Math.ceil(maxPages / 2) + 1;
      endingPage = startingPage + maxPages - 1;
    }

    for (var i = startingPage; i <= endingPage; i++) {
      var pageLink = $('<li><a href="#">'+i+'</a></li>');

      if (currentPage === i) { pageLink.addClass('active'); }

      pagesLinks.append(pageLink);
    }

    pagesDiv.append(pagesLinks);
    element.append(pagesDiv);

    _setupPaginationEvents(pagesLinks);
  };

  function _currentPage() {
    return parseInt(_getParams()['page']) || 1;
  };

  function _setupPaginationEvents(element) {
    element.children().click(function (evt) {
      var page = $(this).children('a').html();
      _extendParams({'page': page})

      evt.preventDefault();
    });
  };

  function _displayPaginationMessage(resultsNumber, element) {
    var fromResult = 1 + pageSize * (_currentPage() - 1),
        toResult = Math.min(resultsNumber, fromResult + pageSize - 1),
        message = 'Showing '+fromResult+' to '+toResult+' of '+resultsNumber+' entries',
        messageDiv = $('<div />').html(message);

    element.empty();
    element.append(messageDiv);
  };

  function _toggleSpinner(element) {
    input.toggleClass('spinner');
  };

  function _prepareResult(result) {
    var titleTemplate = result.dataset.serp_title || $('#search-result-title-template').html();
    result._title = Handlebars.compile(titleTemplate)(result);
    var teaserTemplate = result.dataset.serp_teaser || $('#search-result-teaser-template').html();
    result._teaser = Handlebars.compile(teaserTemplate)(result);
    result.amount = OpenSpending.Utils.formatAmountWithCommas(result.amount, 0,
      result.dataset.currency)
    return template(result);
  };

};

$(document).ready(function () {
  var template = $('#search-result-template').html(),
      resultTemplate = Handlebars.compile(template),
      searchInput = $('#search input[name="q"]'),
      categories = $('#search .select-category'),
      searchResults = $('#search-results'),
      pageSize = 15,
      maxPages = 15;

  OpenSpending.EntriesSearch(searchInput, categories, searchResults, resultTemplate, pageSize, maxPages)
});

