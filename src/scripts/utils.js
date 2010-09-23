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

