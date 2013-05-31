module.exports = function(grunt) {

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
	    options: {
		separator: ';'
	    },
	    js: {
		src: [
		    // Add requirements manually so unused can be removed later
		    'lib/vendor/raphael-min.js',
		    'lib/vendor/chroma.js',
		    'lib/vendor/kartograph/kartograph.min.js',
		    'lib/vendor/underscore.js',
		    'lib/vendor/accounting.js',
		    'lib/vendor/thejit-2.js',
		    // Source files for openspendingjs' utilisation library
		    'src/utils/*.js',
		    // Source files for openspendingjs' jquery widgets
		    'src/visualisations/*.js'
		],
		dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
	    },
	    css: {
		src: ['src/css/*.css'],
		dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.css'
	    }
	},
	min: {
	    js: {
		src: ['<%= concat.js.dest %>'],
		dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
	    }
	},
	cssmin : {
	    css: {
		src: ['<%= concat.css.dest %>'],
		dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.css'
	    }
	}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-yui-compressor');

    grunt.registerTask('default', ['concat', 'min', 'cssmin']);
};
