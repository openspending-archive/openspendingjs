var page_load = true;

// GET PARAMETER FUNCTIONS
function getViewName() {
    var sPath = window.location.pathname;
    var sPage = sPath.substring(sPath.lastIndexOf('/')+1);
    sPage = sPage.split(".")[0];
    if (sPage=="index") {
        sPage="uk-bubble-chart";
    }
    return sPage;
}

function getViewParameters() {
	var hash_url = window.location.hash;
	var get_params = {};
	if (hash_url) {
		hash_url = hash_url.substr(1);
		var params = hash_url.split("&");
		for (var i=0, len=params.length; i<len; ++i ){
			var p = params[i].split("=");
			get_params[p[0]] = p[1];
		}
	}
	return get_params;
}

// Called by the dashboard after basic initialisation is done
// 
function wdmmgInit() {
	//alert('wdmmgInit');
    var m = swfobject.getObjectById("wdmmg");
    m.removeHeader();
    m.removeFooter();
    m.disableUrls();
}

// Called by the dashboard when the user makes changes within the visualisation
// 
function wdmmgCallback(page, params) {
	//alert('wdmmgCallback');
    var uid = '';
    for (p in params) {
        uid = uid + p + "=" + params[p] + "&";
    }
    if (uid.charAt(uid.length-1)=="&") {
        uid = uid.slice(0, -1);
    }
    //alert(uid);
    if (page_load) {
        page_load = false;
        var m = swfobject.getObjectById("wdmmg");
	    m.changeView(getViewName(), getViewParameters());
    } else {
        window.location.hash = uid;
    }
}

// Changes the current dashboard view
//
function changeView(viewName, params) {
	//alert('changeView');
    var m = swfobject.getObjectById("wdmmg");
    m.changeView(viewName, params);
}