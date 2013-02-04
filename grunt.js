module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		cancompile: {
			dist: {
				// Compile all mustache files
				src: 'views/*.mustache',
				// Save to views.production.js
				out: 'js/views.production.js'
			}
		},
		concat: {
			dist: {
				src: [
					'<banner:meta.banner>', // Banner
					'js/lib/can.jquery.js',
					'js/lib/can.view.mustache.js',
					'js/lib/jquery.base64.js',
					'js/app/models.js',
					'js/app/app.js'
				],
				dest: 'js/production.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: 'js/production.min.js'
			}
		},
		watch: {
			files: ['js/app/app.js', 'js/app/models.js', 'views/*.mustache'],
			tasks: ['default']
		}
	});

	grunt.loadNpmTasks('can-compile');

	// Default task.
	grunt.registerTask('default', 'cancompile concat min');

};