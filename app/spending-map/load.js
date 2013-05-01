function create_choropleth(element, dataurl, svgopts) {
    var map = $K.map(element, 640),
        colscale = new chroma.ColorScale({
                       colors: chroma.brewer.Greens,
                       limits: [-2,-1,0,1,2,3,4,5,6,7]
	}); 
		
    map.loadMap(svgopts.url, function(map) {
        $.ajax({
            url: dataurl,
            success: function(resp) {
                var d1 = {};
                $.each(resp.territories, function(i, territory) {
                    d1[territory.code] = territory.count;
                });

                map.addLayer({
                    id: svgopts.id,
                    className: 'bg',
                    key: svgopts.key,
                    filter: function(d) {
                        return !d1.hasOwnProperty(d.iso2);
                    }
                });
				
                map.addLayer({
                    id: svgopts.id,
                    key: svgopts.key,
                    filter: function(d) {
                        return d1.hasOwnProperty(d.iso2);
                    }
                });
				
                map.choropleth({
                    data: d1,
                    colors: function(d) {
                        if (d === null) return '#fff';
                        return colscale.getColor(d);
                    },
                    duration: function(d) { return Math.min(900,300*d) },
                    delay: function(d) { 
                        return 100 + 200*(10-d)+Math.random()*300
                    }
                });
				
                map.onLayerEvent('click', function(d) {
                    OpenSpending.getGlobal().updateDatasetListing({territories: d.iso2});
                });
            }
        });
    }, { padding: 5 });
}

(function ($) {
    $('.spending-map').each(function() {
        // Get the svg map url
        var svgmap = $(this).attr('data-svg-map');
        // If the url doesn't start with http:// we prepend the openspending
        // script root
        if (svgmap.substr(0,7) !== 'http://') {
            svgmap = OpenSpending.scriptRoot + svgmap;
        }

        create_choropleth(this, $(this).attr('data-url'),
			  {'url':svgmap,
			   'id':$(this).attr('data-svg-id'),
			   'key':$(this).attr('data-svg-key')
			  });
    });
}(jQuery));
