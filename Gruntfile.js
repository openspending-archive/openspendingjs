module.exports = function(grunt) {

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
	    options: {
		separator: ';'
	    },
	    dist: {
		src: [
		    // Add requirements manually so unused can be removed later
		    'lib/vendor/raphael-min.js',
		    'lib/vendor/chroma.js',
		    'lib/vendor/kartograph/kartograph.min.js',
		    'lib/vendor/accounting.js',
		    // Source files for openspendingjs' utilisation library
		    'src/utils/*.js',
		    // Source files for openspendingjs' jquery widgets
		    'src/visualisations/*.js'
		],
		dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
	    }
	},
	uglify: {
	    options: {
		banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
	    },
	    dist: {
		files: {
		    'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['<%= concat.dist.dest %>']
		}
	    }
	}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);
};
