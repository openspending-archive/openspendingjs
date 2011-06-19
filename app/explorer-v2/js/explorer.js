var OpenSpending = OpenSpending || {};
OpenSpending.App = {} || OpenSpending.App;

OpenSpending.App.Explorer = function(config) {
  my = {};
  my.config = config;
  my.dataset = null;

  my.initialize = function() {
    var $breakdown = $('#controls-breakdown');
    var $breakdownList = $breakdown.find('ol');
    var model = OpenSpending.Model(my.config);

    var datasetObj = new model.Dataset({
      name: my.config.dataset
    });
    datasetObj.fetch({
      success: init,
      dataType: 'jsonp'
    });

    function init(dataset) {
      my.dataset = dataset;
      $.each([1,2], function(idx, item) {
        var tselect = $('<select />');
        tselect.append($('<option />').attr('value', '').html(''));
        $.each(dataset.drilldownDimensions(), function(idx, item) {
          tselect.append($('<option />').attr('value', item).html(item));
        });
        $breakdownList.append($('<li />').append(tselect));
      });
      $breakdown.find('button').click(function(e) {
        e.preventDefault();
        draw();
      });
      draw();
    }

    function draw() {
      var vals = [];
      $.each($breakdown.find('select option:selected'), function(idx, item) {
        var _dim = $(item).text();
        // ignore the empty string
        if (_dim) {
          vals.push(_dim);
        }
      });
      vals = _.uniq(vals);
      my.config.drilldowns = vals;
      var containerId = my.config.target + ' .bubbletree';
      if (my.config.drilldowns.length > 0) {
        my.renderTree(containerId);
      }
    }
  };

  my.renderTree = function(figId) {
    var config = {
      apiUrl: my.config.endpoint + 'api',
      container: figId,
      dataset: my.config.dataset,
      drilldowns: my.config.drilldowns
    };
    new OpenSpending.BubbleTree.Loader(config);
  };

  return my;
};

