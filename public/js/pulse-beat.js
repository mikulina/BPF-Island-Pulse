function PulseBeat() {
  var chartInterval = "";
  var currentChart = 0;
  var chartObjects = [];

  this.addChart = function(chart){
    chartObjects.push(chart);
  };

  this.init = function() {
    chartObjects[currentChart].init();
    this.switch(); // every 30 seconds switch chart
  };

  // Switch Chart
  this.switch = function() {
    if (chartInterval !== "") {
      return;
    }
    chartInterval = setInterval(function() {
      if (currentChart === chartObjects.length - 1) {
        currentChart = 0;
        chartObjects[currentChart].init();
      } else {
        currentChart++;
        chartObjects[currentChart].init();
      }
      pulseBeat.update();
    }, 15000);
  };

  this.forceSwitch = function() {
    clearInterval(chartInterval);
    chartInterval = "";

    if (currentChart === chartObjects.length - 1) {
      currentChart = 0;
      chartObjects[currentChart].init();
    } else {
      currentChart++;
      chartObjects[currentChart].init();
    }
    this.switch();
  };

  // Update Chart
  this.update = function() {
    setTimeout(function() {
      chartObjects[currentChart].update();
    }, 7500);
  };
}

var pulseBeat = new PulseBeat();

$(function() {
  pulseBeat.init();
});
