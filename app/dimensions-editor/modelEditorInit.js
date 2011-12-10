
initModelEditor = function($, config) {
  var $modelEditor = $(config.editorSelector);
  var fallbackHook = config.fallbackSelector;

  var setupACECallback = function(me) {
	$(fallbackHook).change(function () {
	  me.data = JSON.parse($(this).val());
	  $modelEditor.trigger('modelChange');
	});
  };

  var runDimensionEditor = function(columns, mapping) {
	config = { columns: columns,
			   getEditor: findEditor,
			   mapping: mapping
			 };
	$modelEditor.modelEditor(config);
	
	var me = $modelEditor.data('modelEditor');
	setupACECallback(me);
  };

  var getMapping = function(data) {
	var columns = data.columns; // FIXME: might be absent

	$.ajax({
	  url: '/' + config.dataset + '/model.json',
	  dataType: 'json',
	  success: function(modelJs) { 
		return runDimensionEditor(columns, modelJs.mapping); 
	  }
	});
  };

  $.ajax({
	url: '/' + config.dataset + '/sources/' + config.source + '/analysis.json',
	dataType: 'json',
	success: getMapping
  });

};
