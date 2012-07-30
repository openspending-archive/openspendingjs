$(document).ready(function () {
  (function ($) {
    var template = $('#result-template').html(),
        resultTemplate = Handlebars.compile(template);

    $('#search').submit(function (evt) {
      var query = $('#search input[name="q"]').val();

      $.getJSON("/api/2/search", {"q": query}, function (data) {
        var results = data.results,
            resultsDiv = $('#results');

        resultsDiv.html('');

        for (i in results) {
          resultsDiv.append(_prepareResult(results[i]));
        }
      });

      return false;
    });

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

