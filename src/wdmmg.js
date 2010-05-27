function createTreeMap(json, elementId) {
    var get = function(id){
        return document.getElementById(id);
    };
    var infovis = get(elementId);
    var w = infovis.offsetWidth, h = infovis.offsetHeight;
    infovis.style.width = w + 'px';
    infovis.style.height = h + 'px';

    //init tm
    var tm = new TM.Squarified({
        //The id of the treemap container
        rootId: elementId,
        //Set the max. depth to be shown for a subtree
        levelsToShow: 1,

        //Add click handlers for
        //zooming the Treemap in and out
        addLeftClickHandler: true,
        addRightClickHandler: true,
        
        //When hovering a node highlight the nodes
        //between the root node and the hovered node. This
        //is done by adding the 'in-path' CSS class to each node.
        selectPathOnHover: true,
                
        //Allow tips
        Tips: {
          allow: true,
          //add positioning offsets
          offsetX: 20,
          offsetY: 20,
          //implement the onShow method to
          //add content to the tooltip when a node
          //is hovered
          onShow: function(tip, node, isLeaf, domElement) {
              tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>" + 
                "<div class=\"tip-text\">" + this.makeHTMLFromData(node.data) + "</div>"; 
          },  

          //Aux method: Build the tooltip inner html by using the data property
          makeHTMLFromData: function(data){
              var html = '';
              html += "Spending (&pound;bn)" + ': ' + data.$area + '<br />';
              if ("$color" in data) 
                  html += "rank" + ': ' + data.$color + '<br />';
              return html;
          }
        },

        //Implement this method for retrieving a requested
        //subtree that has as root a node with id = nodeId,
        //and level as depth. This method could also make a server-side
        //call for the requested subtree. When completed, the onComplete 
        //callback method should be called.
        request: function(nodeId, level, onComplete){
            var tree = eval('(' + json + ')');
            var subtree = TreeUtil.getSubtree(tree, nodeId);
            TreeUtil.prune(subtree, 1);
            onComplete.onComplete(nodeId, subtree);
        },
        
        //Remove all events for the element before destroying it.
        onDestroyElement: function(content, tree, isLeaf, leaf){
            if(leaf.clearAttributes) leaf.clearAttributes();
        }
    });
  
    var pjson = eval('(' + json + ')');
    TreeUtil.prune(pjson, 1);
    tm.loadJSON(pjson);
    //end
}
