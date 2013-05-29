# OpenSpending Javascript libraries

Visualisations and other utils that use data from [OpenSpending](http://openspending.org) to help people understand where and how money is being spent.

## Want to Use Openspendingjs?

Just drop the most recent file in *dist/* into your website (via a script tag) and start using the visualisations. You can read more about configurations for the different visualisations in *src/README.md*

## Want to Contribute to Openspendingjs?

We are currently in a migration stage in order to make contributions easier and more consistent, so the code base might be a little confusing. The best place to add your visualisation is *src/*. We're in the process of moving all of our visualisations and utils into that folder (to make the build process cleaner and simpler).

External libraries (requirements) are placed in *lib/vendor/*. There are a lot of files there at the moment. Some of those files are old versions of these libraries. We're in the process of cleaning these files up, removing unused files.

### Conventions

There are some conventions regarding the javascript files in the *src* directory to keep them consistent.

#### jQuery Plugins

All of the visualisations should be constructed as [jQuery](http://jquery.com) plugins which make them really easy to use. jQuery is already used on a lot of sites ([OpenSpending](http://openspending.org) included), so this really makes it simple to use openspendingjs on many sites.

If you want them to be usable as plugins for other javascript frameworks (or as a standalone library), don't be afraid to contribute to openspendingjs.

#### Comment, Comment, Comment

Sometimes comments can be in the way but rarely they don't. Try to comment your code as much as possible. *Sherlock-commenting* (where code reader goes: *"No shit, Sherlock!"*) is better than no commenting at all.

Openspendingjs is not only a usable library but it can also help new developers become more proficient in development, and encourages them to contribute to openspendingjs!

#### Declare License in Source Files

Openspendingjs is licensed under the Apache License, version 2.0. Each source file should include the Apache license notice. We recommend you assign the copyright to the [Open Knowledge Foundation ](http://okfn.org) in the notice. The Open Knowledge Foundation will take utmost care to enforce the license conditions. Please help us track violation to the license.

#### Add Your Name to the Contributors List

We try to keep a list of contributors to openspendingjs in *CONTRIBUTORS*. It is extremely important that you get credit for your work even if the Open Knowledge Foundation is the custodian of the copyright as per the license. We value all contributions (so the list of contributors is in alphabetical order).

#### List Requirements in Source Files

Openspendingjs doesn't use any module loaders or other means of managing requirements but listing them in a comment helps maintainers who want to upgrade libraries to find affected files (we don't have a good test framework in place at the moment so upgrading libraries should be done with care).

#### List Requirements Individually in Build File

To make the clean up process simpler, when you add external libraries to the build process, list the individual files in the build file (*Gruntfile.js*). This also shows developers what will already be concatenated into the openspendingjs distribution file (since our *lib/vendor* directory might be slightly confusing).

## Build process

To build openspendingjs we use [Grunt](http://gruntjs.com/) version *>= 0.4* which requires [Node.js](http://nodejs.org) version *>= 0.8*. The build process is simple:

    grunt default

This compiles all source files and their requirements into two files in *dist/*:

* openspendingjs-<version>.js (where version is openspendingjs version number)
* openspendingjs-<version>.min.js (minified version of the above file)

The version number in package.json should of course be update for new releases.

### Don't Have Such a Recent Node.js Version?

When developing it's good to set up virtual environments to manage dependencies instead of installing them into your system (and therefore possibly breaking other projects you're working on).

One way to create a virtual environment for Node.js is to use [nodeenv](https://github.com/ekalinin/nodeenv). It can be installed in a python environment (using python's [virtualenv](http://www.virtualenv.org/)).
