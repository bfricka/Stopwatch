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
});