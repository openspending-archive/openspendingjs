/*!
 * OpenSpendings BubbleChart 0.1
 *
 * Copyright (c) 2011 Gregor Aisch (http://driven-by-data.net)
 * Licensed under the MIT license
 */
/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN */

var OpenSpendings = OpenSpendings ? OpenSpendings : {}; 

OpenSpendings.BubbleChart = function(container, dataUrl) {
	this.container = container;
	this.dataUrl = dataUrl;
	
	$(document).ready(function() {
		this.app = new OpenSpendings.BubbleChart.Main(this.container);
		this.app.loadData(this.dataUrl);
	}.bind(this));
	
};



OpenSpendings.BubbleChart.Vector = function(x,y) {
	this.x = x; this.y = y;
	
	this.length = function() {
		return Math.sqrt(this.x*this.x + this.y * this.y);
	};
	
	this.normalize = function(len) {
		if (!len) len = 1.0;
		var l = this.length();
		this.x *= len/l;
		this.y *= len/l;
	};
};


