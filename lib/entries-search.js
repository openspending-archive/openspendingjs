var OpenSpending = OpenSpending || {}

OpenSpending.EntriesSearch = function (input, searchResults, template) {
  var form = input.closest('form');

  form.submit(function (evt) {
    var query = input.val();

    if (query !== '') {
      _search(input);
      _extendParams({'q': query});
    }

    evt.preventDefault();
  });

  var query = _getParams()['q'];
  if (query) {
    input.val(query);
    form.submit();
  }

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
  };

  function _paramsToHash(params) {
    var values = [];

    for (key in params) {
      values = values.concat(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }

    return values.join('&');
  };

  function _search(input) {
    var query = input.val(),
        params = {"q": query, "order": "time:desc"};

    _toggleSpinner(input);

    $.getJSON("/api/2/search", params, function (data) {
      _displayResults(data.results, searchResults);
      _toggleSpinner(input);
      searchResults.highlight(query);
    });
  };

  function _displayResults(results, element) {
    if (results.length === 0) {
      element.html('No data available for this query.');
      return;
    }

    element.html('');

    for (i in results) {
      element.append(_prepareResult(results[i]));
    }
  };

  function _toggleSpinner(element) {
    element.toggleClass('spinner');
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
      searchResults = $('#search-results');

  OpenSpending.EntriesSearch(searchInput, searchResults, resultTemplate)
});

