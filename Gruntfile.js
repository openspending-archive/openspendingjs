module.exports = function(grunt) {

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
	    js: {
		options: {
		    separator: ';'
		},
		src: [
		    // Add requirements manually so unused can be removed later
		    'lib/vendor/raphael-min.js',
		    'lib/vendor/chroma.js',
		    'lib/vendor/kartograph/kartograph.min.js',
		    'lib/vendor/underscore.js',
		    'lib/vendor/accounting.js',
		    'lib/vendor/thejit-2.js',
            'lib/vendor/d3.v3.js',
                    'lib/vendor/vis4.js',
                    'lib/vendor/jquery.history.js',
                    'lib/vendor/Tween.js',
                    'lib/vendor/bubbletree/2.0/bubbletree.openspending.js',
                    'lib/vendor/jquery.qtip.min.js',
		    // Source files for openspendingjs' utilisation library
		    'src/utils/*.js',
		    // Source files for openspendingjs' jquery widgets
		    'src/visualisations/*.js'
		],
		dest: 'build/<%= pkg.version %>/<%= pkg.shortname %>.js'
	    },
	    css: {
		src: ['src/css/*.css'],
		dest: 'build/<%= pkg.version %>/<%= pkg.shortname %>.css'
	    }
	},
	min: {
	    options: {
		report: grunt.option('report') ? 'gzip' : false
	    },
	    js: {
		src: ['<%= concat.js.dest %>'],
		dest: 'build/<%= pkg.version %>/<%= pkg.shortname %>.min.js'
	    }
	},
	cssmin : {
	    options: {
		report: grunt.option('report') ? 'gzip' : false
	    },
	    css: {
		src: ['<%= concat.css.dest %>'],
		dest: 'build/<%= pkg.version %>/<%= pkg.shortname %>.min.css'
	    }
	},
        copy: {
            svg: {
                files: [
                    { expand: true, src: ['svg/**.svg'],
                      cwd: 'src/',
                      dest: 'build/<%= pkg.version %>/icons/' }
                ]
            }
        },
        compress: {
            tarball: {
                options: {
                    archive: 'releases/<%= pkg.name %>-<%= pkg.version %>.tgz',
                },
                expand: true,
                src: ['<%= pkg.version %>/**'], 
                cwd: 'build/',
                dest: '<%= pkg.name %>'
            },
            zipfile: {
                options: {
                    archive: 'releases/<%= pkg.name %>-<%= pkg.version %>.zip',
                },
                expand: true,
                src: ['<%= pkg.version %>/**'], 
                cwd: 'build/',
                dest: '<%= pkg.name %>'
            }
        },
        clean: ["build/"]
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-yui-compressor');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['concat', 'min', 'cssmin', 'copy']);
    grunt.registerTask('release', ['concat', 'min', 'cssmin', 
                                   'copy', 'compress', 'clean']);
};
