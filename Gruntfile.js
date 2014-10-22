var spawn = require('child_process').spawn;

module.exports = function(grunt) {
  // grunt.loadNpmTasks('grunt-karma');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-traceur');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    paths: {
      src: './src',
      dist: './dist',
      test: './test'
    },

    traceur: {
      options: {
        experimental: true,
        blockBinding: true,
        includeRuntime: true,
        modules: 'commonjs'
      },

      js: {
        files: [{
          src: './src/Stopwatch.js',
          dest: './dist/Stopwatch.js'
        }]
      }
    },

    watch: {
      js: {
        files: [
          "<%= paths.src %>/Stopwatch.js"
        ],

        tasks: [
          "jshint",
          "traceur",
          "mocha"
        ]
      },

      test: {
        files: [ "<%= paths.test %>/**/*.spec.js" ],
        tasks: [ "mocha" ]
      }
    },

    jshint: {
      options: { jshintrc: "./.jshintrc" },
      all: [
        "<%= paths.src %>/Stopwatch.js"
      ]
    }
  });

  grunt.registerTask('mocha', function() {
    var done = this.async();
    spawn('mocha', [], { stdio: 'inherit' }).on('close', done);
  });

  grunt.registerTask('default', [
    "jshint",
    "traceur",
    "mocha"
  ]);
};
