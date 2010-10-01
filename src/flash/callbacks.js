var view_name = '';

//////////////////////////////////////////////////////////////
// Get URL parameters: view name and view parameters
//////////////////////////////////////////////////////////////
function getViewName() {
    var sPath = window.location.pathname;
    var sPage = sPath.substring(sPath.lastIndexOf('/')+1);
    sPage = sPage.split(".")[0];
    if ((sPage=="index") || (sPage=="")) {
        sPage="uk-bubble-chart";
    }
    view_name = sPage;
    //alert('getViewName: ' + view_name);
    return sPage;
}

// works for hash urls and querystrings
function getViewParameters() {
	//alert('getViewParameters');
	var location = window.location.href;
    var query_string = '';
    if (location.indexOf("?") > -1) {
	   query_string = location.substr(location.indexOf("?")).toLowerCase();
	   //alert(query_string);
    } else if (location.indexOf("#") > -1) {
		query_string = window.location.hash;	
	}
    //alert(query_string);
	var get_params = {};
	if (query_string) {
		query_string = query_string.substr(1);
		var params = query_string.split("&");
		for (var i=0, len=params.length; i<len; ++i ){
			var p = params[i].split("=");
			get_params[p[0]] = p[1];
		}
	}
	//alert('params' + get_params.toSource());
	return get_params;
}

function paramsToString(params) {
	var url_string = '';
    for (p in params) {
        url_string = url_string + p + "=" + params[p] + "&";
    }
    if (url_string.charAt(url_string.length-1)=="&") {
        url_string = url_string.slice(0, -1);
    }
    return url_string;	
}

//////////////////////////////////////////////////////////////
// Called by the dashboard after basic initialisation is done
// Sets display options
//////////////////////////////////////////////////////////////
function wdmmgInit() {
	//alert('wdmmgInit');
    var m = swfobject.getObjectById("wdmmg");
    m.removeHeader();
    m.removeFooter();
    m.disableUrls();
}

//////////////////////////////////////////////////////////////
// Get URL parameters and change view accordingly
//////////////////////////////////////////////////////////////
function wdmmgReady() {
    var m = swfobject.getObjectById("wdmmg");
    var url_params = getViewParameters();
    // alert showing params picked up from URL 
    //alert("wdmmgReady, got following params from URL: " + url_params.toSource())
    changeView(getViewName(), url_params);
	//changeView("uk-bubble-chart", {'focus':'01'});
	//changeView("daily-bread", {'interesting':['01', '02', '03.x', '06.1', '08.2', 'foo']});
}

//////////////////////////////////////////////////////////////
// Called by the dashboard when the user makes changes in the visualisation
// Writes parameters to URL location.hash
//////////////////////////////////////////////////////////////
function wdmmgCallback(page, params) {
	//alert showing the parameter object passed to wdmmgCallback
    //alert("wdmmgCallback, passed the following params: " + params.toSource());
    var uid = paramsToString(params);
    window.location.hash = uid;
    //reload iframe with comments
    document.getElementById('commentframe').src = "comments.html?" + uid + "&view=" + view_name;
    document.getElementById('commentframe').height = document.getElementById('commentframe').contentWindow.document.body.scrollHeight + "px";
}

//////////////////////////////////////////////////////////////
// Changes the current dashboard view
//////////////////////////////////////////////////////////////
function changeView(viewName, params) {
	//alert showing the parameter object passed to changeView
	//alert("changeView, passed the following params: " + params.toSource());
    var m = swfobject.getObjectById("wdmmg");
    m.changeView(viewName, params);

}