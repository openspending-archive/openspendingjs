$(function() {

	var map = $K.map('#fp-map', 640),
		colscale = new chroma.ColorScale({
    		colors: chroma.brewer.Blues,
    		limits: [-2,-1,0,1,2,3,4,5,6,7]
		}); 
		
	map.loadMap('/static/app/spending-map/world.svg', function(map) {
		
		$.ajax({
			url: '/datasets/territories',
			success: function(territories) {
		
                var d1 = {}; 
                for (var name in territories) {
                  d1[name] = territories[name].count;
                }
				
				map.addLayer({
					id: 'regions',
					className: 'bg',
					key: 'iso2',
					filter: function(d) {
						return !territories.hasOwnProperty(d.iso2);
					}
				});
				
				map.addLayer({
					id: 'regions',
					key: 'iso2',
					filter: function(d) {
						return territories.hasOwnProperty(d.iso2);
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
					location.href = territories[d.iso2].url;
				});

				// map.fadeIn({ layer: 'bg', duration: 4000 });				
				// map.fadeIn({ layer: 'regions', duration: function(d) { return Math.random() * 1000 } });
			}
		});
	}, { padding: 5 });

});

