var OpenSpending = OpenSpending || {};
OpenSpending.App = {} || OpenSpending.App;

// Explorer App
// 
// config argument has following attributes
// @param: endpoint: api endpoint for OpenSpending site
// @param target: css selector for element to attach to (append content to this element)
// @param dataset: dataset id / name.
// @param aggregator: hash containing arguments to use for aggregator call (breakdown, drilldowns, cuts). Can be empty.
OpenSpending.App.Explorer = function(config) {
  var my = {};
  my.config = config;
  if (!my.config.aggregator) {
    my.config.aggregator = {};
  }
  var aggregatorConfig = OpenSpending.aggregatorConfigFromQueryString();
  _.extend(my.config.aggregator, aggregatorConfig);
  my.dataset = null;

  my.initialize = function() {
    var $parent = $(my.config.target);
    $parent.append($(explorerTmpl));
    var $explorer = $parent.find('.explorer');
    my.containerId = my.config.target + ' .explorer .bubbletree';
    my.$breakdown = $explorer.find('#controls-breakdown');
    var $breakdownList = my.$breakdown.find('ol');
    var model = OpenSpending.Model(my.config);

    var datasetObj = new model.Dataset({
      name: my.config.dataset
    });
    datasetObj.fetch({
      success: initBreakdowns,
      dataType: 'jsonp'
    });

    function initBreakdowns(dataset) {
      // disable as drilldownDimensions not working atm
      return;
      my.dataset = dataset;
      $.each([1,2,3], function(idx, item) {
        var tselect = $('<select />');
        tselect.append($('<option />').attr('value', '').html(''));
        $.each(dataset.drilldownDimensions(), function(idx, item) {
          tselect.append($('<option />').attr('value', item).html(item));
        });
        $breakdownList.append($('<li />').append(tselect));
      });
      my.$breakdown.find('button').click(function(e) {
        e.preventDefault();
        my.draw();
      });
    }

    if (my.config.aggregator && my.config.aggregator.drilldowns) {
      my.renderTree(my.containerId);
    } else {
      $('.loading').html('Please select drilldown from sidebar and hit redraw');
    }
  };

  my.draw = function() {
    var vals = [];
    $.each(my.$breakdown.find('select option:selected'), function(idx, item) {
      var _dim = $(item).text();
      // ignore the empty string
      if (_dim) {
        vals.push(_dim);
      }
    });
    vals = _.uniq(vals);
    my.config.aggregator.drilldowns = vals;
    if (my.config.aggregator.drilldowns.length > 0) {
      my.renderTree(my.containerId);
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
    
    var getTooltip = function() {
      return this.getAttribute('tooltip');
    };
    
    var initTooltip = function(node, domnode) {
      vis4.log($(domnode).tooltip);
      vis4.log(node.label + ' - '+node.famount);
      domnode.setAttribute('tooltip', node.label + ' <b>'+node.famount+'</b>');
      
      //vis4.log(domnode.getAttribute('tooltip'));
      
      $(domnode).tooltip({ delay: 100, bodyHandler: getTooltip });
    };

	var breakdownStyles = function() {
      // 'cofog': OpenSpending.BubbleTree.Styles.Cofog
	  if (my.config.aggregator.breakdown) {
	  	var bubbleStyles = { name: {} };

		var breakdownStyles = function(data) {
          var extractStyle = function(i) { return i[my.config.aggregator.breakdown].name; };

		  if (data.hasOwnProperty('drilldown')) {
			breakdowns = data.drilldown.map(extractStyle);
			for (var i=0, len=breakdowns.length; i < len; i++) {
		      bubbleStyles.name[breakdowns[i]] = { color: vis4color.fromHSV(i / len * 360, 0.5, 0.95, "hsv").x };
			}
          }
	    };
	
		$.ajax({
		  url: '/api/2/aggregate',
		  data: {
			'dataset': my.config.dataset,
			'drilldown': my.config.aggregator.breakdown
		  },
		  dataType: 'json',
		  success: breakdownStyles
		});
	    return bubbleStyles;
	  } else {
		return null;
	  }
	};

    var dataLoaded = function(data) {
      $('.loading').hide();
      var config = {
        data: data,
        container: figId,
        bubbleType: 'donut',
        bubbleStyles: my.config.bubbleStyles || breakdownStyles() || {},
        initTooltip: initTooltip,
        maxNodesPerLevel: 12
        // tooltipCallback: tooltip
      };
      var bubbletree = new BubbleTree(config);
    };

    aggregatorConfig = {
      apiUrl: my.config.endpoint + 'api',
      dataset: my.config.dataset,
      // localApiCache: '../bubbletree/examples/cra/aggregate.json',
      callback: dataLoaded
    };
    _.extend(aggregatorConfig, my.config.aggregator);
    // call openspending api for data
    new OpenSpending.Aggregator(aggregatorConfig);
  };

  explorerTmpl = ' \
    <div class="explorer"> \
      <div id="controls"> \
       <div id="controls-year"> \
          <h3>Year: <span id="year">2009</span></h3> \
          <div id="yearslider"></div> \
          <div id="year-range"></div> \
        </div> \
       <div id="controls-breakdown"> \
         <h3>Breakdown by</h3> \
         <ol id="breakdown-list"> \
         </ol> \
         <button>Redraw</button> \
       </div> \
      </div> \
      <div class="loading"></div> \
      <div class="bubbletree-wrapper"> \
        <div class="bubbletree"></div> \
      </div> \
    </div> \
  ';

  return my;
};

