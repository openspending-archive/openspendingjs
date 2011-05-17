/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global Raphael, TWEEN, OpenSpendings, vis4, vis4color */

var log = window.console ? console.log : function(a,b,c,d) {};
/*
 * is constructed after the container page has been loaded
 */
OpenSpendings.BubbleChart.Main = function(container, onHover, onUnHover, style) {
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
	
	/*
	 * stylesheet JSON that contains colors and icons for the bubbles
	 */
	me.style = style;
	
	me.ns = OpenSpendings.BubbleChart;
	
	me.nodesById = {};
	
	me.displayObjects = [];
	
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
		me.initBubbles();
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
		
		if (me.style.hasOwnProperty(node.id)) {
			node.color = me.style[node.id].color;	
		} else if (node.hasOwnProperty('color') && node.color !== undefined) {
			// use color given in data
			vis4.log('use data color', node.color);
		} else {
			// use color from parent node if no other match available
			if (node.level > 0) node.color = node.parent.color;
			else node.color = '#999999';
		}
		vis4.log(node.id, node.color, node);
		// lighten up the color if there are no children
		if (node.children.length < 1) {
			vis4.log(node.color);
			node.color = vis4color.fromHex(node.color).saturation('*.86').x;
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
	 * creates instances for all bubbles in the dataset. the bubbles will
	 * remain invisble until they enter the stage via changeView()
	 */
	me.initBubbles = function() {
		vis4.log('initBubbles');
		var me = this, rt = me.treeRoot;
		
		// chosse one of them for the vis
		OpenSpendings.BubbleChart.Bubble = OpenSpendings.BubbleChart.Bubbles.Multi;
		
		var rootBubble = me.createBubble(rt, me.origin, 0, 0, rt.color);
		me.traverseBubbles(rootBubble);
	};
	
	me.traverseBubbles = function(parentBubble) {
		var me = this, ring,
			a2rad = me.ns.Utils.amount2rad,
			i, c, children, childBubble, childRadSum = 0, oa = 0, da, ca, twopi = Math.PI * 2;
		children = parentBubble.node.children;
		
		// sum radii of all children
		for (i in children) {
			c = children[i];
			childRadSum += a2rad(c.amount);
		}
		
		if (children.length > 0) {
			// create ring
			ring = me.createRing(parentBubble.node, parentBubble.pos, 0, { stroke: '#ccc', 'stroke-dasharray': "- " });
		}
		
		for (i in children) {
			c = children[i];
		
			da = a2rad(c.amount) / childRadSum * twopi;
			ca = oa + da*0.5;
		
			c.centerAngle = ca;
		
			childBubble = me.createBubble(c, parentBubble.pos, 0, ca, c.color);
			// für jedes kind einen bubble anlegen und mit dem parent verbinden
			oa += da;
			
			me.traverseBubbles(childBubble);
		}

	};
	
		
	/*
	 * creates a new bubble 
	 */
	me.createBubble = function(node, origin, rad, angle, color) {
		var me = this, ns = me.ns, i, b, bubble;
		bubble = new ns.Bubble(node, me, origin, rad, angle, color);
		//me.bubbles.push(bubble);
		me.displayObjects.push(bubble);
		// vis4.log('created bubble for', node.label);
		return bubble;
	};
	
	me.createRing = function(node, origin, rad, attr) {
		var me = this, ns = me.ns, ring;
		ring = new ns.Ring(node, me, origin, rad, attr);
		me.displayObjects.push(ring);
		return ring;
	};
	
	/*
	 * is called every time the user changes the view
	 * each view is defined by the selected node (which is displayed 
	 */
	me.changeView = function(token) {
		var me = this, 
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
			t = new ns.Layout(), 
			bubble, tr, i, twopi = Math.PI * 2,
			getBubble = me.getBubble.bind(me), getRing = me.getRing.bind(me),
			unify = me.unifyAngle;
		
		if (node !== null) {
		
			// what do you we have to do here?
			// - find out the origin position
			// -
		
			var parent, grandpa, sibling, c, cn, rad1, rad2, rad, srad, sang, ring, tgtScale, 
				radSum, leftTurn = false, rightTurn = false;
		
			
			
			// initially we will mark all bubbles and rings for hiding
			// get....() will set this flag to false 
			for (i in me.displayObjects) me.displayObjects[i].hideFlag = true;
			
		
			if (node == root) {
			
				
				t.$(me).bubbleScale = 1.0;
				
				// move origin to center
				t.$(o).x = paper.width * 0.5;
				t.$(o).y = paper.height * 0.5;

				// make the root bubble visible
				parent = getBubble(root);
				//parent.childRotation = 0;
				
				rad1 = a2rad(node.amount) + a2rad(node.maxChildAmount) + 20;

				ring = getRing(root);
				t.$(ring).rad = rad1;

				for (i in node.children) {
					cn = node.children[i];
					// adjust rad and angle for children
					bubble = getBubble(cn);
					t.$(bubble).angle = unify(cn.centerAngle + parent.childRotation);
					t.$(bubble).rad = rad1;
				}
				
			} else { 
				// node is not the root node
				
				tgtScale = maxRad / (a2rad(node.amount) + a2rad(node.maxChildAmount)*2);
				t.$(me).bubbleScale = tgtScale;
				
				parent = getBubble(node);
				
				if (me.currentCenter && me.currentCenter == node.left) rightTurn = true;
				else if (me.currentCenter && me.currentCenter == node.right) leftTurn = true;
				
				var sa = me.shortestAngleTo;
				//if (leftTurn) sa = me.shortestLeftTurn;
				//if (rightTurn) sa = me.shortestRightTurn;

				t.$(parent).angle = sa(parent.angle, 0);
				
				// find the sum of all radii from node to root
				rad1 = a2rad(node.amount) * tgtScale + a2rad(node.maxChildAmount) * tgtScale + 20;

				ring = getRing(node);
				t.$(ring).rad = rad1;

				grandpa = getBubble(node.parent);
				grandpa.childRotation = -node.centerAngle;
				
				t.$(grandpa).rad = 0;
				// 
				rad2 = paper.width * 0.5 - Math.max(paper.width * 0.5 - 280 - 
					tgtScale * (a2rad(node.parent.amount)+a2rad(node.amount)), 
					tgtScale*a2rad(node.parent.amount)*-1+60);

				radSum = rad1 + rad2;
				
				t.$(o).x = paper.width * 0.5 - rad2;
				t.$(o).y = paper.height * 0.5;
				
				rad2 += paper.width * 0.1;
				
				ring = getRing(node.parent);
				t.$(ring).rad = rad2;
				
				t.$(parent).rad = rad2;
				
				
				// children
				for (i in node.children) {
					cn = node.children[i];
					// adjust rad and angle for children
					bubble = getBubble(cn);
					t.$(bubble).angle = me.shortestAngleTo(bubble.angle, cn.centerAngle + parent.childRotation);
					t.$(bubble).rad = rad1;
				}
				
				// left and right sibling
				
				if (node.left) {
					sibling = node.left;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = twopi - Math.asin((me.paper.height*0.5 + srad - 50) / rad2);
					
					bubble = getBubble(sibling);
					t.$(bubble).rad = rad2;
					t.$(bubble).angle = sa(bubble.angle, sang);
				}
				if (node.right) {
					sibling = node.right;
					srad = a2rad(sibling.amount)*tgtScale;
					sang = Math.asin((me.paper.height*0.5 + srad - 50) / rad2);
					
					bubble = getBubble(sibling);
					t.$(bubble).rad = rad2;
					t.$(bubble).angle = sa(bubble.angle, sang);
				}
			}
			
			// now we're going to check all hides and shows
			for (i in me.displayObjects) {
				var obj = me.displayObjects[i];
				if (obj.hideFlag && obj.visible) {
					// bubble is on stage but shouldn't
					t.$(obj).alpha = 0; // let it disappear
					if (obj.className == "bubble" && obj.node.level > 1) t.$(obj).rad = 0; // move to center
					//else t.$(obj).rad = 
					t.hide(obj); // remove from stage afterwards
				} else if (!obj.hideFlag) {
					// bubble is not on stage but should
					t.$(obj).alpha = 1; 
					if (!obj.visible) {
						obj.alpha = 0;
						t.show(obj);
					}
				} 
			}

			tr = new ns.AnimatedTransitioner(1000);
			tr.changeLayout(t);
			me.currentTransition = tr;
			me.currentCenter = node;
						
		} else {
			utils.log('node '+token+' not found');
		}
		// step1: 
		
		// step2: 
	};
	
	me.unifyAngle = function(a) {
		var pi = Math.PI, twopi = pi * 2;
		while (a >= twopi) a -= twopi;
		while (a < 0) a += twopi;
		return a;
	};
	
	me.shortestAngle = function(f, t) {
		var deg = function(a) { return Math.round(a/Math.PI*180)+''; };
		var pi = Math.PI, twopi = pi * 2, unify= me.unifyAngle;
		f = unify(f);
		t = unify(t);
		var sa = t - f;
		if (sa > pi) sa -= twopi;
		if (sa < -pi) sa += twopi;
		
		vis4.log('shortestAngle', deg(f), deg(t), deg(sa));
		
		return sa;
	};
	
	me.shortestAngleTo = function(f, t) {
		return f+me.shortestAngle(f, t);
	};
	
	me.shortestLeftTurn = function(f, t) {
		var sa = me.shortestAngle(f, t);
		if (sa > 0) sa = sa - Math.PI*2;
		return f+sa;
	};
	
	me.shortestRightTurn = function(f, t) {
		var sa = me.shortestAngle(f, t);
		if (sa < 0) sa = Math.PI*2 + sa;
		return f+sa;
	};

	
	/*
	 * returns the instance of a bubble for a given node
	 */
	me.getBubble = function(node) {
		return this.getDisplayObject('bubble', node);
	};
	
	/*
	 * 
	 */
	me.getRing = function(node) {
		return this.getDisplayObject('ring', node);
	};
	
	me.getDisplayObject = function(className, node) {
		var me = this, i, o;
		for (i in me.displayObjects) {
			o = me.displayObjects[i];
			if (o.className != className) continue;
			if (o.node == node) {
				o.hideFlag = false;
				return o;
			}
		}
		vis4.log(className+' not found for node', node);
	};
	
	/*
	me.createRing = function(t, origin, rad, attr) {
		var me = this, ns = me.ns, 
			ring = new ns.Ring(me, origin, attr, rad);
		ring.toBack();
		me.rings.push(ring);
		t.$(ring).rad = rad;
		return ring;
	};
	*/
	
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
		} else {
			me.navigateTo(me.treeRoot);
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

