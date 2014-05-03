module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
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
					// 'js/lib/can.jquery.js',
					'js/lib/base64.js',
					'js/lib/marked.js',
					// 'js/lib/can.view.mustache.js',
					'js/lib/jquery.tweet.js',
					'js/lib/bootstrap-transition.js',
					'js/lib/bootstrap-collapse.js',
					'js/lib/bootstrap-tooltip.js',
					'js/app/models.js',
					'js/app/app.js'
				],
				dest: 'js/production.js'
			}
		},
		uglify: {
			files: {
				'js/production.min.js': ['js/production.js']
			}
		},
		watch: {
			files: ['js/app/app.js', 'js/app/models.js', 'views/*.mustache'],
			tasks: ['default']
		}
	});

	grunt.loadNpmTasks('can-compile');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

	// Default task.
	grunt.registerTask('default', ['cancompile', 'concat', 'uglify']);

};