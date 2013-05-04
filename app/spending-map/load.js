(function ($) {
    $.fn.choropleth = function ( opts ) {
	this.each(function() {
	    // Get configuration from either parameter opts 
	    // or html5 data params
	    var dataurl = (opts && opts.data.url) ? 
                opts.data.url : $(this).attr('data-url');
	    var dataobjects = (opts && opts.data.object) ? 
                opts.data.objects : $(this).attr('data-objects');
	    var datalabel = (opts && opts.data.url) ? 
                opts.data.label : $(this).attr('data-label');
	    var dataimpact = (opts && opts.data.url) ? 
                opts.data.impact : $(this).attr('data-impact');
            var svgmap = (opts && opts.svg.map) ?
                opts.svg.map : $(this).attr('data-svg-map');
	    var svgid = (opts && opts.svg.id) ?
                opts.svg.id : $(this).attr('data-svg-id');
	    var svgkey = (opts && opts.svg.key) ?
                opts.svg.key : $(this).attr('data-svg-key');
	    
	    var map = $K.map(this, 640, 320),
            colscale = new chroma.ColorScale({
		colors: chroma.brewer.Greens,
		limits: [-2,-1,0,1,2,3,4,5,6,7]
	    }); 
	    
	    map.loadMap(svgmap, function(map) {
		$.ajax({
		    url: dataurl,
		    dataType: "jsonp",
		    success: function(resp) {
			var d1 = {};
			$.each(resp[dataobjects], function(i, obj) {
			    d1[obj[datalabel]] = obj[dataimpact];
			});
			
			map.addLayer({
			    id: svgid,
			    className: 'bg',
			    key: svgkey,
			    filter: function(d) {
				return !d1.hasOwnProperty(d[svgkey]);
			    }
			});
			
			map.addLayer({
			    id: svgid,
			    key: svgkey,
			    filter: function(d) {
				return d1.hasOwnProperty(d[svgkey]);
			    }
			});
			
			map.choropleth({
			    data: d1,
			    colors: function(d) {
				if (d === null) return '#fff';
				return colscale.getColor(d);
			    },
			    duration: function(d) {
				return Math.min(900,300*d)
			    },
			    delay: function(d) { 
				return 100 + 200*(10-d)+Math.random()*300
			    }
			});
			
			map.onLayerEvent('click', function(d) {
			    OpenSpending.getGlobal()
				.updateDatasetListing({territories: d[svgkey]});
			});
		    }
		});
	    }, { padding: 5 });
	});
    }
		 		  
    $('.spending-map').choropleth();

}(jQuery));
