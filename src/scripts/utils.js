var DEBUG;

function debug(message) {
	var console = window['console'];
	if (console && console.log) {
	console.log(message);
	}
}

function numberAsString(num) {
	var billion = 1000000000;
	var million = 1000000;
	var thousand = 1000; 
	if (num > billion) {
		return num / billion + 'bn';
	}
	if (num > (million/2)) {
		return num/million + 'm';
	}
	if (num > thousand) {
		return num/thousand + 'k';
	} else {
		return num; 
	}
}

/*
	Parse a URL query string (?xyz=abc...) into a dictionary.
*/
function parseQueryString() {
	var q = arguments.length > 0 ? arguments[0] : window.location.search.substring(1);
	var urlParams = {},
		e,
		d = function (s) { return unescape(s.replace(/\+/g, " ")); },
		r = /([^&=]+)=?([^&]*)/g;

	while (e = r.exec(q)) {
		urlParams[d(e[1])] = d(e[2]);
	}
	return urlParams;
}

