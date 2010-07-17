// TODO: run this off a query param so you can do ?debug=1
// suggest copying this plugin code into debug.js
// http://ajaxcssblog.com/jquery/url-read-request-variables/ 
// Then we can do: var DEBUG = getQueryParams['debug'] || false
var DEBUG = false;
var _COLS = [ 'period', 'label', 'gdp', 'inflation', 'growth', 'receipts', 'expenditure', 'deficit' ];
var BudgetConfig = {
	models: [
		{
			'title': 'Model 1',
			'notes': 'pre-budget 2010',
			'columns': _COLS,
			'spreadsheet_feed_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od6/public/values?alt=json-in-script&callback=?',
			'spreadsheet_url': 'http://spreadsheets.google.com/ccc?key=0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc#gid=0'
		},
		{
			'title': 'Model 2',
			'notes': 'post-budget 2010',
			'columns': _COLS,
			'spreadsheet_feed_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od7/public/values?alt=json-in-script&callback=?',
			'spreadsheet_url': 'http://spreadsheets.google.com/ccc?key=0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc#gid=1'
		}
	]
};

if (DEBUG) {
	BudgetConfig.models[0].spreadsheet_url = 'json-budgetizer-1.js';
	BudgetConfig.models[1].spreadsheet_url = 'json-budgetizer-2.js';
}

