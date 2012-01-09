
initModelEditor = function($, config) {
  var $modelEditor = $(config.editorSelector);
  var fallbackHook = config.fallbackSelector;
  var namesHook = config.namesHook;

  var setupACECallback = function(me) {
	$(fallbackHook).change(function () {
	  me.data = JSON.parse($(this).val());
	  $modelEditor.trigger('modelChange');
	});
  };

  var runDimensionEditor = function(analysis) {
	var columns = analysis.columns; // FIXME: might be absent

	config = { columns: columns,
			   getEditor: function () { return null; },
               target: fallbackHook,
               namesHook: namesHook
			 };
	$modelEditor.modelEditor(config);
	
	var me = $modelEditor.data('modelEditor');
	//setupACECallback(me);
  };

  $.ajax({
	url: '/' + config.dataset + '/sources/' + config.source + '/analysis.json',
	dataType: 'json',
	success: runDimensionEditor
  });

};
