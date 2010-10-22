
// Called by the dashboard after basic initialisation is done.
// 
function wdmmgInit() {
	var m = swfobject.getObjectById("wdmmg");
	//m.removeHeader();
	//m.removeFooter();
	//m.disableUrls();
}


// Called by the dashboard when it's fully initialised
//
function wdmmgReady() {
	//changeView("uk-bubble-chart", {'focus':'01'});
	//changeView("daily-bread", {'income':'25000', 'code':'10', 'interesting':['01', '02', '03.x', '06.1', '08.2', 'foo']});
	//changeView("comparatron-a", {'region1':'Scotland', 'region2':'London', 'spending':'per_capita', 'year':'2008-2009'});
}


// Called when the user wants to show more information, but the
// visualisation infobox popup is disabled
//
function wdmmgInfobox(code, classificationName, link) {
	//alert(code+":"+classificationName+":"+link);
}


// Called by the dashboard for extra help information
//
function wdmmgHelp(id, params) {
	//alert(id);
}


// Called by the dashboard when the user makes changes within the visualisation
// 
function wdmmgCallback(page, params) {
	var txt = 'Page:' + page + "\n";
	var p;
	for (p in params) {
		txt = txt + "param:" + p + ", " + params[p] + "\n";
	}
	//alert(txt);
}


// Changes the current dashboard view
//
function changeView(viewName, params) {
	var m = swfobject.getObjectById("wdmmg");
	m.changeView(viewName, params)
}
