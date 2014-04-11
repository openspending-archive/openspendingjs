/* jquery.linebars.js - a linebar visualization for OpenSpending
 * -------------------------------------------------------------
 *
 * Copyright 2013 Open Knowledge Foundation
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

/* REQUIREMENTS
 * d3.v3
 * underscore-1.3.1.js
 */ 

!function($) { 
    

    $.linebars = function(element, options) {
        
    var config = $.extend(true, {}, $.linebars.defaults,
            $.linebars.domopts(element),  
            options);

    var margin=[20,0,20,50];
    var width=config.width-margin[1]-margin[3];
    var height=config.height-margin[0]-margin[2];

    var createrequest= function(config) {   
        var url= [config.data.siteUrl,
                  "/api/2/aggregate?dataset=",
                  config.data.dataset,
                  "&measure=",
                  config.data.measure]

        if (config.data.drilldowns) {
            url.push("&drilldown=")
            url.push(config.data.drilldowns.join("|"));
            }

        if (config.data.cuts) {
            url.push("&cut=")
            url.push(config.data.cuts.join("|"));
            }
        return url.join("");
        };
    
    
    d3.json(createrequest(config), function(data) {
        var svg=d3.select(element).append("svg")
            .attr("width",config.width)
            .attr("height",config.height);


        var headings=_.unique(
            _.pluck(
                _.pluck(
                    data.drilldown,
                        _.last(config.data.drilldowns)),
                'label'));
        
        var years=_.map(_.unique(
            _.pluck(
                _.pluck(
                    data.drilldown,'time'),
                        'year')),
                        function(x) { return parseInt(x)});

        //create an array of arrays - first drilldown then years
        var graphdata=_.values(_.reduce(data.drilldown,
            function(x,y) {
                var h=y[_.last(config.data.drilldowns)].label;
                x[h] = x[h] || [];
                x[h].push ( y );
                return x;
                },{}));
        
        // fill missing years with amount=0
        graphdata=_.map(graphdata,function(d) {
            var ys=_.map(_.pluck(_.pluck(d,'time'),'year'),function(x)
            {return parseInt(x); });
            _.each(_.difference(years,ys),function(x){
                var add={
                    time: { year: x }
                    };
                add[config.data.measure]=0;
                add[_.last(config.data.drilldowns)]={ label: 
                    _.first(d)[_.last(config.data.drilldowns)].label }
                d.push(add);
                   
                })
            return d; });

        // turn year to int and sort
        graphdata=_.map(graphdata,function(d) { 
            return _.sortBy(_.map(d,function(x) {
                x.time.year=parseInt(x.time.year);
                return x;
                }),function (x) {
                    return x.time.year })
            });
        


        var bw=(width/headings.length)*0.7;
        var bs=(width/headings.length)*0.3;

        var xscale=d3.scale.linear()
            .domain([_.min(years),_.max(years)])
            .range([0,bw]);
        
        var mmamount=function(d,fun) {  
            return fun(_.map(d,function(x) {
                return fun(_.pluck(x,config.data.measure));
                } ));
            };

        var yscale=d3.scale.linear()
            .domain([0,mmamount(graphdata,_.max)])
            .range([height-margin[2],margin[0]])
        
        var path=d3.svg.line()
            .x(function(d) { return xscale(d.time.year) ; })
            .y(function(d) { return yscale(d[config.data.measure]) });

        var bsdata=_.map(graphdata,function(d) {
                var ro={time: {year: _.min(years) }};
                ro[config.data.measure]=0;
                ro[_.last(config.data.drilldowns)] = {label:
                    _.first(d)[_.last(config.data.drilldowns)].label };
                var r=[ro]
                _.each(d, function(x){
                    r.push(x) });
                var lo={time: {year: _.max(years) }}
                lo[config.data.measure]=0;
                lo[_.last(config.data.drilldowns)] = {label:
                    _.first(d)[_.last(config.data.drilldowns)].label };
                r.push(lo); 
                return r;
                })

        var bars=svg.selectAll("g.bar")
            .data(bsdata)
            .enter()
            .append("g")
            .attr("class","bar")
            .attr("transform",function(d,i) {   
                return "translate("+[margin[3]+i*(bw+bs),0]+")";
                });

        bars.append("path")
            .attr("d",function(d) { return path(d) })
            .attr("class","bar");
        
        bars.append("path")
            .attr("d",function(d) { return path(_.rest(_.initial(d))) })
            .attr("class","topline");

        bars.append("text")
            .attr("x",bw/2)
            .attr("y",height-margin[2]+30)
            .attr("text-anchor","middle")
            .text(function(d) {
                return _.first(d)[_.last(config.data.drilldowns)].label });
        
        bars.selectAll("text.dotlabel")
            .data(function(d) { return _.initial(_.rest(d)) })
            .enter()
            .append("text")
            .attr("class","dotlabel")
            .attr("x",function(d) {
                return xscale(d.time.year);
                })
            .attr("y",function(d) {
                return yscale(d[config.data.measure])-7; })
            .attr("text-anchor","middle")
            .text(function(d) {return d3.format(".2s")(d[config.data.measure]) });


        bars.selectAll("text.yearlabel")
            .data([_.first(years),_.last(years)])
            .enter()
            .append("text")
            .attr("class","yearlabel")
            .attr("x",function(d) {
                return xscale(d) } )
            .attr("y",height-margin[2]+10)
            .attr("text-anchor","middle")
            .text(function(d) { return d; });
        
        bars.on("click",function(e,t,i) {
            if (d3.select(this).classed("selected")) {
                this.setAttribute("class","bar");
                }
            else 
            {
                this.setAttribute("class","bar selected");}
                
             })

        
        var labelscale=d3.scale.linear()
            .domain([mmamount(graphdata,_.min),mmamount(graphdata,_.max)])
            .range([yscale(mmamount(graphdata,_.min)),yscale(mmamount(graphdata,_.max))]);

        var axis=d3.svg.axis()
            .orient("left")
            .scale(labelscale)
            .ticks(5)
            .tickFormat(d3.format("s"));
                

        svg.append("g")
            .attr("class","axis")
            .attr("transform","translate(45,0)")
            .call(axis);

        });
    };

    $.linebars.defaults = {
        data: {siteUrl: "https://openspending.org",
               measure: "amount",
               dataset: undefined,
               drilldowns: [],
               cuts: []},
        width: 600,
        height: 400 }
    
    $.linebars.domopts = function(element) {
        var $element=$(element);
        return {data: {
                site: $element.attr('data-site'),
                dataset: $element.attr('data-dataset'),
                drilldowns: $element.attr('data-drilldowns') ? 
                    $element.attr('data-drilldowns').split(',') : undefined,
                cuts: $element.attr('data-cuts') ?
                    $element.attr('data-cuts').split(",") : undefined
                 },
                width: $element.attr("data-width"),
                height: $element.attr("data-height") }
        };

    $.fn.extend({
        linebars: function(options) {
            if(options == undefined) options = {};
            this.each(function() {
                $.linebars( this, options);
            });
        }
    });
    
    $('.linebars[data-dataset]').linebars();
    }(jQuery);
