var OpenSpending = OpenSpending || {}

OpenSpending.EntriesSearch = function (input, searchResults, template, pageSize, maxPages) {
  window.onhashchange = function () {
    var params = _getParams();
    if (!params['q']) { return; }

    input.val(params['q']);
    _search(params);
  };
  window.onhashchange();

  input.closest('form').submit(function (evt) {
    _extendParams({'q': input.val(), 'page': 1});

    evt.preventDefault();
  });

  function _getParams() {
    var hash = window.location.hash,
        params = {};

    var paramsArray = hash.replace('#', '').split('&');
    if (paramsArray[0] === '') { return params; }

    for (i in paramsArray) {
      var keyValue = paramsArray[i].split('=');
      params[keyValue[0]] = keyValue[1];
    }

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
    var defaultParams = { 'pagesize': pageSize, 'order': 'time:desc' };

    params = $.extend(defaultParams, params);

    _toggleSpinner();

    $.getJSON("/api/2/search", params, function (data) {
      _toggleSpinner();

      if (data.results.length === 0) {
        searchResults.html('No data available for this query.');
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
    _displayPaginationMessage(resultsNumber, paginationDiv);

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

    element.append(messageDiv);
  };

  function _toggleSpinner(element) {
    input.toggleClass('spinner');
  };

  function _prepareResult(result) {
    result['values'] = _prepareDimensionsForHandlebars(result);
    result.amount = OpenSpending.Utils.formatAmountWithCommas(result.amount, 0, result.currency)
    return template(result);
  };

  function _prepareDimensionsForHandlebars(result) {
    var dimensions = [];

    for (dimension in result) {
      var label = result[dimension].label;
      if (dimension !== "time" && dimension !== "dataset" && label) {
        dimensions.push({ key: dimension, value: label });
      }
    }

    return dimensions;
  };
};

$(document).ready(function () {
  var template = $('#search-result-template').html(),
      resultTemplate = Handlebars.compile(template),
      searchInput = $('#search input[name="q"]'),
      searchResults = $('#search-results'),
      pageSize = 15,
      maxPages = 15;

  OpenSpending.EntriesSearch(searchInput, searchResults, resultTemplate, pageSize, maxPages)
});

