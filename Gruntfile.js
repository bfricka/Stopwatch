var karma = require('karma');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')

    , meta: {
      banner: [
          "/** <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.homepage %>\n"
        , "  * Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>. All rights reserved.\n"
        , "  * Licensed <%= _.pluck(pkg.licenses, 'type')[0] %> - <%= _.pluck(pkg.licenses, 'url')[0] %>\n"
        , "  *\n"
        , "  * EventEmitter - git.io/ee\n"
        , "  * Oliver Caldwell\n"
        , "  * MIT license\n"
        , "  */\n"
      ].join('')
    }

    , paths: {
        lib: './lib'
      , dist: './dist'
      , test: './test'
    }

    , concat: {
      app: {
        src: [
            "<%= paths.lib %>/EventEmitter/EventEmitter.js"
          , "<%= paths.lib %>/Timer.js"
        ]

        , dest: "<%= paths.dist %>/Timer.js"
      }

      , build: {
          options: { banner: "<%= meta.banner %>" }
        , files: {
            "<%= paths.dist %>/Timer.js": [ "<%= paths.dist %>/Timer.js" ]
          , "<%= paths.dist %>/Timer.min.js": [ "<%= paths.dist %>/Timer.min.js" ]
        }
      }
    }

    , watch: {
      js: {
          files: [
            "<%= paths.lib %>/EventEmitter/EventEmitter.js"
            , "<%= paths.lib %>/Timer.js"
          ]
        , tasks: [ "jshint", "uglify", "test" ]
      }

      , test: {
          files: [ "<%= paths.test %>/**/*.spec.js" ]
        , tasks: [ "test" ]
      }
    }

    , uglify: {
      app: {
        options: {
          // Default compress options. Listed for reference.
          compress: {
            loops        : true
            , unused       : true
            , unsafe       : true
            , cascade      : true
            , warnings     : true
            , booleans     : true
            , evaluate     : true
            , dead_code    : true
            , join_vars    : true
            , if_return    : true
            , sequences    : true
            , hoist_vars   : false
            , hoist_funs   : true
            , properties   : true
            , comparisons  : true
            , conditionals : true
          }

          , mangle: {
            except: [ "Timer", "EventEmitter" ]
          }
        }
        , files: {
          "<%= paths.dist %>/Timer.min.js": [ "<%= paths.dist %>/Timer.js" ]
        }

      }
    }

    , jshint: {
        options: { jshintrc: "./.jshintrc" }
      , all: [
        "<%= paths.lib %>/EventEmitter/EventEmitter.js"
        , "<%= paths.lib %>/Timer.js"
      ]
    }
  });

  grunt.registerTask('default', [
    "concat:app"
    , "jshint"
    , "uglify"
    , "concat:build"
    , "test"
  ]);

  grunt.registerTask('test', 'Run tests in Karma', function(){
    console.log("test");
  });
};