# Openspending libraries 

This directory contains a couple of .do files to assist in the management of
these libraries. These are "redo" scripts -- see [1].

[1]: https://github.com/apenwarr/redo

If you don't want to install "redo", you can simply use the shell program "do"
in this directory, which comes from [2]:

[2]: https://github.com/apenwarr/redo/blob/master/minimal/do

To regenerate all minified versions of the vendor libraries, simply run:

    redo

To regenerate an individual library, say "backbone", run:

    redo vendor/backbone.min.js

All minification assumes you have `uglifyjs` installed. If you don't, use

    npm install uglify-js

