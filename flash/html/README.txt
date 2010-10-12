Anna's version of the WDMMG Flash repository. UNTESTED. Will check in tested version shortly. 

To make this work, you probably need to define the Flash directory location in main.html, and move or symlink dashboard-config.json to the Flash directory.

How these files differ from the Iconomical Flash repo located at /phase-2: 

 * main.html: Dashboard embedded within HTML. Uses configurable option for location of Flash .swf files: <param name="flashvars" value="assets=flash/"/>. 
 * callbacks.js: rewrites URLs dynamically, calls iframe for comments location. 
 * iframe.html: Flash-only page, for embedding within iframe.
 * comments.html: loads Disqus comments on 'unique' page for each dashboard view (using GET parameters). 
 * flash/dashboard-config.json: configuration options for WDMMG styling. 
 * css/ and images/: WDMMG-specific styling. 
