$(document).ready(function () {
  (function ($) {
    var template = $('#search-result-template').html(),
        resultTemplate = Handlebars.compile(template);

    var query = $('#search input[name="q"]').val();
    if (query !== '') {
      _search(query);
    }

    function _search(query) {
      var resultsDiv = $('#search-results');
      _toggleSpinner(resultsDiv);

      $.getJSON("/api/2/search", {"q": query}, function (data) {
        var results = data.results;

        resultsDiv.html('');

        for (i in results) {
          resultsDiv.append(_prepareResult(results[i]));
        }

        resultsDiv.highlight(query);
        _toggleSpinner(resultsDiv);
      });
    }

    function _toggleSpinner(element) {
      element.toggleClass('spinner');
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

