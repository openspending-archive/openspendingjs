$(document).ready(function () {
  (function ($) {
    var template = $('#search-result-template').html(),
        resultTemplate = Handlebars.compile(template);

    var query = _getParams()['q'];
    if (query) {
      $('#search input[name="q"]').val(query);
      $('#search').submit();
    }

    $('#search').submit(function () {
      var query = $('#search input[name="q"]').val();

      if (query !== '') {
        _search(query);
        _extendParams({'q': query});
      }

      return false;
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
    }

    function _extendParams(newAttributes) {
      var newParams = $.extend(_getParams(), newAttributes);

      window.location.hash = _paramsToHash(newParams);
    }

    function _paramsToHash(params) {
      var values = [];

      for (key in params) {
        values = values.concat(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }

      return values.join('&');
    }

    function _search(query) {
      var resultsDiv = $('#search-results'),
          params = {"q": query, "order": "time:desc"};

      _toggleSpinner(resultsDiv);

      $.getJSON("/api/2/search", params, function (data) {
        _displayResults(data.results, resultsDiv);
        _toggleSpinner(resultsDiv);
        resultsDiv.highlight(query);
      });
    }

    function _displayResults(results, element) {
      if (results.length === 0) {
        element.html('No data available for this query.');
        return;
      }

      element.html('');

      for (i in results) {
        element.append(_prepareResult(results[i]));
      }
    }

    function _toggleSpinner(element) {
      $('#search input[name="q"]').toggleClass('spinner');
    }

    function _prepareResult(result) {
      result['values'] = _prepareDimensionsForHandlebars(result);
      result.amount = OpenSpending.Utils.formatAmountWithCommas(result.amount, 0, result.currency)
      return resultTemplate(result);
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
  })(jQuery);
});

