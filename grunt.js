module.exports = function(grunt) {

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
    cancompile : {
      dist : {
        // Compile all mustache files
        src : 'templates/*.mustache',
        // Save to views.production.js
        out : 'views.production.js'
      }
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>', // Banner
          '<config:cancompile.dist.src>' // The compiled views
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('can-compile');

  // Default task.
  grunt.registerTask('default', 'cancompile concat min');

};