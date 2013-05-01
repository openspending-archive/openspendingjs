function create_choropleth(element, data_url, svg_url, key) {
    var map = $K.map(element, 640),
        colscale = new chroma.ColorScale({
                       colors: chroma.brewer.Greens,
                       limits: [-2,-1,0,1,2,3,4,5,6,7]
	}); 
		
    map.loadMap(svg_url, function(map) {
        $.ajax({
            url: data_url,
            success: function(resp) {
                var d1 = {};
                $.each(resp.territories, function(i, territory) {
                    d1[territory.code] = territory.count;
                });

                map.addLayer({
                    id: 'regions',
                    className: 'bg',
                    key: key,
                    filter: function(d) {
                        return !d1.hasOwnProperty(d.iso2);
                    }
                });
				
                map.addLayer({
                    id: 'regions',
                    key: key,
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
    create_choropleth('#fp-map', '/datasets.json', 
		      OpenSpending.scriptRoot + '/app/spending-map/world.svg',
		      'iso2');
}(jQuery));
