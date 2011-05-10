/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings, vis4, vis4color */

var log = window.console ? console.log : function(a,b,c,d) {};
/*
 * is constructed after the container page has been loaded
 */
OpenSpendings.BubbleChart.Main = function(container, onHover, onUnHover) {
	// init the page content (create divs, init Raphael paper etc)
	// load the data, url should be provided 
	// init the bubbles
	
	var me = this;
	
	me.$container = $(container);	
	
	/*
	 * this function is called when the user hovers a bubble
	 */
	me.onHover = onHover;
	
	me.onUnHover = onUnHover;
	
	me.ns = OpenSpendings.BubbleChart;
	
	me.nodesById = {};
	
	me.bubbles = [];
	
	me.bubbleScale = 1;
	
	me.globRotation = 0;
	
	me.currentYear = 2010;
	
	me.currentCenter = undefined;
	
	me.currentTransition = undefined;
	
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
		//me.navigateTo(me.treeRoot);
		me.initHistory();
		
		//this.quickPrototype(data);
	};
	
	/*
	 * initializes the data tree, adds links to parent node for easier traversal etc
	 */
	me.initData = function(root) {
		var me = this;
		me.traverse(root, 0);
		me.treeRoot = root;
	};
	
	/*
	 * used for recursive tree traversal
	 */
	me.traverse = function(node, index) {
		var c, child, pc, me = this;
		// set node color
		if (node.level === 0) node.color = '#555';
		else if (node.level == 1) {
			pc = node.parent.children;
			//node.color = 'hsl('+(index/pc.length)+',.8, .8)';
			node.color = vis4color.fromHSL(index/pc.length*360, 0.7, 0.45).x;
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
		
		if (!node.token) {
			node.token = node.label.toLowerCase().replace(/\W/g, "-");
			while (me.nodesById.hasOwnProperty(node.token)) {
				node.token += '-';
			}
		} 
		me.nodesById[node.token] = node;
		node.maxChildAmount = 0;
		for (c in node.children) {
			child = node.children[c];
			child.parent = node;
			node.maxChildAmount = Math.max(node.maxChildAmount, child.amount);
			me.traverse(child, c);
		}
	};
	
	/*
	 * initializes all that RaphaelJS stuff
	 */
	me.initPaper = function() {
		var me = this, $c = me.$container, rt = me.treeRoot,
			paper = Raphael($c[0], $c.width(), $c.height()),
			maxRad = Math.min(paper.width, paper.height) * 0.5 - 40,
			base, Vector = OpenSpendings.BubbleChart.Vector,
			origin = new Vector(paper.width * 0.5, paper.height * 0.5); // center
			
		me.paper = paper;
		base = Math.pow((Math.pow(rt.amount, 0.6) + Math.pow(rt.maxChildAmount, 0.6)*2) / maxRad, 1.6666666667);
		me.a2radBase = OpenSpendings.BubbleChart.a2radBase = base;
		
		me.origin = origin;
	};
	
	/*
	 * initializes the Tweening engine
	 */
	me.initTween = function() {
		this.tweenTimer = setInterval(this.loop, 1000/120);
	};
	
	/*
	 * is called every time the user changes the view
	 * each view is defined by the selected node (which is displayed 
	 */
	me.changeView = function(token) {
		
		var me = this, i, 
			paper = me.paper,
			maxRad = Math.min(paper.height, paper.width) * 0.5 - 60,
			ns = me.ns, 
			utils = ns.Utils, 
			o = me.origin,
			l1attr = { stroke: '#ccc', 'stroke-dasharray': "- " },
			l2attr = { stroke: '#ccc', 'stroke-dasharray': ". " },
			a2rad = utils.amount2rad,
			root = me.treeRoot, 
			nodesById = me.nodesById, 
			node = nodesById.hasOwnProperty(token) ? nodesById[token] : null,
			t = new ns.Layout(), bubble;
		
		if (node !== null) {
			
			utils.log('changing view to ', node);
								
			// mark all existing objects for removal here, will be
			// set to false for all bubbles that may stay
			for (i in me.bubbles) me.bubbles[i].removable = true;
			for (i in me.rings) me.rings[i].remove();
			me.rings = [];


			var childRadSum = 0, children = node.children, ringRad, 
				c, ca, da, oa, twopi = Math.PI * 2;

			// store the last centered bubbles angle if it's on level 1
			if (me.currentCenter && me.currentCenter.node.level == 1) {
				me.globRotation = 0-me.currentCenter.node.centerAngle;
			}
			
			oa = me.globRotation;

			if (node == root) {
			
				t.$(me).bubbleScale = 1.0;
				
				// create root
				bubble = me.createBubble(root, t, 0, 0, root.color);
				bubble.origin = o;
			
				me.currentCenter = bubble;
			
				ringRad = a2rad(root.amount) + a2rad(root.maxChildAmount) + 20;
				
				// move origin to center
				t.$(o).x = paper.width * 0.5;
				t.$(o).y = paper.height * 0.5;
				
				me.createRing(t, bubble.origin, ringRad, l1attr);
				
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
					if (!c.hasOwnProperty('centerAngle')) c.centerAngle = ca;
					oa += da;
					// children will reference to the same origin
					bubble = me.createBubble(c, t, ringRad, ca, c.color);
					bubble.origin = o;
				}
				
				// just children and me
			} else {
			
				var parentBubble, tgtScale = maxRad / (a2rad(node.amount) + a2rad(node.maxChildAmount)*2);
				t.$(me).bubbleScale = tgtScale;
				
				var sibling, po = new ns.Vector(Math.max(paper.width * 0.5 - 280 - 
					tgtScale * (a2rad(node.parent.amount)+a2rad(node.amount)), 
					tgtScale*a2rad(node.parent.amount)*-1+30), o.y), srad, sang;
				
				// create parent node and give it the new parent origin
				parentBubble = me.createBubble(node.parent, t, 0, 0, node.parent.color);
				parentBubble.origin = o;
				
				// move origin to the left
				t.$(o).x = po.x;
				
				me.createRing(t, po, o.x - po.x, l2attr);
				
				
				// left and right sibling
				if (node.left) {
					sibling = node.left;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = 0-Math.asin(((me.paper.height)*0.5 + srad)/(o.x-po.x)*0.9);
					da = (srad - 100)/(twopi*((o.x-po.x)));
					bubble = me.createBubble(sibling, t, o.x - po.x, sang, sibling.color);
					bubble.origin = parentBubble.pos;
					vis4.log('left', sang / Math.PI * 180);
				}
				if (node.right) {
					sibling = node.right;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = Math.asin(((me.paper.height)*0.5 + srad)/(o.x-po.x)*0.9);
					da = (a2rad(sibling.amount)*tgtScale - 100)/(twopi*((o.x-po.x)));
					bubble = me.createBubble(sibling, t, o.x - po.x, 
						sang, sibling.color);
					bubble.origin = parentBubble.pos;
				}
				
				// center
				bubble = me.createBubble(node, t, paper.width * 0.5 - po.x, 0, node.color);
				bubble.origin = parentBubble.pos;
				
				// store the center bubble
				me.currentCenter = bubble;
				
				for (i in children) {
					c = children[i];
					childRadSum += a2rad(c.amount);
				}
	
				oa -= Math.PI;
				srad = a2rad(node.amount)*tgtScale + a2rad(node.maxChildAmount)*tgtScale + 20;
				me.createRing(t, bubble.pos, srad, l1attr);
				
	
				for (i in children) {
					c = children[i];
					da = a2rad(c.amount) / childRadSum * twopi;
					ca = oa + da*0.5;
					oa += da;
					var child = me.createBubble(c, t, srad, ca, node.color);
					child.origin = bubble.pos;
				}
				
			}
			
			// remove any bubbles that are marked for removal
			var tmpBubbles = [], tr;
			for (i in me.bubbles) {
				bubble = me.bubbles[i];
				if (bubble.removable) {
					t.$(bubble).alpha = 0;
					if (bubble.node.level > 1) t.$(bubble).rad = 0;
				} else {
					tmpBubbles.push(bubble);
				}
			}
			me.bubbles = tmpBubbles;
			
			
			utils.log('ready');
			tr = new ns.AnimatedTransitioner();
			tr.changeLayout(t);
			me.currentTransition = tr;
			
			
		} else {
			utils.log('node '+token+' not found');
		}
		// step1: 
		
		// step2: 
	};
	
	/*
	 * either creates a new bubble or re-uses a bubble which already exists
	 */
	me.createBubble = function(node, t, rad, angle, color) {
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
	
	me.createRing = function(t, origin, rad, attr) {
		var me = this, ns = me.ns, 
			ring = new ns.Ring(me, origin, attr, rad);
		ring.toBack();
		me.rings.push(ring);
		t.$(ring).rad = rad;
		return ring;
	};
	
	me.initHistory = function() {
		$.history.init(me.urlChanged.bind(me), { unescape: ",/" });
	};
	
	me.freshUrl = '';
	
	/*
	 * callback for every url change, either initiated by user or
	 * by this class itself
	 */
	me.urlChanged = function(hash) {
		var me = this, tr = me.currentTransition;
		
		me.freshUrl = hash;
		
		if (tr && tr.running) {
			vis4.log('transition is running at the moment, adding listener');
			tr.onComplete(me.changeUrl.bind(me));
		} else {
			me.changeUrl();
		}
	};
	
	/*
	 * this function initiate the action which follows the url change
	 */
	me.changeUrl = function() {
		var me = this, parts = me.freshUrl.split('/'), yr = parts[1], token = parts[parts.length-1], url;
		
		if (me.freshUrl === "") me.navigateTo(me.treeRoot);
		
		if (me.nodesById.hasOwnProperty(token)) {
			url = me.getUrlForNode(me.nodesById[token]);
			if (me.freshUrl != url) {
				// node found but url not perfect
				$.history.load(url);
			} else {
				me.navigateTo(me.nodesById[token], true);
			}
		}
	};
	
	me.navigateTo = function(node, fromUrlChange) {
		var me = this;
		if (fromUrlChange) me.changeView(node.token);
		else $.history.load(me.getUrlForNode(node));
	};
	
	/*
	 * creates a valid url for a given node, e.g. /2010/health/medical-supplies
	 */
	me.getUrlForNode = function(node) {
		var parts = [];
		parts.push(node.token);
		while (node.parent) {
			parts.push(node.parent.token);
			node = node.parent;
		}
		parts.reverse();
		return '/'+me.currentYear+'/'+parts.join('/');
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

