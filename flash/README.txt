Welcome to the WDMMG Flash repository.

In this directory, we have:

 * html/ - Flash files as configured by Anna.
 * phase-2/ - raw Flash repo as delivered by Iconomical. 

Guide to configuring Iconomical's phase-2 files:

 * main.html: configurable option for location of Flash .swf files: <param name="flashvars" value="assets=flash/"/>. Change 'assets=' to the location of your Flash repo. 
 * callbacks.js: configurable options for showing Flash header and footer, and disabling URL interaction with Flash. wdmmgCallback offers hooks into Flash callback events. 
 * flash/dashboard-config.json: configurable options for location of API, slice and key details, and dashboard formatting. 