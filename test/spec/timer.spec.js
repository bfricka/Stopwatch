/* jshint undef: false */

describe('Timer defaults', function(){
  var timer;

  beforeEach(function(){
    timer = new Timer();
  });

  it('should be an instance of Timer', function(){
    var isInstance = timer instanceof Timer;
    expect(isInstance).toEqual(true);
  });

  it('should start at 0', function(){
    expect(timer.getCurrentTime()).toEqual(0);
  });

  it('should have a default time of 5m (300 seconds)', function() {
    expect(timer.getMaxTime()).toEqual(300);
  });

  it('should fire a start event when started', function(){
    var startFired = false;
    timer.on('start', function(){ startFired = true; });
    timer.start();

    expect(startFired).toBe(true);
  });

  it('should fire a stop event when stopped', function(){
    var stopFired = false;
    timer.on('stop', function(){ stopFired = true; });
    timer.start();
    timer.stop();

    expect(stopFired).toBe(true);
  });

  it('should fire a pause event', function(){
    var pauseFired = false;
    timer.on('pause', function(){ pauseFired = true; });
    timer.start();
    timer.pause();

    expect(pauseFired).toBe(true);
  });

  it('should fire a restart event but not a start event', function(){
    var restartFired = false
    , startFired = false;

    timer.on('restart', function(){ restartFired = true; });
    timer.on('start', function(){ startFired = true; });

    timer.restart();

    expect(restartFired).toBe(true);
    expect(startFired).toBe(false);
  });
});

describe('Timer parseTime', function(){
  // Use a single instance and just place with parseTime
  var timer = new Timer();

  it('should parse seconds correctly', function(){
    timer.parseTime('5s');
    expect(timer.getMaxTime()).toEqual(5);
  });

  it('should parse minutes correctly', function(){
    timer.parseTime('2m');
    expect(timer.getMaxTime()).toEqual(120);
  });

  it('should parse hours correctly', function(){
    timer.parseTime('1h');
    expect(timer.getMaxTime()).toEqual(3600);
  });

  it('should also parse floats correctly', function(){
    timer.parseTime('0.5h');
    expect(timer.getMaxTime()).toEqual(1800);
  });
});

describe('Timer behavior', function(){
  var timerCallback;

  beforeEach(function(){
    timerCallback = jasmine.createSpy('timerCallback');
    jasmine.Clock.useMock();
  });

  it('should stop at maxTime and fire callback', function(){
    var timer = new Timer('5s');

    timer.on('stop', function(){ timerCallback(); });
    expect(timerCallback).not.toHaveBeenCalled();

    timer.start();
    // Tick 5 seconds
    jasmine.Clock.tick(5000);

    expect(timerCallback).toHaveBeenCalled();
  });
});