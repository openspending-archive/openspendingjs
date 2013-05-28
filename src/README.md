# OpenSpending Visualisations

OpenSpendingJS visualisations extend jquery by creating visualisation function callable on elements. For example *openspending.choropleth.js* declares a a choropleth function callable on jquery objects: $(<identifier>).choropleth()

## openspending.choropleth.js

Choropleth map creator. It draws up an svg map of regions and paints the regions with various intensity to show impact of given data in that region.

### Options

* **width**: Width of the choropleth map (*default: 640*)
* **height**: Height of the choropleth map (*default: 320*)
* **data**: Javascript object with data configurations
    * **url**: Path to dataset json (OpenSpending) representation (*default: http://openspending.org/datasets.json*)
    * **objects**: Function that returns the object list in the data (*default: function returning territories property (list) in the dataset json*)
    * **intensity**: Function that returns how intense the color should be (*default: function returning count property of each object in the object list*)
    * **id**: Function that returns the identifier in the data and the map (*default: function returning a code property of each object in the object list*)
* **map**: Javascript object with map configurations
    * **url**: SVG map to use as base for the choropleth (*default: World map located at http://openspending.org/static/openspendingjs/app/spending-map/world.svg*)
    * **group**: The group of paths to look at in the SVG map (*default: regions*)
    * **id**: The identifier of the path in map (that holds the same value as is returned by data.id) (*default: 'iso2'*)
    * **click**: Function to trigger what happens when a region is clicked (*default: nothing*)
    * **colorscale**: Colorscale object that includes a function *getColor* (*default: chroma.ColorScale with chroma.brewer.Greens*)

Defaults of choropleth map can be overwritten in two different ways:

* Via an options parameter when calling the *choropleth* function on a dom element.
* Via dom element *data-* attributes.
    * These **cannot** overwrite *click* and *colorscale* (since they require javascript).
    * When overwriting *data.objects* it defines the property name in the dataset where the object list is.
    * When overwriting *data.intensity* and *data.id*, they define the property name in each object that returns the intensity and id respectively.

Hierarchy is that data attributes overwrite default and javascript call options overwrite data-attributes:

    defaults < data attributes < options

