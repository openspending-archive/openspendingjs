
/*!
 * OpenSpendings BubbleChart 0.1
 *
 * Copyright (c) 2011 Gregor Aisch (http://driven-by-data.net)
 * Licensed under the MIT license
 */

/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN */
/*
 * bootstrap class
 */
var OSBubbleChart = function(container, dataUrl) {
	this.container = container;
	this.dataUrl = dataUrl;
	
	$(document).ready(function() {
		this.app = new OSBubbleChart.Main(this.container);
		this.app.loadData(this.dataUrl);
	}.bind(this));
};

OSBubbleChart.amount2rad = function(a) {
	return Math.pow(a/2700000000, 0.6);
};

/*
 * is constructed after the container page has been loaded
 */
OSBubbleChart.Main = function(container) {
	// init the page content (create divs, init Raphael paper etc)
	// load the data, url should be provided 
	// init the bubbles
	
	this.$container = $(container);	
	
	/*
	 * rotation angle for the complete chart
	 */
	this.rotation = 0;
	
	/*
	 * scale factor for bubble radii
	 */
	this.bubbleScale = 1.0;
	
	/*
	 * @public loadData
	 * 
	 */
	this.loadData = function(url) {
		$.ajax({
			url: url,
			dataType: 'json',
			success: this.dataLoaded.bind(this)
		});
	};
	
	this.dataLoaded = function(data) {
		console.log(data);
		this.initPaper();
		this.initTween();
		this.quickPrototype(data);
	};
	
	/*
	 * initializes all that RaphaelJS stuff
	 */
	this.initPaper = function() {
		var $c = this.$container,
			paper = Raphael($c[0], $c.width(), $c.height()),
			Vector = OSBubbleChart.Vector,
			origin = new Vector(paper.width * 0.5, paper.height * 0.5); // center
			
		this.paper = paper;
		this.origin = origin;
	};
	
	/*
	 * initializes the Tweening engine
	 */
	this.initTween = function() {
		
		this.tweenTimer = setInterval(this.loop, 1000/120);
		
	};
	
	this.quickPrototype = function(root) {
		
		var origin = this.origin, // center
			paper = this.paper,
			l1rad = paper.height * 0.30, // radius for level 1 nodes
			l2rad = paper.height * 0.45, // radius for level 2 nodes
			lcircAttrs = { stroke: '#ccc', 'stroke-dasharray': "- " },
			a2rad = OSBubbleChart.amount2rad,
			l1alpha = Math.PI * 2 / root.children.length;
			
		// level 1 circle
		
		
		this.l1Circ = new OSBubbleChart.Ring(this, lcircAttrs, l1rad);
		this.l2Circ = new OSBubbleChart.Ring(this, lcircAttrs, l2rad);
			
		this.rootCircle = new OSBubbleChart.Bubble(root, this, 0, 0, '#555555' );
			
		var l1a = 0, da1, i, j, ca1, col, l1radsum = 0, l2radsumt = 0;
		
		var _r = function(a) { return Math.round(Raphael.deg(a)*10)/10; };
		
		for (i in root.children) {
			for (j in root.children[i].children) {
				l2radsumt += a2rad(root.children[i].children[j].data.amount);
			}
		}
		
		//for (i in root.children) l1radsum += a2rad(root.children[i].data.amount);
		
		var cmpNodes = function(a,b) {
			if (a.data.amount == b.data.amount) return 0;
			return a.data.amount < b.data.amount ? -1 : 1;
		};
		
		this.innerRing = [];
		this.outerRing = [];
		this.innerLines = [];
		
		for (i in root.children) {
			
			var l2radsum = 0;
			var node = root.children[i];
			
			for (j in node.children) l2radsum += a2rad(node.children[j].data.amount);
			
			da1 = (l2radsum / l2radsumt) * Math.PI * 2;
			ca1 = l1a + da1*0.5;
			col = 'hsb('+(i/root.children.length)+',.8, .8)';
			
			this.innerRing.push(new OSBubbleChart.Bubble(node, this, l1rad, ca1, col));
			
			this.innerLines.push(new OSBubbleChart.Line(this, lcircAttrs, ca1, l1rad + a2rad(node.data.amount), l2rad));
			
			
			// cycle through level 2 children
			var l2a = l1a, da2, ca2;
			
			var old = node.children;
			
			old.sort(cmpNodes);
			
			node.children = [].concat(old.slice(0,old.length/2), old.slice(old.length/2).reverse());
			
			var tmp = da1 * 0.8;
			l2a += (da1 - tmp) * 0.5;
			
			for (j in node.children) {
				
				var subnode = node.children[j];
				console.log(j, subnode);
				da2 = (a2rad(subnode.data.amount) / l2radsum) * tmp; 
				console.log(j, _r(l2a), _r(da2));
				
				ca2 = l2a + da2 * 0.5;
				
				this.outerRing.push(new OSBubbleChart.Bubble(subnode, this, l2rad, ca2, col));

				l2a += da2;
			}
			
			l1a += da1;
		}
			
	};
	
	/*
	 * is called either by click on one of the bubbles
	 * or by url change (later)
	 */
	this.scrollTo = function(bubble) {
		var delta = -bubble.angle, i, b, outerRad, ox = this.paper.width * 0.5, 
			scale, innerRad, ease = TWEEN.Easing.Exponential.EaseOut;
		
		if (bubble == this.rootCircle) {
			innerRad = this.paper.height * 0.3;
			outerRad = this.paper.height * 0.45;
			scale = 1.0;
		} else if ($.inArray(bubble, this.innerRing)) {
			innerRad = this.paper.height * 0.6;
			outerRad = this.paper.height * 0.9;
			scale = 2.0;
			ox -= innerRad;
		} else {
			innerRad = this.paper.height * 0.5;
			outerRad = this.paper.height * 0.8;
			ox -= outerRad;
			scale = 3.0;
		}
		
		if (Math.abs(delta) > Math.PI) {
			delta += delta > 0 ? -Math.PI*2 : Math.PI*2;
		}
				
		new TWEEN.Tween(this.origin)
			.to({ x: ox }, 1000)
			.easing(ease)	
			.start();
		new TWEEN.Tween(this)
			.to({ bubbleScale: scale }, 1000)
			.easing(ease)	
			.start();
		new TWEEN.Tween(this.rootCircle) 
			.to({ foo: 1000 }, 1000)
			.onUpdate(this.rootCircle.draw.bind(this.rootCircle))
			.easing(ease)
			.start();
		
		for (i in this.innerRing) {
			b = this.innerRing[i];
			new TWEEN.Tween(b)
				.to({ angle: b.angle+delta, rad: innerRad }, 1000)
				.onUpdate(b.draw.bind(b))
				.easing(ease)
				.start();
			var l = this.innerLines[i];
			new TWEEN.Tween(l)
				.to({ angle: b.angle+delta, fromRad: innerRad + b.bubbleRad * scale, toRad: outerRad }, 1000)
				.onUpdate(l.draw.bind(l))
				.easing(ease)
				.start(); 
		}
		
		for (i in this.outerRing) {
			b = this.outerRing[i];
			new TWEEN.Tween(b)
				.to({ angle: b.angle+delta, rad: outerRad }, 1000)
				.onUpdate(b.draw.bind(b))
				.easing(ease)
				.start();
		}
		this.rotation += delta;
		
		new TWEEN.Tween(this.l1Circ)
			.to({ rad: innerRad }, 1000)
			.onUpdate(this.l1Circ.draw.bind(this.l1Circ))
			.easing(ease)
			.start();
		
		new TWEEN.Tween(this.l2Circ)
			.to({ rad: outerRad }, 1000)
			.onUpdate(this.l2Circ.draw.bind(this.l2Circ))
			.easing(ease)
			.start();
	};
	
	this.loop = function() {
		TWEEN.update();
	};
};

/*
 * layouts a set of bubbles in a certain way
 * this class does all the communication with the bubbles
 */
OSBubbleChart.BubbleLayout = function(stageWidth, stageHeight) {
	// origin
	this.origin = new OSBubbleChart.Vector(stageWidth * 0.5, stageHeight * 0.5);
	
	// bubbleScale - this makes sure that all "selected" bubbles have a neat size
};

OSBubbleChart.Bubble = function(node, bubblechart, radius, angle, colour) {
	this.node = node;
	this.paper = bubblechart.paper;
	this.o = bubblechart.origin;
	this.bc = bubblechart;
	this.rad = radius;
	this.angle = angle;
	this.colour = colour;
	this.dirty = true;
	this.bubbleRad = OSBubbleChart.amount2rad(this.node.data.amount);
	
	/*
	 * convertes polar coordinates to x,y
	 */
	this.getXY = function() {
		this.x = this.o.x + Math.cos(this.angle) * this.rad;
		this.y = this.o.y - Math.sin(this.angle) * this.rad;
	};
	
	this.init = function() {
		this.getXY();
		this.circle = this.paper.circle(this.x, this.y, this.bubbleRad * this.bc.bubbleScale)
			.attr({ stroke: false, fill: this.colour });
		this.dirty = false;
		$(this.circle.node).click(this.onclick.bind(this));
		$(this.circle.node).css({ cursor: 'pointer'});
	};
	
	this.onclick = function(e) {
		this.bc.scrollTo(this);
	};
	
	this.draw = function() {
		this.getXY();
		this.circle.attr({ cx: this.x, cy: this.y, r: this.bubbleRad * this.bc.bubbleScale });
	};
	
	this.init();
};

OSBubbleChart.Line = function(bc, attr, angle, fromRad, toRad) {
	this.bubblechart = bc;
	this.angle = angle;
	this.fromRad = fromRad;
	this.attr = attr;
	this.toRad = toRad;
	
	this.getXY = function() {
		this.x1 = this.bubblechart.origin.x + Math.cos(this.angle) * this.fromRad; 
		this.y1 = this.bubblechart.origin.y -Math.sin(this.angle) * this.fromRad;
		this.x2 = this.bubblechart.origin.x + Math.cos(this.angle) * this.toRad; 
		this.y2 = this.bubblechart.origin.y  -Math.sin(this.angle) * this.toRad;
	};
	
	this.init = function() {
		this.getXY();
		this.path = this.bubblechart.paper.path(
			"M"+this.x1+" "+this.y1+"L"+this.x2+" "+this.y2
		).attr(this.attr);
	};
	
	this.draw = function() {
		//console.log('line.draw()', this.angle, this.fromRad, this.toRad);
		//console.log(this.x1, this);
		this.getXY();
		//console.log(this.x1);
		this.path.attr({ path: "M"+this.x1+" "+this.y1+"L"+this.x2+" "+this.y2 });
	};
	
	this.init();
};

OSBubbleChart.Ring = function(bc, attr, rad) {
	this.rad = rad;
	this.bubblechart = bc;
	this.attr = attr;
	
	this.init = function() {
		var o = this.bubblechart.origin;
		this.circle = this.bubblechart.paper.circle(o.x, o.y, this.rad).attr(this.attr);
	};
	
	this.draw = function() {
		var o = this.bubblechart.origin;
		this.circle.attr({ cx: o.x, cy: o.y, r: this.rad });
	};
	
	this.init();
};


OSBubbleChart.Vector = function(x,y) {
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
