/*!
 * OpenSpendings BubbleChart 0.1
 *
 * Copyright (c) 2011 Gregor Aisch (http://driven-by-data.net)
 * Licensed under the MIT license
 */
/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN */

var OpenSpendings = OpenSpendings ? OpenSpendings : {}; 

OpenSpendings.BubbleChart = function(container, urlOrTree, hoverCallback, unhoverCallback) {
	var me = this;
	me.container = container;
	me.urlOrTree = urlOrTree;
	me.hoverCallback = hoverCallback;
	me.unhoverCallback = unhoverCallback;
		
	//$(document).ready(function() {
		me.app = new OpenSpendings.BubbleChart.Main(me.container, me.hoverCallback, me.unhoverCallback);
		if (typeof(me.urlOrTree) == "string") {
			me.app.loadData(me.urlOrTree);
		} else {
			me.app.setData(me.urlOrTree);
		}
	//}.bind(this));
	
};



OpenSpendings.BubbleChart.Vector = function(x,y) {
	var me = this;
	me.x = x; 
	me.y = y;
	
	/*
	 * calculates the length of the vector
	 */
	this.length = function() {
		var me = this;
		return Math.sqrt(me.x*me.x + me.y * me.y);
	};
	
	/*
	 * changes the length of the vector
	 */
	this.normalize = function(len) {
		var me = this, l = me.length();
		if (!len) len = 1.0;
		me.x *= len/l;
		me.y *= len/l;
	};
	
	/*
	 * creates an exact copy of this vector
	 */
	this.clone = function() {
		var me = this;
		return new OpenSpendings.BubbleChart.Vector(me.x, me.y);
	};
};


