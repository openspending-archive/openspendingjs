
initModelEditor = function($, config) {
  var $modelEditor = $(config.editorSelector);
  var fallbackHook = config.fallbackSelector;

  var setupACECallback = function(me) {
	$(fallbackHook).change(function () {
	  me.data = JSON.parse($(this).val());
	  $modelEditor.trigger('modelChange');
	});
  };

  var runDimensionEditor = function(analysis, mapping) {
	var columns = analysis.columns; // FIXME: might be absent

	config = { columns: columns,
			   getEditor: findEditor,
			   mapping: mapping,
			   analysis: analysis
			 };
	$modelEditor.modelEditor(config);
	
	var me = $modelEditor.data('modelEditor');
	setupACECallback(me);
  };

  var getMapping = function(analysis) {

	$.ajax({
	  url: '/' + config.dataset + '/model.json',
	  dataType: 'json',
	  success: function(modelJs) { 
		return runDimensionEditor(analysis, modelJs.mapping); 
	  }
	});
  };

  $.ajax({
	url: '/' + config.dataset + '/sources/' + config.source + '/analysis.json',
	dataType: 'json',
	success: getMapping
  });

};
