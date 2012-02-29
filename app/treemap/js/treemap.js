OpenSpending = "OpenSpending" in window ? OpenSpending : {};

(function ($) {

OpenSpending.TreeMap = function (elem) {
  var self = this

  this.$e = $(elem)

  this.init = function () {
  }

  this.setDataFromAggregator = function (url, dataset, dimension, data) {
    var needsColorization = true;
    this.data = {children: _.map(data.children, function(item) {
      if (item.color)
        needsColorization = false;

      return {
        children: [],
        id: item.id,
        name: item.label || item.name,
        data: {
            value: item.amount,
            $area: Math.floor(item.amount / 10000),
            title: item.label || item.name,
            link: url + '/' + dataset + '/' + dimension + '/' + item.name,
            $color: item.color || '#333333'
          }
        };
    })};

    if (needsColorization) 
      this.autoColorize();
  }

  this.autoColorize = function() {
    var nodes = this.data.children.length;
    var colors = OpenSpending.Utils.getColorPalette(nodes);
    for (var i = 0; i < nodes; i++) {
      this.data.children[i].data.$color = colors[i];
    }
  }

  this.draw = function () {
    if (!this.data.children.length) {
      $(this.$e).hide();
      return;
    }
    var self = this;
    self.tm = new $jit.TM.Squarified({
        injectInto: self.$e[0],
        levelsToShow: 1,
        titleHeight: 0,
        animate: true,

        offset: 2,
        Label: {
          type: 'HTML',
          size: 12,
          family: 'Tahoma, Verdana, Arial',
          color: '#DDE7F0'
          },
        Node: {
          color: '#243448',
          CanvasStyles: {
            shadowBlur: 0,
            shadowColor: '#000'
          }
        },
        Events: {
          enable: true,
          onClick: function(node) {
            if(node) {
                document.location.href = node.data.link;
            }
          },
          onRightClick: function() {
            self.tm.out();
          },
          onMouseEnter: function(node, eventInfo) {
            if(node) {
              node.setCanvasStyle('shadowBlur', 8);
              node.orig_color = node.getData('color');
              node.setData('color', '#A3B3C7');
              self.tm.fx.plotNode(node, self.tm.canvas);
              // tm.labels.plotLabel(tm.canvas, node);
            }
          },
          onMouseLeave: function(node) {
            if(node) {
              node.removeData('color');
              node.removeCanvasStyle('shadowBlur');
              node.setData('color', node.orig_color);
              self.tm.plot();
            }
          }
        },
        duration: 1000,
        Tips: {
          enable: true,
          type: 'Native',
          offsetX: 20,
          offsetY: 20,
          onShow: function(tip, node, isLeaf, domElement) {
            var html = '<div class="tip-title">' + node.name +
                ': ' + OpenSpending.Utils.formatAmount(node.data.value) +
                '</div><div class="tip-text">';
            var data = node.data;
            tip.innerHTML = html; 
          }  
        },
        //Implement this method for retrieving a requested  
        //subtree that has as root a node with id = nodeId,  
        //and level as depth. This method could also make a server-side  
        //call for the requested subtree. When completed, the onComplete   
        //callback method should be called.  
        request: function(nodeId, level, onComplete){  
          // var tree = eval('(' + json + ')');
          var tree = json;  
          var subtree = $jit.json.getSubtree(tree, nodeId);  
          $jit.json.prune(subtree, 1);  
          onComplete.onComplete(nodeId, subtree);  
        },
        //Add the name of the node in the corresponding label
        //This method is called once, on label creation and only for DOM labels.
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = "<div class='desc'><h2>" + OpenSpending.Utils.formatAmount(node.data.value) + "</h2>" + node.name + "</div>";
            /*
            var desc = $(domElement.firstChild);
            var elem = $(domElement);
            if (desc.height() > elem.height() || desc.width() > elem.width()) {
              console.log("foO");
              desc.hide();
            }
            */
        }
    });
    self.tm.loadJSON(this.data);
    self.tm.refresh();
  }

  this.init()
  return this
}

})(jQuery)
