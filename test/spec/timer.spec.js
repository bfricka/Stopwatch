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
    timer.on('start', function(){
      startFired = true;
    });
    timer.start();

    expect(startFired).toBe(true);
  });
});