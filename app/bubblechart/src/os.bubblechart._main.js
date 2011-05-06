/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings */

var log = window.console ? console.log : function(a,b,c,d) {};
/*
 * is constructed after the container page has been loaded
 */
OpenSpendings.BubbleChart.Main = function(container) {
	// init the page content (create divs, init Raphael paper etc)
	// load the data, url should be provided 
	// init the bubbles
	
	var me = this;
	
	me.$container = $(container);	
	
	me.ns = OpenSpendings.BubbleChart;
	
	me.nodesById = {};
	
	me.bubbles = [];
	
	me.bubbleScale = 1;
	
	/*
	 * @public loadData
	 * 
	 */
	me.loadData = function(url) {
		$.ajax({
			url: url,
			dataType: 'json',
			success: this.setData.bind(this)
		});
	};
	
	/*
	 * is either called directly or by $.ajax when data json file is loaded
	 */
	me.setData = function(data) {
		var me = this;
		me.initData(data);
		me.initPaper();
		me.initTween();
		me.changeView(me.treeRoot.id);
		//this.quickPrototype(data);
	};
	
	/*
	 * initializes the data tree, adds links to parent node for easier traversal etc
	 */
	this.initData = function(root) {
		this.traverse(root, 0);
		this.treeRoot = root;
	};
	
	/*
	 * used for recursive tree traversal
	 */
	this.traverse = function(node, index) {
		var c, child, pc;
		// set node color
		if (node.level === 0) node.color = '#555';
		else if (node.level == 1) {
			pc = node.parent.children;
			node.color = 'hsb('+(index/pc.length)+',.8, .8)';
		} else {
			// inherit color form parent node
			node.color = node.parent.color;
		}
		if (node.level > 0) {
			pc = node.parent.children;
			if (pc.length > 1) {	
				node.left = pc[(index-1+pc.length) % pc.length];
				node.right = pc[(Number(index)+1) % pc.length];
				if (node.right == node.left) node.right = undefined;
			}
		}
		
		if (!node.id) {
			node.id = node.label.toLowerCase().replace(/\W/g, "_");
			while (this.nodesById.hasOwnProperty(node.id)) {
				node.id += '_';
			}
		} 
		this.nodesById[node.id] = node;
		for (c in node.children) {
			child = node.children[c];
			child.parent = node;
			this.traverse(child, c);
		}
	};
	
	/*
	 * initializes all that RaphaelJS stuff
	 */
	this.initPaper = function() {
		var $c = this.$container,
			paper = Raphael($c[0], $c.width(), $c.height()),
			Vector = OpenSpendings.BubbleChart.Vector,
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
	
	/*
	 * is called every time the user changes the view
	 * each view is defined by the selected node (which is displayed 
	 */
	this.changeView = function(id) {
		
		var me = this, i, paper = me.paper,
			ns = me.ns, 
			utils = ns.Utils, 
			o = me.origin,
			l1attr = { stroke: '#ccc', 'stroke-dasharray': "- " },
			l2attr = { stroke: '#ccc', 'stroke-dasharray': ". " },
			a2rad = utils.amount2rad,
			root = me.treeRoot, 
			nodesById = me.nodesById, 
			node = nodesById.hasOwnProperty(id) ? nodesById[id] : null,
			t = new ns.Layout(), bubble;
		

		if (node !== null) {
			
			utils.log('changing view to ', node);
								
			// mark all existing objects for removal here, will be
			// set to false for all bubbles that may stay
			for (i in me.bubbles) me.bubbles[i].removable = true;
			for (i in me.rings) me.rings[i].remove();
			me.rings = [];


			var childRadSum = 0, children = node.children, c, ca, da, oa = 0, twopi = Math.PI * 2;

			if (node == root) {
				t.$(me).bubbleScale = 1.0;
				
				// create root
				bubble = me.createBubble(root, t, 0, 0, root.color);
				bubble.origin = o;
				
				// move origin to center
				t.$(o).x = paper.width * 0.5;
				t.$(o).y = paper.height * 0.5;
				
				me.createRing(t, bubble.origin, 240, l1attr);
				
				// sum radii of all children
				for (i in children) {
					c = children[i];
					childRadSum += a2rad(c.amount);
				}
				
				// create all child bubbles
				for (i in children) {
					c = children[i];
					da = a2rad(c.amount) / childRadSum * twopi;
					ca = oa + da*0.5;
					oa += da;
					// children will reference to the same origin
					bubble = me.createBubble(c, t, 240, ca, c.color);
					bubble.origin = o;
				}

				// just children and me
			} else {
			
				var parentBubble, tgtScale = a2rad(root.amount) / a2rad(node.amount);
				t.$(me).bubbleScale = tgtScale;
				
				var sibling, po = new ns.Vector(me.paper.width * 0.5 - 280 - 
					tgtScale * (a2rad(node.parent.amount)+a2rad(node.amount)), o.y);
				
				// create parent node and give it the new parent origin
				parentBubble = me.createBubble(node.parent, t, 0, 0, node.parent.color);
				parentBubble.origin = o;
				
				// move origin to the left
				t.$(o).x = po.x;
				
				me.createRing(t, po, o.x - po.x, l2attr);
				
				
				// left and right sibling
				if (node.left) {
					sibling = node.left;
					da = (a2rad(sibling.amount)*tgtScale - 100)/(twopi*((o.x-po.x)));
					bubble = me.createBubble(sibling, t, o.x - po.x, 
						0-Math.asin((me.paper.height)*0.5/(o.x-po.x))-da, sibling.color);
					bubble.origin = parentBubble.pos;
				}
				if (node.right) {
					sibling = node.right;
					da = (a2rad(sibling.amount)*tgtScale - 100)/(twopi*((o.x-po.x)));
					bubble = me.createBubble(sibling, t, o.x - po.x, 
						da+Math.asin((me.paper.height+a2rad(sibling.amount)*me.bubbleScale)*0.5/(o.x-po.x)), sibling.color);
					bubble.origin = parentBubble.pos;
				}
				
				// center
				bubble = me.createBubble(node, t, paper.width * 0.5 - po.x, 0, node.color);
				bubble.origin = parentBubble.pos;
				me.createRing(t, bubble.origin, 240, l1attr);
				
				
				for (i in children) {
					c = children[i];
					childRadSum += a2rad(c.amount);
				}
	
				oa -= Math.PI;
	
				for (i in children) {
					c = children[i];
					da = a2rad(c.amount) / childRadSum * twopi;
					ca = oa + da*0.5;
					oa += da;
					var child = me.createBubble(c, t, 240, ca, node.color);
					child.origin = bubble.pos;
				}
				
			}
			
			// remove any bubbles that are marked for removal
			var tmpBubbles = [];
			for (i in me.bubbles) {
				bubble = me.bubbles[i];
				if (bubble.removable) {
					t.$(bubble).alpha = 0;
					t.$(bubble).rad = 0;
				} else {
					tmpBubbles.push(bubble);
				}
			}
			me.bubbles = tmpBubbles;
			
			
			utils.log('ready');
			new ns.AnimatedTransitioner().changeLayout(t);
				
		} else {
			utils.log('node '+id+' not found');
		}
		// step1: 
		
		// step2: 
	};
	
	/*
	 * either creates a new bubble or re-uses a bubble which already exists
	 */
	this.createBubble = function(node, t, rad, angle, color) {
		var me = this, ns = me.ns, i, b, bubble;
		
		for (i in me.bubbles) {
			b = me.bubbles[i];
			if (b.node == node) {
				bubble = b;
				continue;
			}
		}
		if (!bubble) {
			// we need to create a new bubble
			bubble = new ns.Bubble(node, me, new ns.Vector(0,0), 0, 0, color);
			me.bubbles.push(bubble);
		}
		bubble.removable = false;
		t.$(bubble).rad = rad;
		t.$(bubble).angle = angle;
		return bubble;
	};
	
	this.createRing = function(t, origin, rad, attr) {
		var me = this, ns = me.ns, 
			ring = new ns.Ring(me, origin, attr, rad);
		me.rings.push(ring);
		t.$(ring).rad = rad;
		return ring;
	};
	/*
	this.quickPrototype = function(root) {
		
		var origin = this.origin, // center
			paper = this.paper,
			l1rad = paper.height * 0.30, // radius for level 1 nodes
			l2rad = paper.height * 0.45, // radius for level 2 nodes
			lcircAttrs = { stroke: '#ccc', 'stroke-dasharray': "- " },
			a2rad = OpenSpendings.BubbleChart.amount2rad,
			l1alpha = Math.PI * 2 / root.children.length;
			
		// level 1 circle
		
		
		this.l1Circ = new OpenSpendings.BubbleChart.Ring(this, lcircAttrs, l1rad);
		this.l2Circ = new OpenSpendings.BubbleChart.Ring(this, lcircAttrs, l2rad);
			
		this.rootCircle = new OpenSpendings.BubbleChart.Bubble(root, this, 0, 0, '#555555' );
			
		var l1a = 0, da1, i, j, ca1, col, l1radsum = 0, l2radsumt = 0;
		
		var _r = function(a) { return Math.round(Raphael.deg(a)*10)/10; };
		
		for (i in root.children) {
			for (j in root.children[i].children) {
				l2radsumt += a2rad(root.children[i].children[j].amount);
			}
		}
		
		//for (i in root.children) l1radsum += a2rad(root.children[i].amount);
		
		var cmpNodes = function(a,b) {
			if (a.amount == b.amount) return 0;
			return a.amount > b.amount ? -1 : 1;
		};
		
		this.innerRing = [];
		this.outerRing = [];
		this.innerLines = [];
		
		
		
		for (i in root.children) {
			
			
			
			var l2radsum = 0;
			var node = root.children[i];
			
			for (j in node.children) l2radsum += a2rad(node.children[j].amount);
			
			da1 = (l2radsum / l2radsumt) * Math.PI * 2;
			ca1 = l1a + da1*0.5;
			col = 'hsb('+(i/root.children.length)+',.8, .8)';
			
			this.innerRing.push(new OpenSpendings.BubbleChart.Bubble(node, this, origin, l1rad, ca1, col));
			
			this.innerLines.push(new OpenSpendings.BubbleChart.Line(this, lcircAttrs, origin, ca1, l1rad + a2rad(node.amount), l2rad));
			
			
			// cycle through level 2 children
			var l2a = l1a, da2, ca2;
			
			var old = node.children;
			
			old.sort(cmpNodes);
			
			node.children = old;// [].concat(old.slice(0,old.length/2), old.slice(old.length/2).reverse());
			
			//var tmp = da1 * 0.8;
			//l2a += (da1 - tmp) * 0.5;
			
			var cUp = l2a + da1 * 0.5, cLow = cUp, space = 0;// Math.atan(10/l2rad);
			
			for (j in node.children) {
				
				var subnode = node.children[j];
				var brad = OpenSpendings.BubbleChart.amount2rad(subnode.amount);
				var barc = Math.atan(brad / l2rad)*2;
				
				if (j === 0) {
					ca2 = cUp;
					cUp -= (barc + space);
					cLow += (barc + space);
				} else if (j % 2 === 0) {
					ca2 = cUp - barc;
					cUp -= barc + space;
				} else {
					ca2 = cLow + barc;
					cLow += barc + space;
				}
				
				//console.log(j, ca2, barc, cUp, cLow);
				
				//da2 = (a2rad(subnode.amount) / l2radsum) * tmp; 
				
				//ca2 = l2a + da2 * 0.5;
				
				
				
				this.outerRing.push(new OpenSpendings.BubbleChart.Bubble(subnode, this, l2rad, ca2, col));

				//l2a += da2;
			}
			
			l1a += da1;
		}
			
	};*/
	
	/*
	 * is called either by click on one of the bubbles
	 * or by url change (later)
	 *
	this.scrollTo = function(bubble) {
		var delta = -bubble.angle, i, b, outerRad, ox = this.paper.width * 0.5, 
			scale, innerRad, ease = TWEEN.Easing.Exponential.EaseOut;
		
		//var t = new FlareJS.Transitioner(1000, ease);
		var t = {};
		
		if (bubble == this.rootCircle) {
			innerRad = this.paper.height * 0.3;
			outerRad = this.paper.height * 0.45;
			scale = 1.0;
		} else if ($.inArray(bubble, this.innerRing)) {
			innerRad = this.paper.height * 1.4;
			outerRad = this.paper.height * 1.8;
			scale = 8.0;
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
		
		t.$(this.origin).x = ox;
		t.$(this).bubbleScale = scale;
		t.$(this.rootCircle).foo = 1000;
		
		
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
		
		t.$(this.l1Circ).rad = innerRad;
		t.$(this.l2Circ).rad = outerRad;
		t.start();
	};*/
	
	this.loop = function() {
		TWEEN.update();
	};
	
};

