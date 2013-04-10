
var OpenSpending = OpenSpending || {};
OpenSpending.Utils = OpenSpending.Utils || {};

OpenSpending.Utils.entries = function(dataset_name, dimension_name, 
									  member_name) {
  "use strict";

  var b = new OpenSpending.Browser(
    document.getElementById('openspending_browser'),
    dataset_name
  );

  b.addFilter(dimension_name, member_name);
  $(document).bind('xhr', function(e, conf){
    var params = b.table.lastParams;
    window.setTimeout(function(){
      var total = conf.fnRecordsTotal();
      $('.download-links a').each(function(i, el){
        el = $(el);
        var href = el.attr('href').split('?');
        var pagesize = el.data('pagesize') || total;
        href[1] = 'pagesize=' + pagesize +
          '&order=' + encodeURIComponent(params.order) +
          '&q=' + encodeURIComponent(params.q);
        el.attr('href', href.join('?'));
      });
    }, 500);
    var dimValue = params.filter.split(':')
    var aggregateParams = $.param({
      dataset: params.dataset,
      drilldown: dimValue[0] + '|time.year',
      cut: params.filter,
      order: "time.year:asc"
    });
    var aggregateUrl = '/api/2/aggregate?' + aggregateParams;
    $.getJSON(aggregateUrl, function(data){
      var table = $('#dimension-aggregate');
      var before;
      $.each(data.drilldown, function(i){
        var amount = data.drilldown[i].amount
        var change = '';
        if (before !== undefined) {
          change = (Math.round(((amount - before) / before * 10000)) / 100) + ' %';
        }
        table.append(
          $('<tr>').append($('<td>').text(data.drilldown[i].time.year))
            .append($('<td>').text(
              OpenSpending.Utils.formatAmountWithCommas(amount, 2, data.summary.currency.amount)))
            .append($('<td>').text(change))
        );
        before = amount;
      });
      table.append(
        $('<tr>').append($('<td>').html("<strong>Total</strong>"))
          .append($('<td>').text(
            OpenSpending.Utils.formatAmountWithCommas(data.summary.amount, 2, data.summary.currency.amount)))
          .append('<td></td>')
      );
    });
  });
  b.init();
};