'use strict';

var request = require('request');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    bowercopy: {
      libs: {
        options: {
          destPrefix: 'public/js'
        },
        files: {
          'moment.js': 'moment/moment.js',
          'moment-timezone.js': 'moment-timezone/builds/moment-timezone-with-data.js'
        }
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'app/*.js',
          'app/classes/*.js',
          'app/models/*.js',
          'app.js',
          'routes/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      js: {
        files: ['public/js/*.js'],
        options: {
          livereload: reloadPort
        }
      },
      css: {
        files: ['public/css/*.css'],
        tasks: ['compass'],
        options: {
          livereload: reloadPort
        }
      },
      jade: {
        files: ['views/*.jade'],
        options: {
          livereload: reloadPort
        }
      }
    },
    compass: {
      dist: {
        options: {
          sassDir: 'public/css',
          cssDir: 'public/css',
          environment: 'development',
          outputStyle: 'expanded',
          force: true,
          watch: true,
          require: 'zurb-foundation'
        }
      }
    },
    fingerprint: {
      assets: {
        src: [
          'public/js/*.js',
          'public/css/*.css'
        ],
        filename: 'config/fingerprint.js',
        template: "module.exports = '<%= fingerprint %>';"
      }
    }
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.');
          } else {
            grunt.log.error('Unable to make a delayed live reload.');
          }
          done(reloaded);
        });
    }, 500);
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-fingerprint');
  grunt.loadNpmTasks('grunt-bowercopy');

  grunt.registerTask('default', ['develop', 'bowercopy', 'fingerprint', 'watch']);
};
