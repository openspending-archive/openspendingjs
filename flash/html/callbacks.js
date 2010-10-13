var view_name = '';
var helper_file_location = '/html'; //change this dependent on server settings

var viewnames = {};
viewnames['daily-bread'] = 'My Daily Bread';
viewnames['uk-bubble-chart'] = "UK government spending";
viewnames['long-term'] = "Long-term spending";
viewnames['regional-overview'] = "Regional spending";
viewnames['comparatron-a'] = "Comparison by region";

function updateTitle(view_name) {
	//alert('updateTitle: ' + viewnames[view_name]);
	if (document.getElementById("viewtitle")!=null) {
        document.getElementById("viewtitle").innerHTML = viewnames[view_name];
    }
}

function updateMenu(view_name) {
	alert('updateMenu');
	var list_items = document.getElementById('flash-menu').getElementsByTagName('a')
    for (var i=0, j=list_items.length; i<j; i++){
        var elm = list_items[i];
        if (elm.className) {
            elm.className = elm.className.replace(/\bactive\b/, '');
        }
    }
	document.getElementById(view_name).className += " active";
}

function loadView(view_name) {
	// TODO: change css class dynamically
    var params = {};
    changeView(view_name, params);	
    updateTitle(view_name);
    updateMenu(view_name);
}

//////////////////////////////////////////////////////////////
// Get URL parameters: view name and view parameters
//////////////////////////////////////////////////////////////

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
	var view_name = url_params.view;
	delete url_params.view;
    //alert("wdmmgReady, got following params from URL: " + url_params.toSource())
    if (view_name==null) {
	    view_name = "uk-bubble-chart";
    }
    updateTitle(view_name);
    updateMenu(view_name);
    changeView(view_name, url_params);
	//changeView("daily-bread", {'interesting':['01', '02', '03.x', '06.1', '08.2', 'foo']});
}

//////////////////////////////////////////////////////////////
// Called by the dashboard when the user makes changes in the visualisation
// Writes parameters to URL location.hash
//////////////////////////////////////////////////////////////
function wdmmgCallback(page, params) {
	//alert showing the parameter object passed to wdmmgCallback
    //alert("wdmmgCallback, passed the following params: " + params.toSource());
    params.view = page;
    var uid = paramsToString(params);
    window.location.hash = uid;
    //reload iframe with comments
	if (document.getElementById("commentframe")!=null) {
        document.getElementById('commentframe').src = helper_file_location + "/comments.html?" + uid;
    }
    updateEmbed(uid);
    //document.getElementById('commentframe').height = document.getElementById('commentframe').contentWindow.document.body.scrollHeight + "px";
}

function updateEmbed(uid) {
    var iframecode = document.getElementById('iframecode');
    if (iframecode!=null) {
	    iframecode.value = "<iframe src='http://" + document.domain;
        iframecode.value += helper_file_location + "/iframe.html#" + uid;
        iframecode.value += "' height='600' width='1000'></iframe>";
    }
}

function adjustIframeHeight() {
    var commentframe = document.getElementById('commentframe');
    if (commentframe!=null) {
        commentframe.style.height = '300px';
		//alert("adjustIframeHeight " + (commentframe.scrollHeight + 10).toString());
        commentframe.style.height = (commentframe.scrollHeight + 10).toString() + "px";
    }
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