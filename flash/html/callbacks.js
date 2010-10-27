var WDMMG = WDMMG || {};
WDMMG.dashboard = {};
WDMMG.dashboard.helperFileLocation = '/_dashboard'; // Assumed to be an absolute path.

(function (d) {
	var $ = jQuery.noConflict();
	// Init: set up dashboard.
	d.init = function () {
		if (d.helperFileLocation) {
			d.helperFileLocation = 'http://' + document.domain + d.helperFileLocation;
		} else {
			d.helperFileLocation = d.currentLocation();
		}

		d.swf = swfobject.getObjectById("wdmmg");

		d.swf.removeHeader();
		d.swf.removeFooter();
		d.swf.disableUrls();

		d.$menu         = $('#dashboard-menu');
		d.$title        = $('#dashboard-title');
		d.$intro        = $('#dashboard-intro');

		d.$menu.find('a').click(function () {
			d.changeView(this.id);
			return false;
		});
	};

	// Choose view from URL params, if available.
	d.ready = function () {
		var urlParams = getViewParameters();
		var viewName = urlParams.view;

		delete urlParams.view;

		d.changeView(viewName || "uk-bubble-chart", urlParams);
	}

	// Change view and update navigation, title.
	d.changeView = function (viewName, params) {
		d.$menu
			.find('a').removeClass('active').end()
			.find('a#' + viewName).addClass('active');

		// Set title text to the same as the inner text of the button.
		d.$title.text( d.$menu.find('.active').text() );
		d.introText( d.$menu.find('.active')[0].id );

		params = params || {};

		d.swf.changeView(viewName, params);
		d.updateEmbed($.param(params));
	};

	d.currentLocation = function () {
		var loc = window.location.href;

		var qs = loc.indexOf("?");
		if (qs !== -1) {
			loc = loc.slice(0, qs);
		}

		var hs = loc.indexOf("#");
		if (hs !== -1) {
			loc = loc.slice(0, hs);
		}

		if (loc.slice(-1) === "/") {
			loc = loc.slice(0,-1);
		}

		return loc;
	}

	// Called when visualisation parameters change.
	d.visCallback = function (page, params) {
		params.view = page;
		var uid = $.param(params);

		window.location.hash = uid;
		d.updateEmbed(uid);

		//reload iframe with comments
		$('#commentframe').attr('src', d.helperFileLocation + "/comments.html?" + uid);
	};

	d.updateEmbed = function (uid) {
		$('#iframecode').val("<iframe src='" + d.helperFileLocation
		                     + "/iframe.html#" + uid
		                     + "' height='600' width='1000'></iframe>");
	}

	d.adjustIframeHeight = function() {
		var $cf = $('#commentframe');
		$cf.height('300px')
		   .height(($cf[0].scrollHeight + 10).toString() + "px");
	};

	d.introText = function(id) {
		var text = $($('script[type=text/dashboard-intro]#dashboard-intro-'+id)[0]).text() || '';		
		$(d.$intro[0])[0].innerHTML = text;
	};

})(WDMMG.dashboard);

// For temporary backwards compatibility, bring these functions into the
// global namespace;
var changeView         = WDMMG.dashboard.changeView;
var wdmmgInit          = WDMMG.dashboard.init;
var wdmmgReady         = WDMMG.dashboard.ready;
var wdmmgCallback      = WDMMG.dashboard.visCallback;
var adjustIframeHeight = WDMMG.dashboard.adjustIframeHeight;

// Get URL parameters:
// - works for hash urls and querystrings
function getViewParameters() {
	var location = window.location.href;
	var query_string = '';

	if (location.indexOf("?") > -1) {
		query_string = location.substr(location.indexOf("?")).toLowerCase();
	} else if (location.indexOf("#") > -1) {
		query_string = window.location.hash;
	}

	var get_params = {};

	if (query_string) {
		query_string = query_string.substr(1);
		var params = query_string.split("&");

		for (var i=0, len=params.length; i<len; ++i){
			var p = params[i].split("=");
			get_params[p[0]] = p[1];
		}
	}

	return get_params;
}

