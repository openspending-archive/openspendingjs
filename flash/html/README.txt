WDMMG additions to the Iconomical Flash repository.

To make this work, you need to:

* define the Flash directory location in main.html, using the 'flashvars' parameter (by default, this points at the sibling /phase-2/flash directory)

If you want to use the WDMMG dashboard formatting options (as opposed to Iconomical's version), you also need to:

* move or symlink ./dashboard-config.json into the Flash directory

Notes on how these files differ from Iconomical's Flash repo located at /phase-2: 

 * main.html: Dashboard embedded within HTML. Uses configurable option for location of Flash .swf files: <param name="flashvars" value="assets=flash/"/>. 
 * callbacks.js: rewrites URLs dynamically, calls iframe for comments location. 
 * iframe.html: Flash-only page, for embedding within iframe.
 * comments.html: loads Disqus comments on 'unique' page for each dashboard view (using GET parameters). 
 * flash/dashboard-config.json: configuration options for WDMMG styling. 
 * css/ and images/: WDMMG-specific styling. 
