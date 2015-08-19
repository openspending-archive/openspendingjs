# OpenSpending Utils

The various OpenSpendingJS utils extend the OpenSpending object with their own objects. For example the amount utils can be found as OpenSpending.Amounts

## openspending.aggregator.js

Aggregator functions to work directly with the OpenSpending platform's aggregation API (or related functions) This exposes:

* **OpenSpending.Aggregator.configFromQueryString**: Function that create aggregation configuration from a query string. Optional parameter is the query string itself. If it isn't provided the function will use the current window location.
* **OpenSpending.Aggregator.get**: Function that given an aggregation configuration gets the data via the OpenSpending platform API.

### Example of aggregation config

Below is an example of an aggregation configuration

    {
        siteUrl: 'http://openspending.org',
        dataset: 'ukgov-finances-cra',
        drilldowns: ['from', 'to'],
        cuts: ['year:2012'],
        breakdown: 'region',
        rootNodeLabel: 'Total',
        localApiCache: 'aggregate.json',
        measure: 'amount',
        processEntry: function(e) { return e; },
        callback: function (tree) {}
    }

## openspending.amounts.js

Useful utils to work with amounts and currencies. Uses accounting.js to do the heavy lifting on formatting. This exposes:

* **OpenSpending.Amounts.shorthand**: Function that takes in one parameter *amount* and returns a short hand format for the amount. Anything over 1 billion (e.g. 4.000.000.000) will be abbreviated with "bn" (e.g. 4bn). The same goes for million (m), and thousand (k). Anything lower then a thousand is shown with two decimals.
* **OpenSpending.Amounts.format**: Function that takes in *amount*, *precision*, *currency* and formats the amount with according to the two other parameters. Precision is an integer that declares the number of decimal points. Currency is a three letter abbreviation for the currency (e.g. USD, GBP)
* **OpenSpending.Amounts.currencySymbol**: Function that takes in a three letter abbreviation for a currency and returns the corresponding currency symbol (or the three letter abbreviation if it didn't find the symbol.
* **OpenSpending.Amounts.currencySymbols**: A key/value object of three letter currency abbreviations and how they map to currency symbols.

## openspending.colors.js

Color manipulation for OpenSpending that is useful to visualise data with fancy colors. This exposes:

* **OpenSpending.Colors.DefaultPalette**: A list of default colors. The array has a getColor function that allows colors to be fetched from the default palette in a round robin fashin (as a circle).

## openspending.common.js

Includes common utils that can come in handy in various different tasks. This exposes:

* **OpenSpending.Common.parseQueryString**: Function that parses a URI query string and returns it as a key/value javascript object. Optional parameter is the query string itself. If it isn't provided the function will use the current window location.