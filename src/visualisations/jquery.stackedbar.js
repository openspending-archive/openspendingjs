/* jquery.stackedbar.js Stacked bars for Open Spending
 * ---------------------------------------------------
 * Copyright 2013,2014 Open Knowledge, Michael Bauer
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


!function($) {
    $.stackedbar= function(element,options) {
  
        var config = $.extend(true,{}, $.stackedbar.defaults,$.stackedbar.domopts(element), options)
  
        var width=config.width;
        var height=config.height;
        var margin=  margin= { "left": 20,
                            "right":20,
                            "top": 35,
                            "bottom": 20
                              }


        var stack=[];
  
        var transition=function(c,svg) {
            var ds=(height/c.length)*0.6;
            var dh=(height-ds*c.length)/(c.length*1.0)
            c=_.sortBy(c,function(d) { return -d.amount });
            scale=d3.scale.linear()
                .domain([0,c[0].amount])
                .range([0,width]);

            _.each(c, function(d,i) {
                d.dy=(dh+ds)*i;
                d.dx=0;
                d.dh=dh;
                d.dw=scale(d.amount);
            })
            // paint graphs.
    
            svg.selectAll("g.bar").remove();

            var groups=svg.selectAll("g.bar")
                .data(c)
                .enter()
                .append("g")
	     .attr("class","bar")
	     .append("rect")
	     .attr("x",function(d) { return d.x })
	     .attr("y",function(d) { return d.y })
	     .attr("width",function(d) { return d.width })
	     .attr("height",function(d) { return d.height });
	   
	   groups.transition()
	     .attr("height",function(d) { return d.dh })
	     .transition()
	     .attr("y", function(d) {return d.dy })
	     .transition()
	     .attr("x",function(d) { return d.dx })
	     .transition()
	     .attr("width", function(d) { return d.dw });
	   
	   setTimeout(function() { draw(c,svg) },2000);
	   }
    
     console.log("declaring draw");
	 var draw=function(c,svg) {
	   c=_.sortBy(c,function(d) { return -d.amount });
	   
	   svg.selectAll("g").remove();
	   var bs=(height/c.length)*0.6;
	   var bh=(height-bs*c.length)/(c.length*1.0);
	   
	   var scale=d3.scale.linear()
	     .domain([0,c[0].amount])
	     .range([0,width]);

	   _.each(c,function(d,i) {
	     var y=(bh+bs)*i;
	     var x=0;
	     var height=bh;
	     if (d.children.length === 0 ) {
	       d.children = [d]
	       } 
	     _.each(d.children,function(d) {
	       d.x=x;
	       d.y=y;
	       d.height=height;
	       d.width=scale(d.amount);
	       x=x+d.width;
	       })
	     })
	    
	    var pp=d3.format(",f");

	    var groups=svg.selectAll("g.bar")
	     .data(c)
	     .enter()
	     .append("g")
	     .attr("class","bar")
	     .on("click",function(d) { if (d.children.length > 1 )
	       {transition(d.children,svg)} });
	   
	    var stackedbars=groups.selectAll("rect")
	     .data(function(d) { return d.children })
	     .enter()
	     .append("rect")
	     .attr("x",function(d) { return d.x })
	     .attr("y",function(d) { return d.y })
	     .attr("width", function(d) { return d.width })
	     .attr("height", function(d) { return d.height })
	     .append("title")
	     .text(function(d) { return d.label+" "+pp(d.amount)+d.currency });

	   var labels=groups.append("text")
	     .text(function(d) { return d.label + " "+pp(d.amount)+d.currency })
	     .attr("x",0)
	     .attr("y",function(d,i) {return (bh+bs)*i })
	     .attr("text-anchor","top");

	   stack.push({label: _.first(c).taxonomy,
	               data: c});
	   
	   console.log(stack);
	   svg.selectAll("svg ul").remove();
	   svg.append("foreignObject")
	       .attr("x",0)
	       .attr("y",-35)
	       .attr("width",width)
	       .attr("height",20)
	       .append("xhtml:body")
	       .append("ul")
	       .attr("class","sb-breadcrumbs")
	       .selectAll("li")
	       .data(stack)
	       .enter()
	       .append("li")
	       .text(function(d) {
	           return d.label; })
	       .on("click",function(d) {
	           stack=stack.slice(0,stack.indexOf(d));
	           draw(d.data,svg) });
	   }

	 this.callback=function (tree) {
	    var svg = d3.select(element).append("svg")
	      .attr("width", width+margin.left+margin.right)
	      .attr("height", height+margin.top+margin.bottom)
	      .append("g")
	      .attr("transform","translate("+margin.left+","+margin.top+")");
	   this.currency=tree.currency;
	   draw(tree.children,svg);
	   }

	 config.data.callback=this.callback;
	    
     var aggregator=new OpenSpending.Aggregator();

	 aggregator.get(config.data);

	 }

     $.stackedbar.defaults = {
        data: {siteUrl: "https://openspending.org",
               measure: "amount",
               dataset: undefined,
               drilldowns: [],
               cuts: [],
               },
        width: 600,
        height: 600,
        };
     
     $.stackedbar.domopts = function(element) {
        var $element=$(element);

        return {data: {
                    site: $element.attr('data-site'),
                    dataset: $element.attr('data-dataset'),
                    drilldowns: $element.attr('data-drilldowns') ?
                        $element.attr('data-drilldowns').split(',') : undefined,
                    cuts: $element.attr('data-cuts') ?
                        $element.attr('data-cuts').split(",") : undefined
                     },
                 width: $element.attr('data-width'),
                 height: $element.attr('data-height') }
      }

      $.fn.extend({
        stackedbar: function(options) {
            if(options == undefined) options = {};
            this.each(function() {
                $.stackedbar(this, options);
                });
            }
         });   

     $('.stackedbar[data-dataset]').stackedbar();
     }(jQuery);
