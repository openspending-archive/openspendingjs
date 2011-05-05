/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings */

/*
 * represents a bubble
 */
OpenSpendings.BubbleChart.Bubble = function(node, bubblechart, origin, radius, angle, colour) {

	var utils = OpenSpendings.BubbleChart.Utils, me = this;
	me.node = node;
	me.paper = bubblechart.paper;
	me.origin = origin;
	me.bc = bubblechart;
	me.rad = radius;
	me.angle = angle;
	me.colour = colour;
	me.dirty = true;
	me.bubbleRad = utils.amount2rad(this.node.amount);
	
	/*
	 * convertes polar coordinates to x,y
	 */
	this.getXY = function() {
		var me = this, o = me.origin, a = me.angle, r = me.rad;
		me.pos.x = o.x + Math.cos(a) * r;
		me.pos.y = o.y - Math.sin(a) * r;
	};
	
	this.init = function() {
		var me = this;
		me.pos = new OpenSpendings.BubbleChart.Vector(0,0);
		me.getXY();
		me.circle = me.paper.circle(me.pos.x, me.pos.y, me.bubbleRad * me.bc.bubbleScale)
			.attr({ stroke: false, fill: me.colour });
		me.dirty = false;
		$(me.circle.node).click(me.onclick.bind(me));
		$(me.circle.node).css({ cursor: 'pointer'});
		
		var showIcon = false; //this.bubbleRad * this.bc.bubbleScale > 30;
		// create label
		/*this.label = me.paper.text(me.pos.x, me.pos.y + (showIcon ? me.bubbleRad * 0.4: 0), utils.formatNumber(me.node.amount)+'\n'+me.node.label)
			.attr({ 'font-family': 'Graublau,Georgia,serif', fill: '#fff', 'font-size': Math.max(4, me.bubbleRad * me.bc.bubbleScale * 0.25) });
		*/
		me.label = $('<div class="label"><div class="amount">'+utils.formatNumber(me.node.amount)+'</div><div class="desc">'+me.node.label+'</div></div>');
		$('#bubble-chart').append(me.label);
		
		if (showIcon) {
			me.icon = me.paper.path("M17.081,4.065V3.137c0,0,0.104-0.872-0.881-0.872c-0.928,0-0.891,0.9-0.891,0.9v0.9C4.572,3.925,2.672,15.783,2.672,15.783c1.237-2.98,4.462-2.755,4.462-2.755c4.05,0,4.481,2.681,4.481,2.681c0.984-2.953,4.547-2.662,4.547-2.662c3.769,0,4.509,2.719,4.509,2.719s0.787-2.812,4.557-2.756c3.262,0,4.443,2.7,4.443,2.7v-0.058C29.672,4.348,17.081,4.065,17.081,4.065zM15.328,24.793c0,1.744-1.8,1.801-1.8,1.801c-1.885,0-1.8-1.801-1.8-1.801s0.028-0.928-0.872-0.928c-0.9,0-0.957,0.9-0.957,0.9c0,3.628,3.6,3.572,3.6,3.572c3.6,0,3.572-3.545,3.572-3.545V13.966h-1.744V24.793z")
				.translate(me.pos.x, me.pos.y).attr({fill: "#fff", stroke: "none"});
		}
		me.initialized = true;
	};
	
	this.onclick = function(e) {
		var me = this;
		me.bc.changeView(me.node.id);
	};
	
	this.draw = function() {
		var me = this, r= me.bubbleRad * me.bc.bubbleScale, ox = me.pos.x, oy = me.pos.y, devnull = me.getXY();
		me.circle.attr({ cx: me.pos.x, cy: me.pos.y, r: r });
		//me.label.attr({ x: me.pos.x, y: me.pos.y, 'font-size': Math.max(4, me.bubbleRad * me.bc.bubbleScale * 0.25) });
		me.label.css({ width: 2*r+'px' });
		
		me.label.css({ left: (me.pos.x-r)+'px', top: (me.pos.y-me.label.height()*0.5)+'px' });
		if (me.icon) me.icon.translate(me.pos.x - ox, me.pos.y - oy);
	};
	
	this.remove = function() {
		var me = this;
		me.circle.remove();
		me.label.remove();
		//$('#bubble-chart')
		me.initialized = false;
		if (me.icon) me.icon.remove();
	};
	
	this.init();
};