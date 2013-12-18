# OpenSpending Visualisations

OpenSpendingJS visualisations extend jquery by creating visualisation function callable on elements. For example *openspending.choropleth.js* declares a a choropleth function callable on jquery objects: $(<identifier>).choropleth()

## jquery.bubbletree.js

Bubbletree creator. It draws up a bubbletree (bubble satellites in orbit around the sum). The bubbletree works best for datasets that have a [COFOG](http://unstats.un.org/unsd/cr/registry/regcst.asp?Cl=4) classification as that limits the amount of bubbles (too many bubbles results in a too crowded visualisation), and by default the colors and the icons for the bubbles are based on COFOG.

### Application

There are two ways to call create a bubbletree function:

(1) It is automatically called on any dom elements that have a *bubbletree* class defined **and** a data-datset attribute. Although it won't do anything unless you provide the drilldown as well (via the data-drilldowns attribute).

Example: 
    
	<div class="bubbletree" data-dataset="identifierOfYourDataSet" data-drilldowns="cofog1,cofog2,cofog3"></div>

(2) By calling the *bubbletree* function with an options parameter on an existing dom element.

Example:

    <div id="bubbletree"></div>

    <script 'text/javascript'>
	var data = {
             dataset: "identifierOfYourDataSet",
             drilldowns: ['cofog1', 'cofog2', 'cofog3']
	};
 
	var options = {
             data: data
	};

    $('#bubbletree').bubbletree(options);
    </script>

Please do note that the bubbletree works from the URL so it is quite limited in that you can only present one bubbletree per page.

Also note that width of the bubbletree must be set in css (e.g. on a parent dom element).

### Options

* **data**: Javascript object for data configurations
    * **site**: Domain of site *(default: https://openspending.org)*
    * **dataset**: Identifier of dataset *(default: undefined)*
    * **drilldowns**: Dimensions for the levels *(default: [])*
    * **year**: The year to look at *(default: undefined)*
    * **cuts**: Javascript object with key/values for cuts *(default: {})*Dataset related information
* **root**: Javascript object for root node configurations
    * **label**: Title of the root node, *(default: 'Total')*
* **style**: Javascript object with configurations for looks, this configuration gets passed in, as is, into the bubbletree constructor
    * **bubbletype**: String with type of bubble, configuration needed for bubbletree creation *(default: 'icon')*
    * **clearcolor**: Boolean indication if colors should be cleared *(default: false)*
    * **icons**: Javascript object with icon configurations
        **svg**: Javascript object which provides a *getIcon* function that returns the svg filename for a code or a node *(default: OpenSpending.Icons.Cofog)*
        **path**: String indicating path to where the svg files are *(default: '/icons/)*
    * colors: Javascript object which provides a *getColor* function that returns a color for the bubble based on node or index *(default: OpenSpending.Colors.Cofog)*
* **currency**: Overwrite the currency from the dataset, even though it would be weird *(default: undefined [don't overwrite])*

Defaults of a bubbletree can be overwritten in two different ways:

* Via an options parameter when calling the *bubbletree* function on a dom element.
* Via dom element *data-* attributes. These can only overwrite:
    * **site** (via data-site)
    * **dataset** (via data-dataset)
    * **drilldowns** (via data-drilldowns which should be comma separated with no whitespace)
    * **year** (via data-year)
    * **cuts** (via data-cuts which should be a JSON object with key/value pairs for the cuts)
    * **svg icon path** (via data-icons-path)
    * **currency** (via data-currency)

Hierarchy is that data attributes overwrite default and javascript call options overwrite data-attributes:

    defaults < data attributes < options

## jquery.barchart.js

Barchart creator. This creates a bar chart with built in support for the [COFOG classification](http://unstats.un.org/unsd/cr/registry/regcst.asp?Cl=4) and the same visual feel as the bubbletree. Users can drill down into the bar chart as well.

### Application

There are two ways to call create a bar chart function:

(1) It is automatically called on any dom elements that have a *barchart* class defined **and** a data-datset attribute. Although it won't do anything unless you provide the drilldown as well (via the data-drilldowns attribute).

Example: 
    
	<div class="barchart" data-dataset="identifierOfYourDataSet" data-drilldowns="cofog1,cofog2,cofog3"></div>

(2) By calling the *barchart* function with an options parameter on an existing dom element.

Example:

    <div id="barchart"></div>

    <script 'text/javascript'>
	var data = {
             dataset: "identifierOfYourDataSet",
             drilldowns: ['cofog1', 'cofog2', 'cofog3']
	};
 
	var options = {
             data: data
	};

    $('#barchart').barchart(options);
    </script>

If you want time series, for example to show division between years you can use the drilldown *year*.

### Options

* **data**: Javascript object for data configurations
    * **site**: Domain of site *(default: https://openspending.org)*
    * **dataset**: Identifier of dataset *(default: undefined)*
    * **drilldowns**: Dimensions for the levels *(default: [])*
    * **year**: The year to look at *(default: undefined)*
    * **cuts**: Javascript object with key/values for cuts *(default: {})*
* **click**: Event handler function when a bar is clicked. This function returns a false value if the default click event shouldn't be executed. The node object used to draw the bar is passed as argument to the function.
* **width**: Width of the visualisation *(default: 600)*
* **height**: Height of the visualisation *(default: 400)*
* **style**: Javascript object containing the styles for the bar chart
    * **bubbletop**: Boolean indicating if an OpenSpending bubble should be placed on top of the bar *(default: true)*
    * **labels**: Javascript object with labels and tooltips for the visualisation
        * **title**: Javascript object with settings for the title (x axis value)
            * **content**: Function that extracts the label from the node used to draw the bar *(default: returns the node label)*
            * **color**: String with color of the label *(default: '#fff')*
        * **value**: Javascript object with settings for the value (y axis value)
            * **content**: Function that extracts the label from the node used to draw the bar *(default: returns the node amount in shorthand format)*
            * **color**: String with color of the label *(default: '#fff')*
        * **tooltip**: Javascript object with settings for the *on hover* tooltip
            * **content**: Function that extracts the tooltip from the node used to draw the bar *(default: returns the <label>: <formatted amount>)*
    * **colors**: Javascript object that provies a getColor function that returns the color based on either the node or the index *(default: OpenSpending.Colors.Cofog)*
    * **icons**: Javascript object with icon configurations
        **svg**: Javascript object which provides a *getIcon* function that returns the svg filename for a code or a node *(default: OpenSpending.Icons.Cofog)*
        **path**: String indicating path to where the svg files are *(default: '/icons/)*
* **currency**: Overwrite the currency from the dataset, even though it would be weird *(default: undefined [don't overwrite])*

Defaults of a bar chart can be overwritten in two different ways:

* Via an options parameter when calling the *barchart* function on a dom element.
* Via dom element *data-* attributes. These can only overwrite:
    * **site** (via data-site)
    * **dataset** (via data-dataset)
    * **drilldowns** (via data-drilldowns which should be comma separated with no whitespace)
    * **year** (via data-year)
    * **cuts** (via data-cuts which should be a JSON object with key/value pairs for the cuts)
    * **width** (via data-width)
    * **height** (via data-height)
    * **color** (via data-color which returns the given hex color for all bars)
    * **svg icon path** (via data-icons-path)

Hierarchy is that data attributes overwrite default and javascript call options overwrite data-attributes:

    defaults < data attributes < options

## jquery.treemap.js

Treemap creator. It draws up a treemap (lots of differently coloured boxes) to show size of amounts relative to one another. The nodes (the boxes) can be clicked to do a drilldown into the data.

### Application

There are two ways to call create a treemap function:

(1) It is automatically called on any dom elements that have a *treemap* class defined **and** a data-datset attribute.

Example: 
    
	<div class="treemap" data-dataset="identifierOfYourDataSet"></div>

(2) By calling the *treemap* function with an options parameter on an existing dom element.

Example:

    <div id="treemap"></div>

    <script 'text/javascript'>
	var data = {
     dataset: "identifierOfYourDataSet",
	};
 
	var options = {
     data: data
	};

    $('#treemap').treemap(options);
    </script>

### Options

* **data**: Javascript object for data configurations
    * **site**: Domain of site *(default: https://openspending.org)*
    * **dataset**: Identifier of dataset *(default: undefined)*
    * **drilldowns**: Dimensions for the levels *(default: [])*
    * **year**: The year to look at *(default: undefined)*
    * **cuts**: Javascript object with key/values for cuts *(default: {})*
* **click**: Event handler function when a tile is clicked. This function returns a false value if the default click event shouldn't be executed. The tile object is passed as argument to the function.
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
>

excanvas.js provides HTML5 canvas to Internet Explorer.

More information about use can be found on [the project's page](http://code.google.com/p/explorercanvas/)


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
