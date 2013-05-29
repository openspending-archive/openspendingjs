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
		    'lib/vendor/chroma.pack.min.js',
		    'lib/vendor/kartograph/kartograph.min.js',
		    // Source files for openspending
		    'src/*.js'
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