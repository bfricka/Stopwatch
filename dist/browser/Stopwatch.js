/** stopwatch-emitter - v0.0.4 - https://github.com/brian-frichette/Stopwatch
  * Copyright (c) 2014 Brian Frichette. All rights reserved.
  * Licensed MIT - http://opensource.org/licenses/MIT
  *
  * EventEmitter - git.io/ee
  * Oliver Caldwell
  * MIT license
  */
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

  var Stopwatch = (function(_super){
    _extends(Stopwatch, _super);

    function Stopwatch(maxTime) {
      // Set defaults
      if (maxTime == null) maxTime = '5m';
      this.currentTime = 0;
      this._stopEmitted = false;
      this._running = false;
      this.toQ = [];

      this.parseTime(maxTime);
      this._setupEvents();
    }

    var proto = Stopwatch.prototype;

    // Translate strings into seconds and set maxTime
    proto.parseTime = function(time) {
      // Create an override for numbers. We'll expect seconds.
      if (!isNaN(time)) return this.maxTime = time;

      time = time.toString().match(/([\d\.]+)(\w{1})/);

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
    };

    // Setup some instance events
    proto._setupEvents = function() {
      var self = this;

      // Stop emitted tells us we specifically called stop so the we don't
      // emit twice.
      self.on('stop', function(){ self._stopEmitted = true; self.clear(); });

      // Make sure to toggle stopEmitted we any other event fires
      // Also, clear any timeouts if we are already running.
      var stopCb = function() {
        self._stopEmitted = false;
        if (self._running) self.clear();
      };

      self.on('start', stopCb);
      self.on('pause', stopCb);
      self.on('restart', stopCb);
    };

    proto.tick = function() {
      var self = this;

      if (self.currentTime >= self.maxTime) {
        if (!self._stopEmitted) self.emit('stop'); // If we reach the end
        self._running = false; // Make sure we're not running and return
        return;
      }

      // Make sure nothing naughty gets through
      if (!self._running) return;

      // Emit the tick
      self.emit('tick');

      // Store the timeout so we can clear it later if necessary
      var tO = setTimeout(function(){
        self.currentTime++;
        self.tick();
      }, 1000);

      // Push to timeout queue
      self.toQ.push(tO);
    };

    // Clear the timeout queue
    proto.clear = function() {
      var q = this.toQ;

      while(q.length) {
        clearTimeout(q[q.length - 1]);
        q.pop();
      }
    };

    proto.pause = function() {
      if (!this._running) return;
      this._running = false;
      this.emit('pause');
    };

    proto.stop = function() {
      if (!this._running) return;
      this._running = false;
      this.currentTime = 0;
      this.emit('stop');
    };

    proto.restart = function() {
      this.currentTime = 0;
      this.emit('restart');
      this.start(false);
    };

    proto.start = function(emit) {
      if (emit == null) emit = true;
      if ((this._running && emit) || this.currentTime >= this.maxTime) return;
      if (emit) this.emit('start');
      this._running = true;
      this.tick();
    };

    proto.getCurrentTime = function() {
      return this.currentTime;
    };

    proto.getRemainingTime = function() {
      return this.maxTime - this.currentTime;
    };

    proto.getMaxTime = function() {
      return this.maxTime;
    };

    proto.isRunning = function() {
      return !!this._running;
    };

    return Stopwatch;
  }(EventEmitter));

  exports.Stopwatch = Stopwatch;
}(this));