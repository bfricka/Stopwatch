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
    this._currentTime = 0;
    this._stopEmitted = false;
    this._running = false;
    this._paused = false;
    this._toQ = [];
    this._maxTime = parseTime(maxTime);

    this._setupEvents();
  }

  // Setup some instance events
  _setupEvents() {
    // Stop emitted tells us we specifically called stop
    // so the we don't emit twice.
    this.on('stop', () => {
      this._stopEmitted = true;
      this.clear();
    });

    // Make sure to toggle stopEmitted we any other event fires
    // Also, clear any timeouts if we are already running.
    var stopCb = () => {
      this._stopEmitted = false;

      if (this._running) {
        this.clear();
      }
    };

    this.on('start', stopCb);
    this.on('pause', stopCb);
    this.on('restart', stopCb);
  }

  // Clear the timeout queue
  clear() {
    var q = this._toQ;

    while(q.length) {
      clearTimeout(q[q.length - 1]);
      q.pop();
    }
  }

  pause() {
    if (!this._running) return;
    this._running = false;
    this._paused = true;
    this.emit('pause');
  }

  stop() {
    if (!this._running && !this._paused) {
      return;
    }

    this._running = false;
    this._currentTime = 0;

    this.emit('stop');
  }

  restart() {
    this._currentTime = 0;

    this.emit('restart');
    this.start(false);
  }

  start(emit = true) {
    if ((this._running && emit) || this._currentTime >= this._maxTime) return;
    if (emit) this.emit('start');
    this._running = true;
    this.tick();
  }

  tick() {
    if (this._currentTime >= this._maxTime) {
      if (!this._stopEmitted) this.emit('stop'); // If we reach the end
      this._running = false; // Make sure we're not running and return
      return;
    }

    // Make sure nothing naughty gets through
    if (!this._running) return;

    // Emit the tick
    this.emit('tick');

    // Store the timeout so we can clear it later if necessary
    var tO = setTimeout(() => {
      this._currentTime++;
      this.tick();
    }, 1000);

    // Push to timeout queue
    this._toQ.push(tO);
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

  isPaused() {
    return this._paused;
  }

  isRunning() {
    return this._running;
  }
}
