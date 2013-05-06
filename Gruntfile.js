module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')

    , meta: {
      banner: (function(){
        var node = [
            "/** <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.homepage %>\n"
          , "  * Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>. All rights reserved.\n"
          , "  * Licensed <%= _.pluck(pkg.licenses, 'type')[0] %> - <%= _.pluck(pkg.licenses, 'url')[0] %>\n"
        ]
        , browser = node.concat([
            "  *\n"
          , "  * EventEmitter - git.io/ee\n"
          , "  * Oliver Caldwell\n"
          , "  * MIT license\n"
        ]);

        return {
            node: node.concat(["  */\n"]).join('')
          , browser: browser.concat(["  */\n"]).join('')
        };
      }())
    }

    , paths: {
        lib: './lib'
      , dist: './dist'
      , test: './test'
    }

    , concat: {
      app: {
        files: {
            "<%= paths.dist %>/node/Stopwatch.js": [ "<%= paths.lib %>/NodeEmitter.js", "<%= paths.lib %>/Stopwatch.js" ]
          , "<%= paths.dist %>/browser/Stopwatch.js": [ "<%= paths.lib %>/EventEmitter/EventEmitter.js", "<%= paths.lib %>/Stopwatch.js" ]
        }
      }

      , build_node: {
          options: { banner: "<%= meta.banner.node %>" }
        , files: {
          "<%= paths.dist %>/node/Stopwatch.js": [ "<%= paths.dist %>/node/Stopwatch.js" ]
        }
      }

      , build_browser: {
        options: {
            banner: "<%= meta.banner.browser %>"
            // Strip EventEmitter banner since we are manually re-adding it
          , process: function(src) {
            return src.replace(/(^|\n)\/([\*\s])+EventEmitter([\s\w\.\/\*-]+)([@\w\s]+)\*\//g, '');
          }
        }

        , files: {
            "<%= paths.dist %>/browser/Stopwatch.js": [ "<%= paths.dist %>/browser/Stopwatch.js" ]
          , "<%= paths.dist %>/browser/Stopwatch.min.js": [ "<%= paths.dist %>/browser/Stopwatch.min.js" ]
        }
      }
    }

    , watch: {
      js: {
          files: [
            "<%= paths.lib %>/EventEmitter/EventEmitter.js"
            , "<%= paths.lib %>/Stopwatch.js"
          ]
        , tasks: [ "concat:app", "jshint", "uglify", "karma:unit:run" ]
      }

      , test: {
          files: [ "<%= paths.test %>/**/*.spec.js" ]
        , tasks: [ "karma:unit:run" ]
      }
    }

    , uglify: {
      app: {
        options: {
          // Default compress options. Listed for reference.
          compress: {
            loops          : true
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
            except: [ "Stopwatch", "EventEmitter" ]
          }
        }
        , files: {
          "<%= paths.dist %>/browser/Stopwatch.min.js": [ "<%= paths.dist %>/browser/Stopwatch.js" ]
        }

      }
    }

    , jshint: {
        options: { jshintrc: "./.jshintrc" }
      , all: [
        "<%= paths.lib %>/EventEmitter/EventEmitter.js"
        , "<%= paths.lib %>/Stopwatch.js"
      ]
    }

    , karma: {
      unit: {
        configFile: '<%= paths.test %>/karma.conf.js'
        , runnerPort: 9999
        , autoWatch: false
        , browsers: ['Chrome']
      }
    }
  });

  grunt.registerTask('default', [
    "concat:app"
    , "jshint"
    , "uglify"
    , "concat:build_node"
    , "concat:build_browser"
    , "karma"
  ]);
};