/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings */

/*
 * stores visual attributes of all elements in the visualization
 * 
 */
OpenSpendings.BubbleChart.Layout = function() {

	this.objects = [];
	this.props = [];
	
	/*
	 * flare-style transitioner syntax
	 *
	 * if you have an object bubble, you can easily change its properties with
	 * 
	 * var l = new OpenSpendings.BubbleChart.Layout();
	 * l.$(bubble).radius = 30;
	 * l.$(bubble).angle = 3.14;
	 */
	this.$ = function(obj) {
		for (var i in this.objects) {
			var o = this.objects[i];
			if (o == obj) return this.props[i];
		}
		this.objects.push(obj);
		var p = {};
		this.props.push(p);
		return p;
	};
	
};