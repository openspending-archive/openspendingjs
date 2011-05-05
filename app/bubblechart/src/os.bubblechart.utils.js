/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings */

OpenSpendings.BubbleChart.Utils = {};

OpenSpendings.BubbleChart.Utils.log = function() {
	try {
		if (window.hasOwnProperty('console')) console.log.apply(this, arguments);
	} catch (e) {}	
};

OpenSpendings.BubbleChart.Utils.amount2rad = function(a) {
	return Math.pow(a/150000000, 0.6);
};

OpenSpendings.BubbleChart.Utils.formatNumber = function(n) {
	if (n >= 1000000000000) return Math.round(n / 100000000000)/10 + 't';
	if (n >= 1000000000) return Math.round(n / 100000000)/10 + 'b';
	if (n >= 1000000) return Math.round(n / 100000)/10 + 'm';
	else return n;
	
};
