// Karma configuration
// Generated on Mon Apr 20 2015 13:03:10 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha','sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      "lib/vendor/jquery.js",
      "lib/vendor/underscore.js",
      "lib/vendor/backbone.js",
      "lib/vendor/accounting.js",
      "lib/boot.js",
      "lib/aggregator.js",
      "lib/datastore.js",
      "lib/main.js",
      "lib/model.js",
      "lib/utils/gdocs.js",
      "lib/utils/tree.js",
      "lib/utils/utils.js",
      "lib/widgets.js",
      'tests/fixtures.js',
      'tests/**/*.coffee'
    ],


    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.coffee': ['coffee'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
