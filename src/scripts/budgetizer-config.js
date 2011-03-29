// TODO: run this off a query param so you can do ?debug=1
// suggest copying this plugin code into debug.js
// http://ajaxcssblog.com/jquery/url-read-request-variables/ 
// Then we can do: var DEBUG = getQueryParams['debug'] || false
var DEBUG = false;
// timeseries to load from google and display in tables
var _COLS = [ 'period', 'label', 'gdp', 'inflation', 'growth', 'receipts', 'expenditure', 'borrowing', 'deficit', 'deficitpgdp'];
// data types of timeseries (this information does not seem to be passed from google)
var ColTypes=[];
ColTypes['period']='range';
ColTypes['inflation']='percent';
ColTypes['growth']='percent';
ColTypes['deficitpgdp']='percent';
// timeseries to be plotted
var ColDisplay = ['gdp','receipts','expenditure','borrowing','deficit','deficitpgdp','growth','inflation'];
var DisplayNames=[];
DisplayNames['period']='Period';
DisplayNames['label']='Status';
DisplayNames['gdp']='GDP';
DisplayNames['receipts']='Receipts';
DisplayNames['expenditure']='Expenditure';
DisplayNames['borrowing']='Deficit';
DisplayNames['deficit']='Debt';
DisplayNames['deficitpgdp']='Debt/GDP (%)';
DisplayNames['growth']='Growth (%)';
DisplayNames['inflation']='Inflation (%)';
var ColDisplayTypes=[];
ColDisplayTypes['growth']=2;
ColDisplayTypes['inflation']=2;
ColDisplayTypes['deficitpgdp']=2;
// number of alternative models to be loaded
var ExpectedResponses=5;
var BudgetConfig = {
	models: [
		{
			'title': 'Model 5',
			'notes': '2011 March pre-budget',
			'columns': _COLS,
			'spreadsheet_feed_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od8/public/values?alt=json-in-script&callback=?',
			'spreadsheet_url': 'http://spreadsheets.google.com/ccc?key=0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc#gid=6'
		},
		{
			'title': 'Model 4',
			'notes': '2010 November statement',
			'columns': _COLS,
			'spreadsheet_feed_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/odb/public/values?alt=json-in-script&callback=?',
			'spreadsheet_url': 'http://spreadsheets.google.com/ccc?key=0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc#gid=5'
		},
		{
			'title': 'Model 3',
			'notes': '2010 June post-budget',
			'columns': _COLS,
			'spreadsheet_feed_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od7/public/values?alt=json-in-script&callback=?',
			'spreadsheet_url': 'http://spreadsheets.google.com/ccc?key=0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc#gid=1'
		},
		{
			'title': 'Model 2',
			'notes': '2010 June pre-budget',
			'columns': _COLS,
			'spreadsheet_feed_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od6/public/values?alt=json-in-script&callback=?',
			'spreadsheet_url': 'http://spreadsheets.google.com/ccc?key=0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc#gid=0'
		},
		{
			'title': 'Model 1',
			'notes': '2008 August',
			'columns': _COLS,
			'spreadsheet_feed_url': 'http://spreadsheets.google.com/feeds/list/0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc/od5/public/values?alt=json-in-script&callback=?',
			'spreadsheet_url': 'http://spreadsheets.google.com/ccc?key=0AjRWhOOrlkGIdEZnZ000Tk5qYTlyU3pVZF9xUVR2OXc#gid=2'
		},
	]
};

if (DEBUG) {
	BudgetConfig.models[0].spreadsheet_url = 'json-budgetizer-1.js';
	BudgetConfig.models[1].spreadsheet_url = 'json-budgetizer-2.js';
	BudgetConfig.models[2].spreadsheet_url = 'json-budgetizer-3.js';
	BudgetConfig.models[3].spreadsheet_url = 'json-budgetizer-4.js';
}

