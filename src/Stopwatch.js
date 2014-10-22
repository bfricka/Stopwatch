var events = require('events');

// Translate strings into seconds and set maxTime
function parseTime(time) {
  // Create an override for numbers. We'll expect seconds.
  if (!isNaN(time)) {
    return time;
  }

  time = String(time).match(/([\d\.]+)(\w{1})/);

  var timeValue = parseFloat(time[1]);
  var timeInterval = time[2];

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

  return Math.round(timeValue);
}

export class Stopwatch extends events.EventEmitter {
  constructor (maxTime = '5m') {
    super();

    Object.defineProperties(this, {
      _paused: {
        writable: true,
        value: false
      },

      _running: {
        writable: true,
        value: false
      },

      _interval: {
        writable: true,
        value: null
      },

      _currentTime: {
        writable: true,
        value: 0
      },

      _stopEmitted: {
        writable: true,
        value: false
      },

      _maxTime: {
        writable: true,
        value: parseTime(maxTime)
      }
    });

    this._setupEvents();
  }

  // Setup some instance events
  _setupEvents() {
    // // Make sure to toggle stopEmitted we any other event fires
    // // Also, clear any timeouts if we are already running.
    var stopCb = () => {
      // this._stopEmitted = false;

      if (this._running) {
        clearInterval(this._interval);
      }
    };


    this.on('start', stopCb);
    this.on('restart', stopCb);
  }

  pause() {
    if (!this._running) {
      return;
    }

    this._running = false;
    this._paused = true;

    this.emit('pause');
  }

  stop() {
    if (this.isStopped()) {
      return;
    }

    this._running = this._paused = false;
    this._currentTime = 0;

    this.emit('stop');
    clearInterval(this._interval);
  }

  restart() {
    this._currentTime = 0;

    this.emit('restart');
    this.start(false);
  }

  start(emit = true) {
    if ((emit && this._running) || this.isFinished()) {
      return;
    }

    if (emit) {
      this.emit('start');
    }

    this._paused = false;
    this._running = true;

    this._interval = setInterval(() => {
      this._currentTime++;
      this.tick();
    }, 1000);

    this.tick();
  }

  tick() {
    if (this.isFinished()) {
      // If we reach the end
      this.emit('stop');

      // Make sure we're not running and return
      this._running = false;
      return;
    }

    // Make sure nothing naughty gets through
    if (!this._running) {
      return;
    }

    // Emit the tick
    this.emit('tick');
  }

  currentTime() {
    return this._currentTime;
  }

  remainingTime() {
    return this._maxTime - this._currentTime;
  }

  maxTime(time) {
    if (time) {
      this._maxTime = parseTime(time);
    }

    return this._maxTime;
  }

  isFinished() {
    return this._currentTime >= this._maxTime;
  }

  isPaused() {
    return this._paused;
  }

  isRunning() {
    return this._running;
  }

  isStopped() {
    return !this._running && !this._paused;
  }
}
