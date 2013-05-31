# OpenSpending Visualisations

OpenSpendingJS visualisations extend jquery by creating visualisation function callable on elements. For example *openspending.choropleth.js* declares a a choropleth function callable on jquery objects: $(<identifier>).choropleth()

## jquery.choropleth.js

Choropleth map creator. It draws up an svg map of regions and paints the regions with various intensity to show impact of given data in that region.

### Default application

The choropleth is automatically called on any dom elements that have a *choropleth* class defined.

### Options

* **width**: Width of the choropleth map *(default: 640)*
* **height**: Height of the choropleth map *(default: 320)*
* **data**: Javascript object with data configurations
    * **url**: Path to dataset json (OpenSpending) representation *(default: http://openspending.org/datasets.json)*
    * **objects**: Function that returns the object list in the data *(default: function returning territories property (list) in the dataset json)*
    * **intensity**: Function that returns how intense the color should be *(default: function returning count property of each object in the object list)*
    * **id**: Function that returns the identifier in the data and the map *(default: function returning a code property of each object in the object list)*
* **map**: Javascript object with map configurations
    * **url**: SVG map to use as base for the choropleth *(default: World map located at http://openspending.org/static/openspendingjs/app/spending-map/world.svg)*
    * **group**: The group of paths to look at in the SVG map *(default: regions)*
    * **id**: The identifier of the path in map (that holds the same value as is returned by data.id) *(default: 'iso2')*
    * **click**: Function to trigger what happens when a region is clicked *(default: nothing)*
    * **colorscale**: Colorscale object that includes a function *getColor* *(default: chroma.ColorScale with chroma.brewer.Greens)*

Defaults of choropleth map can be overwritten in two different ways:

* Via an options parameter when calling the *choropleth* function on a dom element.
* Via dom element *data-* attributes.
    * These **cannot** overwrite *click* and *colorscale* (since they require javascript).
    * When overwriting *data.objects* it defines the property name in the dataset where the object list is.
    * When overwriting *data.intensity* and *data.id*, they define the property name in each object that returns the intensity and id respectively.

Hierarchy is that data attributes overwrite default and javascript call options overwrite data-attributes:

    defaults < data attributes < options

## jquery.treemap.js

Treemap creator. It draws up a treemap (lots of differently coloured boxes) to show size of amounts relative to one another. The nodes (the boxes) can be clicked to do a drilldown into the data.

### Default application

The treemap is automatically called on any dom elements that have a *treemap* class defined **and** a data-datset attribute.

### Options

* **data**: Javascript object for data configurations
    * **site**: Domain of site *(default: http://openspending.org)*
    * **dataset**: Identifier of dataset *(default: undefined)*
    * **drilldowns**: Dimensions for the levels *(default: [from, to])*
    * **year**: The year to look at *(default: undefined)*
    * **cuts**: Javascript object with key/values for cuts *(default: {})*
* **width**: Width of the treemap *(default: 600)*
* **height**: Height of the treemap *(default: 400)*
* **embed**: Is the treemap embedded? *(default: false)*
* **colorscale**: Colorscale object that includes a function *getColor* *(default: OpenSpending.Colors.DefaultPalette)*
* **transition**: Javascript object for the animation configurations
    * **animate**: Should the treemap be animated? *(default: true)*
    * **type**: Function for animation *(default: $jit.Trans.Expo.easeOut)*
    * **duration**: How long should the animation take? *(default: 1000)*
* **node**: Javascript object for node specific configurations
    * **label**: Function that sets the label of the node *(default: function that sets the amount as label (and name as sublabel) if it's more than 3%)*
    * **tooltop**: Function that sets the tooltip of the node *(default: function that sets the name and % of total amount as label)*

Defaults of a treemap can be overwritten in two different ways:

* Via an options parameter when calling the *treemap* function on a dom element.
* Via dom element *data-* attributes. These can only overwrite:
    * **site** (via data-site)
    * **dataset** (via data-dataset)
    * **drilldowns** (via data-drilldowns which should be comma separated with no whitespace)
    * **year** (via data-year)
    * **cuts** (via data-cuts which should be a JSON object with key/value pairs for the cuts)
    * **width** (via data-width)
    * **height** (via data-height)
    * **transition.duration** (via data-duration)

Hierarchy is that data attributes overwrite default and javascript call options overwrite data-attributes:

    defaults < data attributes < options

### Internet Explorer Support

If you want users who use Internet Explorer to be supported add a script tag that uses excanvas.js (you need to point it to an excanvas.js file):

    <!--[if IE]><script src="excanvas.js"></script><![endif]-->

excanvas.js provides HTML5 canvas to Internet Explorer.

More information about use can be found on [the project's page](http://code.google.com/p/explorercanvas/)
