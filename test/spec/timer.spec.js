/* jshint undef: false */

describe('Stopwatch defaults', function(){
  var stopwatch;

  beforeEach(function(){
    stopwatch = new Stopwatch();
  });

  it('should be an instance of Stopwatch', function(){
    var isInstance = stopwatch instanceof Stopwatch;
    expect(isInstance).toEqual(true);
  });

  it('should start at 0', function(){
    expect(stopwatch.getCurrentTime()).toEqual(0);
  });

  it('should have a default time of 5m (300 seconds)', function() {
    expect(stopwatch.getMaxTime()).toEqual(300);
  });

  it('should fire a start event when started', function(){
    var startFired = false;
    stopwatch.on('start', function(){ startFired = true; });
    stopwatch.start();

    expect(startFired).toBe(true);
  });

  it('should fire a stop event when stopped', function(){
    var stopFired = false;
    stopwatch.on('stop', function(){ stopFired = true; });
    stopwatch.start();
    stopwatch.stop();

    expect(stopFired).toBe(true);
  });

  it('should fire a pause event', function(){
    var pauseFired = false;
    stopwatch.on('pause', function(){ pauseFired = true; });
    stopwatch.start();
    stopwatch.pause();

    expect(pauseFired).toBe(true);
  });

  it('should fire a restart event but not a start event', function(){
    var restartFired = false
    , startFired = false;

    stopwatch.on('restart', function(){ restartFired = true; });
    stopwatch.on('start', function(){ startFired = true; });

    stopwatch.restart();

    expect(restartFired).toBe(true);
    expect(startFired).toBe(false);
  });
});

describe('Stopwatch parseTime', function(){
  // Use a single instance and just place with parseTime
  var stopwatch = new Stopwatch();

  it('should parse seconds correctly', function(){
    stopwatch.parseTime('5s');
    expect(stopwatch.getMaxTime()).toEqual(5);
  });

  it('should parse minutes correctly', function(){
    stopwatch.parseTime('2m');
    expect(stopwatch.getMaxTime()).toEqual(120);
  });

  it('should parse hours correctly', function(){
    stopwatch.parseTime('1h');
    expect(stopwatch.getMaxTime()).toEqual(3600);
  });

  it('should also parse floats correctly', function(){
    stopwatch.parseTime('0.5h');
    expect(stopwatch.getMaxTime()).toEqual(1800);
  });
});

describe('Stopwatch behavior', function(){
  var stopwatchCallback;

  beforeEach(function(){
    stopwatchCallback = jasmine.createSpy('stopwatchCallback');
    jasmine.Clock.useMock();
  });

  it('should stop at maxTime and fire callback', function(){
    var stopwatch = new Stopwatch('5s');

    stopwatch.on('stop', function(){ stopwatchCallback(); });
    expect(stopwatchCallback).not.toHaveBeenCalled();

    stopwatch.start();
    // Tick 5 seconds
    jasmine.Clock.tick(5000);

    expect(stopwatchCallback).toHaveBeenCalled();
  });

  it('should call tick callback correctly', function(){
    var totalTicks = 0;
    var stopwatch = new Stopwatch('5s');

    stopwatch.on('tick', function(){
      totalTicks++;
    });

    stopwatch.start();

    jasmine.Clock.tick(5000);
    expect(totalTicks).toEqual(5);
  });

  it ('should not emit "stop" unless currently running', function(){
    var stopCalled = 0;
    var stopwatch = new Stopwatch('5s');

    stopwatch.on('stop', function(){
      stopCalled++;
    });

    stopwatch.start();
    jasmine.Clock.tick(1000);
    stopwatch.stop();
    stopwatch.stop();

    expect(stopCalled).toEqual(1);
  });

  it('should only emit "stop" once when method is called and once when timer runs out', function(){
    var stopCalled = 0;
    var stopwatch = new Stopwatch('5s');

    stopwatch.on('stop', function(){
      stopCalled++;
    });

    stopwatch.start();
    jasmine.Clock.tick(4000);
    stopwatch.stop();

    expect(stopCalled).toEqual(1);

    stopwatch.restart();
    jasmine.Clock.tick(5000);

    expect(stopCalled).toEqual(2);
  });
});

describe('Stopwatch getters and booleans', function() {
  var stopwatch;

  beforeEach(function(){
    stopwatch = new Stopwatch('60s');
    jasmine.Clock.useMock();
  });

  it('should report the correct getters for start, max, and remaining', function(){
    stopwatch.start();
    jasmine.Clock.tick(5000);

    expect(stopwatch.getCurrentTime()).toEqual(5);
    expect(stopwatch.getRemainingTime()).toEqual(55);
    expect(stopwatch.getMaxTime()).toEqual(60);
  });

  it('should correctly report if it is running or not', function(){
    expect(stopwatch.isRunning()).toBe(false);

    stopwatch.start();
    expect(stopwatch.isRunning()).toBe(true);
  });

  it('should correctly report if is not running when paused', function(){
    expect(stopwatch.isRunning()).toBe(false);

    stopwatch.start();
    jasmine.Clock.tick(5000);
    stopwatch.pause();

    expect(stopwatch.isRunning()).toBe(false);
  });

  it('should correctly report if it not running when stopped', function(){
    stopwatch.start();
    jasmine.Clock.tick(5000);
    stopwatch.stop();
    expect(stopwatch.isRunning()).toBe(false);

    stopwatch.restart();
    jasmine.Clock.tick(60000);
    expect(stopwatch.isRunning()).toBe(false);
  });

  it('should ignore additional "start" calls', function(){
    stopwatch.start();
    jasmine.Clock.tick(1000);
    stopwatch.start();
    stopwatch.start();
    expect(stopwatch.getCurrentTime()).toEqual(1);
  });

  it('should clear any queued timeouts when "stop" or "pause" is called', function(){
    stopwatch.start();
    jasmine.Clock.tick(1000);
    stopwatch.stop();
    expect(stopwatch.getCurrentTime()).toEqual(0);

    stopwatch.start();
    jasmine.Clock.tick(1000);
    stopwatch.pause();
    expect(stopwatch.getCurrentTime()).toEqual(1);
  });

  it('should clear any timeouts when "restart" is called', function(){
    stopwatch.start();
    jasmine.Clock.tick(1000);
    stopwatch.restart();
    expect(stopwatch.getCurrentTime()).toEqual(0);

    jasmine.Clock.tick(5000);
    expect(stopwatch.getCurrentTime()).toEqual(5);
  });
});