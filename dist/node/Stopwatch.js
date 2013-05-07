/** stopwatch-emitter - v0.0.3 - https://github.com/brian-frichette/Stopwatch
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

  var Stopwatch = (function(_super){
    _extends(Stopwatch, _super);

    function Stopwatch(maxTime) {
      // Set defaults
      if (maxTime == null) maxTime = '5m';
      this.currentTime = 0;
      this._stopEmitted = false;
      this._running = false;

      this.parseTime(maxTime);
      this._setupEvents();
    }

    var proto = Stopwatch.prototype;

    proto.parseTime = function(time) {
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

    proto._setupEvents = function() {
      var self = this;
      this.on('stop', function(){ self._stopEmitted = true; });

      var stopCb = function() { self._stopEmitted = false; };
      this.on('start', stopCb);
      this.on('pause', stopCb);
      this.on('restart', stopCb);
    };

    proto.tick = function() {
      var self = this;

      if (self.currentTime >= self.maxTime) {
        if (!self._stopEmitted) self.emit('stop');
        self._running = false;
        return;
      }

      if (!self._running) return;

      self.emit('tick');

      setTimeout(function(){
        self.currentTime++;
        self.tick();
      }, 1000);
    };

    proto.pause = function() {
      this._running = false;
      this.emit('pause');
    };

    proto.stop = function() {
      this._running = false;
      this.currentTime = 0;
      this.emit('stop');
    };

    proto.restart = function() {
      this.currentTime = 0;
      this.start(false);
      this.emit('restart');
    };

    proto.start = function(emit) {
      if (emit == null) emit = true;
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