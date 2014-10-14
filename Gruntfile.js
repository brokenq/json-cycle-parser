module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['dist/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    coffee: {
      compileBare: {
        options: {
          bare: true
        },
        files: {
          'dist/<%= pkg.name %>.js': 'app/src/<%= pkg.name %>.coffee' // 1:1 compile
        }
      },
      glob_to_multiple: {
        expand: true,
        flatten: true,
        cwd: 'app/src/',
        src: ['*.coffee'],
        dest: 'dist/',
        ext: '.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['coffee', 'concat', 'uglify']);

};