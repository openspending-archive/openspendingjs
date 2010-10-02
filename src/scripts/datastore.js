(function() {
/*
	Abstract the WDMMG data store (accessed via its api).
*/

// TODO: move this somewhere common for all code
this.WDMMG = {};

this.WDMMG.datastore = {
	config: {
		dataStoreApi: 'http://data.wheredoesmymoneygo.org/api',
	},

	'breakdown': {
	},
	'keys': {
	},

	loadData: function(breakdownIdentifier, callback) {
		if (DEBUG) {
			this.breakdown[breakdownIdentifier] = dept_region;
			this.keys['from'] = key_from['enumeration_values'];
			this.keys['region'] = key_region['enumeration_values'];
			callback();
		} else {
			var api_url = this.config.dataStoreApi + '/aggregate?' + breakdownIdentifier + '&callback=?';
			$.getJSON(api_url, function(data) {
				this.breakdown[breakdownIdentifier] = data;
				// need to do work to ensure we only call render after *all* data loaded
				var done = 2; // number of total requests
				$.each(data.metadata.axes, function(i,key) {
					var api_url = this.config.dataStoreApi + '/rest/key/' + key + '?callback=?';
					$.getJSON(api_url, function(data) {
						this.keys[key] = data['enumeration_values'];
						done -= 1;
						if(done == 0) {
							callback();
						}
					});
				});
			});
		}
	}
};

})();
