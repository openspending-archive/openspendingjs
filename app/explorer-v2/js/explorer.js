var OpenSpending = OpenSpending || {};
OpenSpending.App = {} || OpenSpending.App;

OpenSpending.App.Explorer = function(config) {
  var my = {};
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
      // draw();
      // my.renderTree('#bubble-chart');
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
    $('.loading').html('Loading data <img src="http://m.okfn.org.s3.amazonaws.com/images/icons/ajaxload-circle.gif" />');
    $('.loading').show();
    var $tooltip = $('<div class="tooltip">Tooltip</div>');
    $(figId).append($tooltip);
    $tooltip.hide();
    
    var tooltip = function(event) {
      if (event.type == 'SHOW') {
        // show tooltip
        vis4.log(event);
        $tooltip.css({ 
          left: event.mousePos.x + 4, 
          top: event.mousePos.y + 4 
        });
        $tooltip.html(event.node.label+' <b>'+event.node.famount+'</b>');
        var bubble = event.target;
        
        $tooltip.show();
      } else {
        // hide tooltip
        $tooltip.hide();
      }
    };
    
    var dataLoaded = function(data) {
      $('.loading').hide();
      new OpenSpending.BubbleTree.Loader({
        data: data,
        container: figId,
        rootNodeLabel: 'Grant total',
        bubbleType: 'icon',
        bubbleStyles: {
          // 'cofog': OpenSpending.BubbleTree.Styles.Cofog
        },
        tooltipCallback: tooltip
      });
    };
    
    // call openspending api for data
    new OpenSpending.Aggregator({
      apiUrl: my.config.endpoint + 'api',
      dataset: my.config.dataset,
      drilldowns: my.config.drilldowns,
      // breakdown: 'region',
      callback: dataLoaded
    });
  };

  return my;
};

