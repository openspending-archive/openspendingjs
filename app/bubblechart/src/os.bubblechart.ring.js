/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings */

/*
 * represents a ring
 */
OpenSpendings.BubbleChart.Ring = function(bc, o, attr, rad) {
	this.rad = rad;
	this.bubblechart = bc;
	this.attr = attr;
	this.origin = o;
	
	this.init = function() {
		var o = this.origin;
		this.circle = this.bubblechart.paper.circle(o.x, o.y, this.rad).attr(this.attr);
	};
	
	this.draw = function() {
		var o = this.origin;
		this.circle.attr({ cx: o.x, cy: o.y, r: this.rad });
	};
	
	/*
	 * removes all raphael nodes from stage
	 */
	this.remove = function() {
		var me = this;
		me.circle.remove();
	};
	
	/*
	 * wrapper for raphaels toBack() function which moves an element to the background
	 */ 
	this.toBack = function() {
		var me = this;
		me.circle.toBack();
	};
	
	this.init();
};