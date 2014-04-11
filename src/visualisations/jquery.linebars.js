var OpenSpending = OpenSpending || {};

OpenSpending.linebars = function(config) {
    
    var margin=[20,0,20,50];
    var width=config.width-margin[1]-margin[3];
    var height=config.height-margin[0]-margin[2];

    var createrequest= function(config) {   
        var url= [config.siteUrl,
                  "/api/2/aggregate?dataset=",
                  config.dataset,
                  "&measure=",
                  config.measure]

        if (config.drilldowns) {
            url.push("&drilldown=")
            url.push(config.drilldowns.join("|"));
            }

        if (config.cuts) {
            url.push("&cut=")
            url.push(config.cuts.join("|"));
            }
        return url.join("");
        };
    
    
    d3.json(createrequest(config), function(data) {
        console.log(data);
        var svg=d3.select(config.element).append("svg")
            .attr("width",config.width)
            .attr("height",config.height);

        

        var headings=_.unique(
            _.pluck(
                _.pluck(
                    data.drilldown,
                        _.last(config.drilldowns)),
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
                var h=y[_.last(config.drilldowns)].label;
                x[h] = x[h] || [];
                x[h].push ( y );
                return x;
                },{}));
        
        // fill missing years with amount=0
        graphdata=_.map(graphdata,function(d) {
            var ys=_.map(_.pluck(_.pluck(d,'time'),'year'),function(x)
            {return parseInt(x); });
            console.log(ys);
            console.log(years);
            console.log(_.difference(years,ys));
            _.each(_.difference(years,ys),function(x){
                var add={
                    time: { year: x }
                    };
                add[config.measure]=0;
                add[_.last(config.drilldowns)]={ label: 
                    _.first(d)[_.last(config.drilldowns)].label }
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
        

        console.log(graphdata);

        var bw=(width/headings.length)*0.7;
        var bs=(width/headings.length)*0.3;

        var xscale=d3.scale.linear()
            .domain([_.min(years),_.max(years)])
            .range([0,bw]);
        
        var mmamount=function(d,fun) {  
            return fun(_.map(d,function(x) {
                return fun(_.pluck(x,config.measure));
                } ));
            };

        var yscale=d3.scale.linear()
            .domain([0,mmamount(graphdata,_.max)])
            .range([height-margin[2],margin[0]])
        
        var path=d3.svg.line()
            .x(function(d) { return xscale(d.time.year) ; })
            .y(function(d) { return yscale(d[config.measure]) });

        var bsdata=_.map(graphdata,function(d) {
                var ro={time: {year: _.min(years) }};
                ro[config.measure]=0;
                ro[_.last(config.drilldowns)] = {label:
                    _.first(d)[_.last(config.drilldowns)].label };
                var r=[ro]
                _.each(d, function(x){
                    r.push(x) });
                var lo={time: {year: _.max(years) }}
                lo[config.measure]=0;
                lo[_.last(config.drilldowns)] = {label:
                    _.first(d)[_.last(config.drilldowns)].label };
                r.push(lo); 
                return r;
                })
        console.log(bsdata);

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
                return _.first(d)[_.last(config.drilldowns)].label });
        
        bars.selectAll("text.dotlabel")
            .data(function(d) { return _.initial(_.rest(d)) })
            .enter()
            .append("text")
            .attr("class","dotlabel")
            .attr("x",function(d) {
                return xscale(d.time.year);
                })
            .attr("y",function(d) {
                return yscale(d[config.measure])-7; })
            .attr("text-anchor","middle")
            .text(function(d) {return d3.format(".2s")(d[config.measure]) });


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
