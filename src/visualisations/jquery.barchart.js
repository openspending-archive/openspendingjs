/* jquery.barchart.js - Barchart creator
 * ------------------------------------------------------------------------
 *
 * Copyright 2013 Open Knowledge Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* REQUIREMENTS
 * thejit
 */

!function ($) {

    // barchart function to create the overview of multiple years in the given dom element with
    // the given options
    $.barchart  = function ( element, options ) {
        // Create a jQuery object out of our element
        var $element = $(element);

        //Set dataset-config
        var config = {
            data: {
                site: 'http://openspending.org',
                dataset: options.data.dataset}
        };

        //Set drilldowns with 'year' as first drilldown, so that we obtain the aggregate amount per year
        //Set the cuts to drill down to the right level
        var state = {
            drilldowns: options.data.drilldowns,
            cuts: options.data.cuts
        }

        //define function that is called by the aggregator with the return of the aggregator as parameter
        var execute = function(node) {
            var barchartData = {values: _.map(node.children, function(item, index) {
                return {
                    'label': item.label,
                    'values': Math.round(item.amount)
                }
            })}
            //The aggregator doesn't always return the years in ascending order
            //So we sort the years (in ascending order)
            barchartData.values.sort(function(a, b){
                return a.label-b.label
            })
            //Load the barchart with the compiled & sorted data
            barChart.loadJSON(barchartData);
        }

        // Setting width and height of container
        // (Workaround: Can't set canvas size in jit-class due to a bug)
        $element.height(200);
        $element.width(200);

        //Settings for the Barchart
        var barChart = new $jit.BarChart({
            //id of the visualization container
            injectInto: element,
            //Set width and height: unfortunately due to a bug in JIT  this does not work for barcharts yet.
            //For now we'll have to set width and height with the method above this block of code
            //width: 200,
            //height: 200,
            //whether to add animations
            animate: true,
            //horizontal or vertical barcharts
            orientation: 'vertical',
            //bars separation
            barsOffset: 5,
            //visualization offset
            Margin: {
                top:5,
                left: 5,
                right: 5,
                bottom:5
            },
            //labels offset position
            labelOffset: 5,
            //bars style
            type: 'stacked',
            //whether to show the aggregation of the values
            showAggregates:true,
            //whether to show the labels for the bars
            showLabels:true,
            //labels style
            Label: {
                type: 'Native', //Native or HTML
                size: 13,
                family: 'Arial',
                color: 'black'
            },
            //add tooltips
            Tips: {
                enable: true,
                onShow: function(tip, elem) {
                    tip.innerHTML = "<b>" + elem.name + "</b>: " + elem.value;
                }
            }
        });

        var initialize = function() {
            // Set drilldowns
            state.drilldowns = state.drilldowns || [state.drilldown];
            // Set cuts (or non if empty)
            state.cuts = state.cuts || {};
            // Initialize cut array
            var cuts = [];
            // For each cut we push it to the cuts array with a semicolon in
            // between because that's how OpenSpending reads the cuts
            for (var field in state.cuts) {
                cuts.push(field + ':' + state.cuts[field]);
            }

            //Add year as first drilldown. We want to primarily sort the data according to year,
            // so that we can get the aggregates per year for the barchart
            state.drilldowns.unshift("year");

            //Run the openspending aggregator to get all info from the database
            // and return result to the execute function
            var aggregator = new OpenSpending.Aggregator();
            aggregator.get({
                siteUrl: config.data.site,
                dataset: config.data.dataset,
                drilldowns: state.drilldowns,
                cuts: cuts,
                rootNodeLabel: 'total',
                callback: execute
            });
        };

        //run the initialize function
        initialize();

    };

    // Extend jquery's prototype with the barchart function that runs through
    // all dom elements and passes them, along with the options to the
    // barchart function
    $.fn.extend({
        barchart: function(options) {
            if(options == undefined) options = {};
            this.each(function() {
                $.barchart( this, options);
            });
        }
    });


}(jQuery);