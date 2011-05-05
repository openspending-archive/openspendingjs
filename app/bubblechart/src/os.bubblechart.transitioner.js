/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings */

/*
 * transforms the current display to a new layout
 * while transitioning, there are several possible cases:
 * - a node exists both before and after the transition
 * - a node appears at the beginning of the transition
 * - a node disappears at the end of the transtion
 */
OpenSpendings.BubbleChart.SimpleTransitioner = function() {
	
	this.changeLayout = function(layout) {

		var i, o, props, p;
		for (i in layout.objects) {
			o = layout.objects[i];
			if (o === undefined || o === null) continue;
			props = layout.props[i];
			for (p in props) {
				o[p] = props[p];
			}
			if ($.isFunction(o.draw)) o.draw();
		}
	};
	
};

OpenSpendings.BubbleChart.AnimatedTransitioner = function() {
	
	this.changeLayout = function(layout) {

		var i, o, props, p;
		for (i in layout.objects) {
			o = layout.objects[i];
			if (o === undefined || o === null) continue;
			props = layout.props[i];
			
			var tween = new TWEEN.Tween(o), toProps = {};
			
			for (p in props) {
				//o[p] = props[p];
				toProps[p] = props[p];
			}
			tween.to(toProps, 1000);
			if ($.isFunction(o.draw)) tween.onUpdate(o.draw.bind(o));
			tween.easing(TWEEN.Easing.Exponential.EaseOut);
			tween.start();
		}
	};
	
};