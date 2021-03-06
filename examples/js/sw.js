/* global angular */

var app = angular.module('Stopwatch', []);

app.run([
  '$rootScope'
  , function($rootScope) {
    $rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase
        , fn = fn || function() {};

      if (phase === '$apply' || phase === '$digest') {
        fn();
      } else {
        this.$apply(fn);
      }
    };
  }
]);

app.controller('StopwatchCtrl', [
  '$scope', '$timeout'
  , function($scope, $timeout) {
    $scope.timeUnits = [
        {'value': 's', 'name': 'Seconds'}
      , {'value': 'm', 'name': 'Minutes'}
      , {'value': 'h', 'name': 'Hours'}
    ];

    $scope.timeUnit = $scope.timeUnits[0].value;
    $scope.timeValue = 5;
    $scope.stopwatch = createStopwatch();

    $scope.refreshStopwatch = function() {
      $scope.stopwatch = createStopwatch();
    };

    $scope.timeLabel = function() {
      var len = $scope.timeUnits.length
        , i = 0;

      while (i < len) {
        var unit = $scope.timeUnits[i];
        if (unit.value === $scope.timeUnit) return unit.name;
        i++;
      }
    };

    $scope.currentTime = function() {
      return $scope.stopwatch.getCurrentTime();
    };

    $scope.isRunning = function() {
      return $scope.stopwatch.isRunning();
    };

    $scope.start = function() {
      $scope.stopwatch.start();
    };

    $scope.startDisabled = function() {
      return ($scope.stopwatch.getCurrentTime() >= $scope.stopwatch.getMaxTime());
    };

    function emitAddClass(type) {
      var method = type + "Fired";
      $scope[method] = true;

      $timeout(function(){
        $scope[method] = false;
      }, 400);
    }

    function createStopwatch() {
      var time = "" + $scope.timeValue + $scope.timeUnit;
      var stopwatch = new Stopwatch(time);

      stopwatch.on('start', function(){ $scope.safeApply(emitAddClass('start')); });
      stopwatch.on('stop', function(){ $scope.safeApply(emitAddClass('stop')); });
      stopwatch.on('pause', function(){ $scope.safeApply(emitAddClass('pause')); });
      stopwatch.on('restart', function(){ $scope.safeApply(emitAddClass('restart')); });
      stopwatch.on('tick', function(){ $scope.safeApply(); });

      return stopwatch;
    }
  }
]);