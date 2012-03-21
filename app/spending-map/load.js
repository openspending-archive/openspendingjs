(function ($) {

	var map = $K.map('#fp-map', 640),
		colscale = new chroma.ColorScale({
    		colors: chroma.brewer.Greens,
    		limits: [-2,-1,0,1,2,3,4,5,6,7]
		}); 
		
	map.loadMap(OpenSpending.scriptRoot + '/app/spending-map/world.svg', function(map) {
			
		$.ajax({
			url: '/datasets.json',
			success: function(resp) {
                var d1 = {};
                $.each(resp.territories, function(i, territory) {
                    d1[territory.code] = territory.count;
                });
				
				map.addLayer({
					id: 'regions',
					className: 'bg',
					key: 'iso2',
					filter: function(d) {
						return !d1.hasOwnProperty(d.iso2);
					}
				});
				
				map.addLayer({
					id: 'regions',
					key: 'iso2',
					filter: function(d) {
						return d1.hasOwnProperty(d.iso2);
					}
				});
				
				map.choropleth({
					data: d1,
					colors: function(d) {						
						if (d === null) return '#e3e0e0';
						return colscale.getColor(d);
					},
					duration: function(d) { return Math.min(900,300*d) },
					delay: function(d) { return 100 + 200*(10-d)+Math.random()*300 }
				});
				
				map.onLayerEvent('click', function(d) {
					OpenSpending.getGlobal().updateDatasetListing({territories: d.iso2});
				});

				// map.fadeIn({ layer: 'bg', duration: 4000 });				
				// map.fadeIn({ layer: 'regions', duration: function(d) { return Math.random() * 1000 } });
			}
		});
	}, { padding: 5 });

}(jQuery));
