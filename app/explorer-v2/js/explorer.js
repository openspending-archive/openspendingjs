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


  var useControls = function() {
	return false;
	
	if(my.config.aggregator && my.config.aggregator.drilldowns) {
	  return true;
	}
  };

  var showControls = function() {
	$(my.config.target).find('#controls').css('display', 'inline');
  };

  my.initialize = function() {
    var $parent = $(my.config.target);
    $parent.append($(explorerTmpl));
    var $explorer = $parent.find('.explorer');
    my.containerId = my.config.target + ' .explorer .bubbletree';
    my.$drilldown = $explorer.find('#controls-drilldown');
    var $drilldownList = my.$drilldown.find('ol');
	my.$breakdown = $explorer.find('#controls-breakdown');
	var $breakdownAnchor = my.$breakdown = my.$breakdown.find('ol');
    var model = OpenSpending.Model(my.config);

/*  var datasetObj = new model.Dataset({
      name: my.config.dataset
    });
    datasetObj.fetch({
      success: initDimensions,
      dataType: 'jsonp'
    }); */

	var getDimensions = function(datasetName) {
	  var handler = function(model) {
		var output = [];
		for(i in model.mapping) {
		  output.push(i);
		}
		initDimensions(datasetName, output);
	  };

	  $.ajax({
		url: my.config.endpoint + datasetName + '/model.json',
		dataType: 'json',
		success: handler
	  });
	};

	if(useControls()) {
	  getDimensions(my.config.dataset);
	}
	
    function initDimensions(dataset, dimensions) {
      my.dataset = dataset;

	  var menuItem = function() {
        var tselect = $('<select />');
        tselect.append($('<option />').attr('value', '').html(''));
        $.each(dimensions, function(idx, item) {
		  tselect.append($('<option />').attr('value', item).html(item));
        });
		return tselect
	  };

      $.each([1,2,3], function(idx, item) {
        $drilldownList.append($('<li />').append(menuItem()));
      });
	  $breakdownAnchor.append($('<li />').append(menuItem()));

      $explorer.find('button').click(function(e) {
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
    $.each(my.$drilldown.find('select option:selected'), function(idx, item) {
      var _dim = $(item).text();
      // ignore the empty string
      if (_dim) {
        vals.push(_dim);
      }
    });
    vals = _.uniq(vals);
	my.config.aggregator.breakdown = my.$breakdown.find('select option:selected').text();
    my.config.aggregator.drilldowns = vals;
    if (my.config.aggregator.drilldowns.length > 0) {
      my.renderTree(my.containerId);
    }
  };

  var getBreakdowns = function(dataset, breakdownField, handler) {
	$.ajax({
	  url: my.config.endpoint + 'api/2/aggregate',
	  data: {
		'dataset': dataset,
		'drilldown': breakdownField
	  },
	  dataType: 'json',
	  success: handler
	});
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
		var saturation = 0.5;
		var value = 0.95;

		var breakdownStyles = function(data) {
          var extractStyle = function(i) { return i[my.config.aggregator.breakdown].name; };

		  if (data.hasOwnProperty('drilldown')) {
			breakdowns = data.drilldown.map(extractStyle);
			for (var i=0, len=breakdowns.length; i < len; i++) {
			  var hue = i / len * 360;
		      bubbleStyles.name[breakdowns[i]] = { 
				color: vis4color.fromHSV(hue, saturation, value, "hsv").x 
			  };
			}
          }
	    };
	
		getBreakdowns(my.config.dataset, my.config.aggregator.breakdown, 
					  breakdownStyles);

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
	  if(useControls()) {
		showControls();
	  }
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
        <!-- <div id="controls-year"> \
          <h3>Year: <span id="year">2009</span></h3> \
          <div id="yearslider"></div> \
          <div id="year-range"></div> \
        </div> --> \
        <div id="controls-drilldown"> \
          <h3>Drill down by</h3> \
          <ol id="drilldown-list"> \
          </ol> \
        </div> \
        <div id="controls-breakdown"> \
          <h3>Break down by</h3> \
          <ol id="breakdown-list"> \
          </ol> \
        </div> \
        <button>Redraw</button> \
      </div> \
      <div class="loading"></div> \
      <div class="bubbletree-wrapper"> \
        <div class="bubbletree"></div> \
      </div> \
    </div> \
  ';

  return my;
};

