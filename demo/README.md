# Demos

This is a page featuring demos of some of the visualizations that can
be driven using OpenSpending.  The basic idea is to drive these
visualizations from
[partially aggregated](http://labs.openspending.org/osep/07-aggregation/)
CSV files of spending data along with metadata provided in the
associated [datapackage.json](http://dataprotocols.org/data-packages/)
file.  All of the examples below are driven from aggregations of the
[main CSV file](https://github.com/openspending/dataset-cra/blob/master/data/cra.csv)
found in the
[UK Country Regional Analysis](https://github.com/openspending/dataset-cra)
datapackage which is a database of UK government spending.  Currently,
metadata such as `currency`, `aggregated_csv_url`, and
`amount_col_name` are manually passed to the visualization code.  You
can see the basic usage example in the `index.html` files of the
visualizations below:

## Treemap

![Treemap](/demo/treemap.png)

The partially aggregated CSV file driving the
[Treemap](/demo/treemap/) visualization in the format:

    cofog_level1_code,dept_code,value
    01,DFT004,425530000.0
    03,NIO081,7368105000.0
    03,NIE099,589154000.0

## BubbleTree

![BubbleTree](/demo/bubbletree.png)

Likewise, the partially aggregated CSV file driving the
[BubbleTree](/demo/bubbletree/) visualization is in the format:

    cofog_level1_code,dept_code,value
    01,DFT004,425530000.0
    03,NIO081,7368105000.0
    03,NIE099,589154000.0


## Time Series

![Time Series](/demo/timeseries.png)

The partially aggregated CSV file driving the
[Time Series](/demo/timeseries/) visualization is only slightly
modified by aggregating by the year dimension before the rest.

    year,cofog_level1_code,dept_code,value
    2010,10,Dept030,106000000.00999999
    2006,04,Welsh LG Adjustment/Input,522305000.0
    2008,04,Dept084,3757412999.9800014
