var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Stopwatch = require('../dist/Stopwatch').Stopwatch;

chai.use(sinonChai);
var expect = chai.expect;

describe('Stopwatch:', function() {
  var stopwatch;
  var clock;

  beforeEach(function(){
    stopwatch = new Stopwatch();
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  describe('Defaults:', function() {
    it('should be an instance of Stopwatch', function () {
      expect(stopwatch).to.be.instanceof(Stopwatch);
    });

    it('should start at 0', function() {
      expect(stopwatch.currentTime()).to.equal(0);
    });

    it('should have a default time of 5m (300 seconds)', function() {
      expect(stopwatch.maxTime()).to.equal(300);
    });

    it('should fire a start event when started', function(){
      var startHandler = sinon.spy();

      stopwatch.on('start', startHandler);
      stopwatch.start();

      expect(startHandler).to.have.been.calledOnce;
    });

    it('should fire a stop event when stopped', function(){
      var stopHandler = sinon.spy();
      stopwatch.on('stop', stopHandler);
      stopwatch.start();
      stopwatch.stop();

      expect(stopHandler).to.have.been.calledOnce;
    });

    it('should fire a pause event', function(){
      var pauseHandler = sinon.spy();
      stopwatch.on('pause', pauseHandler);
      stopwatch.start();
      stopwatch.pause();

      expect(pauseHandler).to.have.been.calledOnce;
    });

    it('should fire a restart event but not a start event', function(){
      var startHandler = sinon.spy();
      var restartHandler = sinon.spy();

      stopwatch.on('start', startHandler);
      stopwatch.on('restart', restartHandler);

      stopwatch.restart();

      expect(startHandler).not.to.have.been.called;
      expect(restartHandler).to.have.been.calledOnce;
    });
  });

  describe('Time parsing:', function() {
    it('should parse seconds correctly', function(){
      expect(stopwatch.maxTime('5s')).to.equal(5);
    });

    it('should parse minutes correctly', function(){
      expect(stopwatch.maxTime('2m')).to.equal(120);
    });

    it('should parse hours correctly', function(){
      expect(stopwatch.maxTime('1h')).to.equal(3600);
    });

    it('should parse floats correctly', function(){
      expect(stopwatch.maxTime('0.5s')).to.equal(1);
      expect(stopwatch.maxTime('0.5m')).to.equal(30);
      expect(stopwatch.maxTime('0.5h')).to.equal(1800);
    });
  });

  describe('Events:', function () {
    beforeEach(function() {
      stopwatch.maxTime('5s');
    });

    describe('Stopwatch#on("start")', function () {
      var startHandler;

      beforeEach(function () {
        startHandler = sinon.spy();
        stopwatch.on('start', startHandler);
      });

      it('should fire only once per transition between stopped/paused and start', function () {
        stopwatch.start();
        stopwatch.start();
        expect(startHandler).to.have.been.calledOnce;
      });

      it('should be fired from paused states', function () {
        stopwatch.start();
        stopwatch.pause();
        stopwatch.start();

        expect(startHandler).to.have.been.calledTwice;
      });

      it('should be fired from stopped states', function () {
        stopwatch.start();
        stopwatch.stop();
        stopwatch.start();

        expect(startHandler).to.have.been.calledTwice;
      });
    });

    describe('Stopwatch#on("stop")', function () {
      var stopHandler;

      beforeEach(function () {
        stopHandler = sinon.spy();
        stopwatch.on('stop', stopHandler);
      });

      it('should not fire unless stopwatch has been started', function () {
        stopwatch.stop();
        expect(stopHandler).not.to.have.been.called;
      });

      it('should only fire once per stoppage', function () {
        stopwatch.start();
        stopwatch.stop();
        stopwatch.stop();

        expect(stopHandler).to.have.been.calledOnce;
      });

      it('should stop even when paused', function () {
        stopwatch.start();
        stopwatch.pause();
        stopwatch.stop();

        expect(stopHandler).to.have.been.calledOnce;
      });

      it('should reset Stopwatch#currentTime', function () {
        stopwatch.start();
        clock.tick(1000);
        expect(stopwatch.currentTime()).to.equal(1);

        stopwatch.stop();
        expect(stopwatch.currentTime()).to.equal(0);
      });
    });

    describe('Stopwatch#on("pause")', function () {
      var pauseHandler;

      beforeEach(function () {
        pauseHandler = sinon.spy();
        stopwatch.on('pause', pauseHandler);
      });

      it('should not fire unless stopwatch has been started', function () {
        stopwatch.pause();
        expect(pauseHandler).not.to.have.been.called;
      });

      it('should not fire when stopped', function () {
        stopwatch.start();
        stopwatch.stop();
        stopwatch.pause();

        expect(pauseHandler).not.to.have.been.called;
      });

      it('should fire only once per pause', function () {
        stopwatch.start();
        stopwatch.pause();
        stopwatch.pause();
        expect(pauseHandler).to.have.been.calledOnce;

        stopwatch.start();
        stopwatch.pause();
        stopwatch.pause();
        expect(pauseHandler).to.have.been.calledTwice;
      });
    });

    describe('Stopwatch#on("tick")', function () {
      it('should call tick callback correctly', function() {
        var tickHandler = sinon.spy();

        stopwatch.on('tick', tickHandler);
        expect(tickHandler).not.to.have.been.called;

        stopwatch.start();
        expect(tickHandler).to.have.been.calledOnce;

        clock.tick(1000);
        expect(tickHandler).to.have.been.calledTwice;

        clock.tick(4000);
        expect(tickHandler).to.have.callCount(5);
      });
    });
  });

  describe('Behavior:', function() {
    beforeEach(function() {
      stopwatch.maxTime('5s');
    });

    it('should stop at maxTime', function(){
      var stopHandler = sinon.spy();

      stopwatch.on('stop', stopHandler);
      stopwatch.start();
      clock.tick(5000);

      expect(stopHandler).to.have.been.calledOnce;
    });

    // it('should clear any queued timeouts when "stop" or "pause" is called', function(){
    //   stopwatch.start();
    //   jasmine.Clock.tick(1000);
    //   stopwatch.stop();
    //   expect(stopwatch.getCurrentTime()).toEqual(0);

    //   stopwatch.start();
    //   jasmine.Clock.tick(1000);
    //   stopwatch.pause();
    //   expect(stopwatch.getCurrentTime()).toEqual(1);
    // });

    // it('should clear any timeouts when "restart" is called', function(){
    //   stopwatch.start();
    //   jasmine.Clock.tick(1000);
    //   stopwatch.restart();
    //   expect(stopwatch.getCurrentTime()).toEqual(0);

    //   jasmine.Clock.tick(5000);
    //   expect(stopwatch.getCurrentTime()).toEqual(5);
    // });
  });
});

// describe('Stopwatch getters and booleans', function() {
//   var stopwatch;

//   beforeEach(function(){
//     stopwatch = new Stopwatch('60s');
//     jasmine.Clock.useMock();
//   });

//   it('should report the correct getters for start, max, and remaining', function(){
//     stopwatch.start();
//     jasmine.Clock.tick(5000);

//     expect(stopwatch.getCurrentTime()).toEqual(5);
//     expect(stopwatch.getRemainingTime()).toEqual(55);
//     expect(stopwatch.getMaxTime()).toEqual(60);
//   });

//   it('should correctly report if it is running or not', function(){
//     expect(stopwatch.isRunning()).toBe(false);

//     stopwatch.start();
//     expect(stopwatch.isRunning()).toBe(true);
//   });

//   it('should correctly report if is not running when paused', function(){
//     expect(stopwatch.isRunning()).toBe(false);

//     stopwatch.start();
//     jasmine.Clock.tick(5000);
//     stopwatch.pause();

//     expect(stopwatch.isRunning()).toBe(false);
//   });

//   it('should correctly report if it not running when stopped', function(){
//     stopwatch.start();
//     jasmine.Clock.tick(5000);
//     stopwatch.stop();
//     expect(stopwatch.isRunning()).toBe(false);

//     stopwatch.restart();
//     jasmine.Clock.tick(60000);
//     expect(stopwatch.isRunning()).toBe(false);
//   });
// });
