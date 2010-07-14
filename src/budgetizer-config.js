var DEBUG = true;
var BudgetConfig = {
	models: [
		{
			'title': 'Default setup',
			'spreadsheet_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od6/public/values?alt=json-in-script&callback=?',
		},
		{
			'title': 'Sheet 2',
			'spreadsheet_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od7/public/values?alt=json-in-script&callback=?',
		}
	]
};

if (DEBUG) {
	BudgetConfig.models[0].spreadsheet_url = 'json-budgetizer-1.js';
	BudgetConfig.models[1].spreadsheet_url = 'json-budgetizer-2.js';
}

