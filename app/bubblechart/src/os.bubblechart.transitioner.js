/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings, vis4 */

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
	
	var me = this;
	
	me.running = false;
	
	me.changeLayout = function(layout) {
		var i, o, props, p, me = this;
		me.running = true;
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
			if (o.removable) {
				if (me.garbage.length === 0) {
					// at least one tween should trigger the gc
					tween.onComplete(me.collectGarbage.bind(me));
				}
				me.garbage.push(o);
			}
			if (i == layout.objects.length-1) tween.onComplete(me._completed.bind(me));
			tween.start();
		}
	};
	
	me.garbage = [];
	
	/*
	 * calls the remove() function on every object marked for
	 * removal. will run right after the tween ends
	 */
	me.collectGarbage = function() {
		vis4.log('collecting garbage', this.garbage);
		var i, o, me = this;
		for (i in me.garbage) {
			o = me.garbage[i];
			if ($.isFunction(o.remove)) o.remove();
		}
		me.garbage = [];
	};
	
	me.completeCallbacks = [];
	
	me.onComplete = function(callback) {
		if ($.isFunction(callback)) me.completeCallbacks.push(callback);
	};
	
	me._completed = function() {
		vis4.log('AnimatedTransition: onComplete');
		var me = this, callbacks = me.completeCallbacks, i;
		me.running = false;
		for (i in callbacks) {
			callbacks[i]();
		}
	};
	
};