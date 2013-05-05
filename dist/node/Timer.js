/** stopwatch-emitter - v0.0.1 - https://github.com/brian-frichette/Timer
  * Copyright (c) 2013 Brian Frichette. All rights reserved.
  * Licensed MIT - http://opensource.org/licenses/MIT
  */
EventEmitter = require('events').EventEmitter;
/* global EventEmitter, Timer */

(function(exports){
  var hasProp = {}.hasOwnProperty
    , _extends = function(child, parent) {
      for (var key in parent) {
        if (hasProp.call(parent, key)) child[key] = parent[key];
      }

      function ctor() {
        this.constructor = child;
      }

      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };

  var Timer = (function(_super){
    _extends(Timer, _super);

    function Timer(maxTime) {
      if (maxTime == null) maxTime = '5m';
      this.currentTime = 0;
      this.parseTime(maxTime);
    }

    Timer.prototype = {
      parseTime: function(time) {
        time = time.toString.match(/([\d\.]+)(\w{1})/);

        var timeValue = parseFloat(time[1], 10)
          , timeInterval = time[2];

        switch (timeInterval) {
          case 's':
            timeValue *= 1;
            break;
          case 'm':
            timeValue *= 60;
            break;
          case 'h':
            timeValue *= 60 * 60;
        }
        this.maxTime = Math.round(timeValue);
      }

      , tick: function() {
        var self = this;

        if (self.currentTime >= self.maxTime) {
          self.emit('stop');
          return;
        }

        if (!self.running) {
          self.emit('pause');
          return;
        }

        setTimeout(function(){
          self.currentTime++;
          self.tick();
        }, 1000);
      }

      , pause: function() {
        this.running = false;
        this.emit('pause');
      }

      , stop: function() {
        this.running = false;
        this.currentTime = 0;
        this.emit('stop');
      }

      , restart: function() {
        this.currentTime = 0;
        this.start(false);
        this.emit('restart');
      }

      , start: function(emit) {
        if (emit == null) emit = true;
        if (emit) this.emit('start');
        this.running = true;
        this.tick();
      }
    };

    return Timer;
  }(EventEmitter));

  exports.Timer = Timer;
}(this));