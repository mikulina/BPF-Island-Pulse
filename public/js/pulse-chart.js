var isIos = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

var isSafari =
  !!navigator.userAgent.match(/safari/i) &&
  !navigator.userAgent.match(/chrome/i) &&
  typeof document.body.style.webkitFilter !== 'undefined' &&
  !window.chrome;

var isDolphinKiosk =
  !!navigator.userAgent.match(/android/i) &&
  !!navigator.userAgent.match(/gecko/i) &&
  !!navigator.userAgent.match(/safari/i) &&
  !navigator.userAgent.match(/chrome/i);

var isChrome =
  !!navigator.userAgent.match(/chrome/i) &&
  !!window.chrome;

// create SVG defs
var svgDefs = d3.select("body").append("svg")
    .attr("width", "0%")
    .attr("height", "0%");

// create Green Gradient
var greenGradient = svgDefs.append("svg:defs")
  .append("svg:linearGradient")
    .attr("id", "greenGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

greenGradient.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "#88EC4D")
    .attr("stop-opacity", 1);

greenGradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#01B4E3")
    .attr("stop-opacity", 1);

// create Red Gradient
var redGradient = svgDefs.append("svg:defs")
  .append("svg:linearGradient")
    .attr("id", "redGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

redGradient.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "#F91C1C")
    .attr("stop-opacity", 1);

redGradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#01B4E3")
    .attr("stop-opacity", 1);


/*DEFINE BASE CLASS FOR ALL CHARTS*/
function PulseChart(opts) {
  if(opts === undefined) return;

  this.title = opts['title'];
  this.url = opts['url'];
  this.key = opts['key'];
  this.type = opts['type'];
  this.template = opts['template'];
  this.container = opts['container'] || '.chart-slide';

  pulseBeat.addChart(this);
}

PulseChart.prototype.init = function(){
  this.subscribe();
};

PulseChart.prototype.update = function(){
  var storageKey = this.key,
      template = this.template,
      self = this;

  if (navigator.onLine) {
    d3.json(this.url, function(error, data) {
      self.redraw(data);

      // Update localStorage
      localStorage.setItem(storageKey, JSON.stringify(data));
    });
  } else {
    // if Offline get localStorage data in json format
    var json = JSON.parse(localStorage.getItem(storageKey));
    var data = json;

    self.redraw(data);
  }
};

PulseChart.prototype.draw = function(){};

PulseChart.prototype.redraw = function(){};

var Placeholder = function(opts) {
  if (!(this instanceof Placeholder)){
    return new Placeholder(opts);
  }
  Placeholder.prototype.constructor.call(this, opts);

  this.init = function() {
    this.draw();
  };

  this.draw = function() {};
};
Placeholder.prototype = new PulseChart();


/* CREATE CHART TYPE SPECIFIC SUBCLASSES */
var BarChart = function(opts){
  if (!(this instanceof BarChart)){
    return new BarChart(opts);
  }
  BarChart.prototype.constructor.call(this, opts);

  this.init = function(){
    var chart =  {
                    title: this.title,
                    id: this.template
                  },
      Templates = {},
      self = this;

      Templates.barChartTemplate = [
        '<h3>'+ chart.title +'</h3>',
        '<div class="small-12 columns" id="'+ chart.id +'"></div>'
      ].join("\n");

      $(this.container).html(Templates.barChartTemplate);

      // Call chart function in bar-chart.js
      if (navigator.onLine) {
        d3.json(this.url, function(error, data) {
          var checkDataNull = data.filter(function(d) { return hasNull(d); }).length > 0;

          if (checkDataNull) {
            pulseBeat.forceSwitch();
          } else {
            self.draw(data);
          }
          localStorage.setItem(this.key, JSON.stringify(data));
        });
      } else {
        var data = JSON.parse(localStorage.getItem(this.key));
        self.draw(data);
      }
  };

  this.draw = function(data){};
};
BarChart.prototype = new PulseChart();


var SpaghettiChart = function(opts){
  if (!(this instanceof SpaghettiChart)){
    return new SpaghettiChart(opts);
  }
  SpaghettiChart.prototype.constructor.call(this, opts);


  this.init = function(){
      var chart =  {
                      title: this.title,
                      id: this.template
                    },
          Templates = {};
          self = this;

      Templates.spaghettiChartTemplate = [
        '<div class="row full spaghetti-slide">',
          '<div class="top clearfix">',
            '<h3>'+ chart.title +'</h3>',
            '<ul>',
              '<li><p>Last 24 Hours</p></li>',
            '</ul>',
          '</div>',
          '<div class="small-12 columns">',
            '<div class="row spaghetti" id="'+ chart.id +'">',
            '</div>',
            '<div class="row spaghetti-legend">',
              '<ul>',
              '</ul>',
            '</div>',
          '</div>',
        '</div>'
      ].join("\n");

      $(".chart-slide").html(Templates.spaghettiChartTemplate);

      if (navigator.onLine) {
        d3.json(this.url, function(error, data) {
          var checkDataNull = data.filter(function(d) { return hasNull(d); }).length >= 3;

          if (checkDataNull) {
            pulseBeat.forceSwitch();
          } else {
            self.draw(data);
          }
          localStorage.setItem(this.key, JSON.stringify(data));
        });
      } else {
        var data = JSON.parse(localStorage.getItem(this.key));
        self.draw(data);
      }
  };
};
SpaghettiChart.prototype = new PulseChart();


/* CREATE INSTANCES OF TYPE SPECIFIC SUBCLASSES */
var versusOpts = {
      title:'Clean Energy Vs Fossil Fuels',
      // url:'/api/versus?limit=1',
      url:'/api/usage?limit=6',
      // url:'/data/versusData.json',
      key:'versusData',
      type:'barChart',
      template:'renewable-vs-nonrenewable'
    },
    versusChart = new BarChart(versusOpts);

versusChart.draw = function(data){
  var normalizedPercentages = normalizePercentages(data, 'energy_usage');
  for (var i = 0; i < data.length; i++) {
    data[i]['percentUsage'] = normalizedPercentages[i];
  }

  var renewableData = 0,
      nonRenewableData = 0;

  data.forEach(function(d) {
    if (d.name == 'Coal' || d.name == 'Fossil_Fuel') {
      nonRenewableData += d.percentUsage;
    } else {
      renewableData += d.percentUsage;
    }
  });

  var dataSet = [];
  dataSet = [{'percentUsage':renewableData},{'percentUsage':nonRenewableData}];

  var width = $(".chart-slide").width(),
      height = (768 >= $(".chart-slide").width() ? 475 : 575), // set height
      windowHeight = $(window).height(),
      headerHeight = $('.chart-slide').children("h3").outerHeight(),
      topSectionHeight;

  // Orientation landscape
  if(landscape()){
    if (window.innerHeight < 900) {
      height = (windowHeight - headerHeight);
    } else {
      height = (windowHeight - headerHeight) / 2;
    }
  }

  if(mobilePortrait()) {
    topSectionHeight = $('.usage-section').outerHeight();

    height = (windowHeight - topSectionHeight - headerHeight);
    $('.chart-slide').css('min-height', height);
  }

  var margin = {top: (width / 30), right: (width / 20), bottom: (width / 30), left: (width / 4)}, // spacings
      barWidth = width - margin.left - margin.right, // set bar width
      barHeight = height / dataSet.length - margin.bottom - margin.top, // height for each bar
      valueFontSize = height / 5.75;

  // bar scale
  var x = d3.scale.linear()
      .domain([0, 100])
      .range([0, barWidth]);

  d3.select("#renewable-vs-nonrenewable").selectAll("*").remove();

  // create SVG element
  var svg = d3.select("#renewable-vs-nonrenewable").append("svg")
      .attr("width", "100%")
      .attr("height", height);
      // .attr("viewBox", "0 0 " + width + " " + height ) // make it scale/responsive
      // .attr("preserveAspectRatio", "xMidYMin meet"); // top left align

  // create group for each array in data set
  var bar = svg.selectAll('g')
      .data(dataSet)
      .enter().append('g')
      .attr('transform', function(d, i){return 'translate(0, '+ ((i * (barHeight + margin.top + margin.bottom)) + margin.top) +')';});

  // create gradient background
  bar.append("rect")
      .attr("class", function(d, i){return "bg-renewable-vs-nonrenewable-" + i + " gradient-background";})
      .attr("x", margin.left)
      .attr("width", barWidth)
      .attr("height", barHeight)
      .style("fill-opacity", 0.13)
          .filter(function(d) { return d['energy'] == 0 })
          .style("fill", "#777");

  // create rect for data
  var setBarData = bar.append("rect")
      .attr("class", function(d, i){return "renewable-vs-nonrenewable-" + i + " bar-chart";})
      .attr("x", margin.left)
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("clip-path", function(d, i) { return "url(#clip-renewable-vs-nonrenewable-"+ i +")";}); // clip to percentage
  // animation to fill bar with gradient
  setBarData.transition()
      .duration(2000)
      .delay(750)
      .attr("width", barWidth);
  // create clip path for each array in data set
  var clipPath = svg.selectAll("clipPath")
      .data(dataSet)
      .enter().append('clipPath')
      .attr("id", function(d, i){return "clip-renewable-vs-nonrenewable-"+ i;})
      .append("rect")
          .attr("class", "versus-clip-path")
          .attr("x", margin.left)
          .attr("y", 0)
          .attr("width", function(d) { return d['percentUsage'] * 0.01 * barWidth; }) // calculate the width to clip
          .attr("height", barHeight);

  // create grid/ticks
  bar.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(" + margin.left + "," + barHeight + ")")
      .attr("stroke-width", barWidth / 100)
      .call(d3.svg.axis().scale(x).ticks(50).tickSize(-barHeight)) // set tick count and height
    .selectAll(".tick")
      .data(x.ticks(10), function(d) { return d['energy']; })
    .exit();

  // append text data value
  bar.append("text")
    .attr("class", "bar-text")
    .attr("x", width - (width / 25) - margin.right)
    .attr("y", function(){
      if (isSafari || isIos || isDolphinKiosk) {
        return barHeight / 2 + valueFontSize / 4;
      } else {
        return barHeight + valueFontSize * 2;
      }
    })
    .attr("text-anchor", "end")
    .style("font-size", valueFontSize + "px")
    .style("fill-opacity", 0)
    .text(function(d) { return d['percentUsage'] + '%'; })
    .transition()
    .duration(1000)
    .style("fill-opacity", 1);

  // divider
  //svg.selectAll('g')
      //.data(dataSet.filter(function(d, i) { if ((dataSet.length - 1) === i) { return i; }})) // if last array dont append line
  bar.append("line")
      .attr("x1", "-100%")
      .attr("y1", barHeight + ((margin.bottom + margin.top) / 2))
      .attr("x2", "200%")
      .attr("y2", barHeight + ((margin.bottom + margin.top) / 2))
      .style("stroke", "rgba(245, 245, 245, 0.3)");

  // append Image
  bar.append("svg:image")
      .attr("xlink:href", function(d, i) {return "img/RenewableVSNonRenewable/bar-icon-"+ (i + 1) +".svg";})
      .attr("width", width / 5)
      .attr("height", width / 5)
      .attr("x", 0)
      .attr("y", ((barHeight / 2) - (width / 10))) // 75 comes from image width/2
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .attr("x", ((margin.left / 2) - (width / 5) / 2)) // 150 is size of image
      .style("opacity", 1);
};

versusChart.redraw = function(data){
  var normalizedPercentages = normalizePercentages(data, 'energy_usage');
  for (var i = 0; i < data.length; i++) {
    data[i]['percentUsage'] = normalizedPercentages[i];
  }

  var renewableData = 0,
      nonRenewableData = 0;

  data.forEach(function(d) {
    if (d.name == 'Coal' || d.name == 'Fossil_Fuel') {
      nonRenewableData += d.percentUsage;
    } else {
      renewableData += d.percentUsage;
    }
  });

  var dataSet = [];
  dataSet = [{'percentUsage':renewableData},{'percentUsage':nonRenewableData}];

  var width = $(".chart-slide").width(),
      margin = {top: (width / 30), right: (width / 20), bottom: (width / 30), left: (width / 4)}, // spacings
      barWidth = width - margin.left - margin.right; // set bar width;

  var svg = d3.select("#renewable-vs-nonrenewable").select("svg");

  svg.selectAll('.bar-text')
      .data(dataSet)
      .text(function(d) { return d['percentUsage'] + '%'; });

  svg.selectAll(".versus-clip-path")
      .data(dataSet)
      .transition()
      .duration(1000)
      .attr("width", function(d) { return d['percentUsage'] * 0.01 * barWidth; });
};

var currentEnergyOpts = {
      title:'Current Energy Mix',
      url:'/api/usage?limit=6',
      // url:'/data/versusData.json',
      key:'currentMixData',
      type:'barChart',
      template:'current-energy'
    },
    currentEnergyChart = new BarChart(currentEnergyOpts);
currentEnergyChart.draw  = function(data) {
    // sort data ascending by energy_usage
    data.sort(function(a, b){ return d3.ascending(a['energy_usage'], b['energy_usage']); });

    var normalizedPercentages = normalizePercentages(data, 'energy_usage');
    for (var i = 0; i < data.length; i++) {
      data[i]['percentUsage'] = normalizedPercentages[i];
    }

    var width = $(".chart-slide").width(),
        height = (768 >= $(".chart-slide").width() ? 470 : 500), // set height
        margin = {top: (width / 70), right: (width / 20), bottom: (width / 70), left: (width / 4)}, // spacings
        barWidth = width - margin.left - margin.right, // set bar width
        barHeight = height / data.length - margin.bottom, // height for each bar
        windowHeight = $(window).height(),
        headerHeight = $('.chart-slide').children("h3").outerHeight();


    // Orientation landscape
    if(landscape()){
      if (window.innerHeight < 900) {
        height = (windowHeight - headerHeight);
      } else {
        height = (windowHeight - headerHeight) / 2;
      }

      barHeight = height / data.length - margin.bottom - margin.top; // height for each bar
    }

    if(mobilePortrait()) {
      // if (window.innerHeight < 900) {
        topSectionHeight = $('.usage-section').outerHeight();

        height = (windowHeight - topSectionHeight - headerHeight);
        barHeight = height / data.length - margin.bottom - margin.top;
      // } else {
      //   height = (windowHeight - headerHeight) / 2;
      //   barHeight = height / data.length - margin.bottom - margin.top;
      // }
    }

    var valueFontSize = height / 13.88;

    // bar scale
    var x = d3.scale.linear()
        .domain([0, 100])
        .range([0, barWidth]);

    d3.select("#current-energy").selectAll("*").remove();

    // create SVG element
    var svg = d3.select("#current-energy").append("svg")
        .attr("width", "100%")
        .attr("height", function() {
          if(landscape()) {
            return height;
          } else {
            return (barHeight + margin.top + margin.bottom) * data.length;
          }
        });
        // .attr("viewBox", "0 0 " + width + " " + height ) // make it scale/responsive
        // .attr("preserveAspectRatio", "xMidYMin meet"); // top left align

    // create group for each array in data set
    var bar = svg.selectAll('g')
        .data(data)
        .enter().append('g')
        .attr('transform', function(d, i){return 'translate(0, '+ ((i * (barHeight + margin.top + margin.bottom)) + margin.top) +')';});

    // create gradient background
    bar.append("rect")
        .attr("class", function(d, i){return "bg-current-energy-"+ d["name"] +" gradient-background";})
        .attr("x", margin.left)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .style("fill-opacity", 0.13)
        .filter(function(d) { return d["percentUsage"] === 0; })
          .style("fill", "#777");

    // create rect for data
    var setBarData = bar.append("rect")
        .attr("class", function(d, i){return "current-energy-"+ d["name"] +" bar-chart";})
        .attr("x", margin.left)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("clip-path", function(d, i) { return "url(#clip-current-energy-"+ d["name"] +")";}); // clip to percentage
    // animation to fill bar with gradient
    setBarData.transition()
        .duration(2000)
        .delay(750)
        .attr("width", barWidth);
    // create clip path for each array in data set
    var clipPath = svg.selectAll("clipPath")
        .data(data)
        .enter().append('clipPath')
        .attr("id", function(d, i){return "clip-current-energy-"+ d["name"];})
        .append("rect")
            .attr("class", "bar-clip-path")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("width", function(d) { return d['percentUsage'] * 0.01 * barWidth; }) // calculate the width to clip
            .attr("height", barHeight);

    // create grid/ticks
    bar.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + "," + barHeight + ")")
        .attr("stroke-width", barWidth / 100)
        .call(d3.svg.axis().scale(x).ticks(50).tickSize(-barHeight)) // set tick count and height
      .selectAll(".tick")
        .data(x.ticks(10), function(d) { return d["energy_usage"]; })
      .exit();

  // append text data value
  bar.append("text")
    .attr("class", "bar-text")
    .attr("x", width - (width / 25) - margin.right)
    .attr("y", function(){
      if (isSafari || isIos || isDolphinKiosk) {
        return barHeight / 2 + valueFontSize / 4;
      } else {
        return barHeight + margin.top + margin.bottom + valueFontSize * 6;
      }
    })
    .attr("text-anchor", "end")
    .style("font-size", valueFontSize + "px")
    .style("fill-opacity", 0)
    .text(function(d) { return d['percentUsage'] + '%'; })
    .transition()
    .duration(1000)
    .style("fill-opacity", function(d) {
      if (d["percentUsage"] === 0) {
        return 0.2;
      } else {
        return 1;
      }
    });

    // divider
    //svg.selectAll('g')
        //.data(data.filter(function(d, i) { if ((data.length - 1) === i) { return i; }})) // if last array dont append line
    bar.append("line")
        .attr("x1", "-100%")
        .attr("y1", barHeight + ((margin.bottom + margin.top) / 2))
        .attr("x2", "200%")
        .attr("y2", barHeight + ((margin.bottom + margin.top) / 2))
        .style("stroke", "rgba(245, 245, 245, 0.3)");
    bar.append("line")
        .attr("x1", (margin.left / 2) * 1.8)
        .attr("y1", -margin.top)
        .attr("x2", (margin.left / 2) * 1.8)
        .attr("y2", barHeight + margin.bottom)
        .style("stroke", "rgba(245, 245, 245, 0.3)");

    // append Image
    bar.append("svg:image")
        .attr("xlink:href", function(d, i) {return "img/CleanEnergyMix/"+ d["name"] +".svg";})
        .attr("width", function() {
          if (landscape()) {
            return height / 9;
          } else if (mobilePortrait() && window.innerHeight > 900) {
            return 180;
          } else {
            return 100;
          }
        })
        .attr("height", function() {
          if (landscape() || mobilePortrait() && window.innerHeight > 900) {
            return height / 9;
          } else {
            return height / 7;
          }
        })
        .attr("x", 0)
        .attr("y", function() {
          if (landscape()) {
            return ((barHeight / 2) - ((height / 9) / 2));
          } else {
            return ((barHeight / 2) - 35);
          }
        })
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .attr("x", function() {
          if(landscape()){
            return ((margin.left / 2) - ((height / 9) / 1.8));
          }
          else {
            return ((margin.left / 2) - ((height / 7)));
          }
        })
        .style("opacity", function(d) {
          if (d["percentUsage"] === 0) {
            return 0.2;
          } else {
            return 1;
          }
        });
};

currentEnergyChart.redraw = function(data) {
  // sort data ascending by energy_usage
  data.sort(function(a, b){ return d3.ascending(a['energy_usage'], b['energy_usage']); });

  var normalizedPercentages = normalizePercentages(data, 'energy_usage');
  for (var i = 0; i < data.length; i++) {
    data[i]['percentUsage'] = normalizedPercentages[i];
  }

  var width = $(".chart-slide").width(),
      margin = {top: (width / 70), right: (width / 20), bottom: (width / 70), left: (width / 4)}, // spacings
      barWidth = width - margin.left - margin.right; // set bar width

  var svg = d3.select("#current-energy").select("svg");

  svg.selectAll('.bar-text')
      .data(data)
      .text(function(d) { return d["percentUsage"] + '%'; });

  svg.selectAll(".bar-clip-path")
      .data(data)
      .transition()
      .duration(1000)
      .attr("width", function(d) { return d['percentUsage'] * 0.01 * barWidth; });
};

var totalEnergyOpts = {
      title:'Total Energy Mix',
      // url:'/data/SpaghettiChartData.json',
      url:'/api/mix?limit=27',
      key:'spaghettiData',
      type:'spaghettiChart',
      template:'spaghetti-chart'
    },
    totalEnergyChart = new SpaghettiChart(totalEnergyOpts);
totalEnergyChart.draw = function(data) {
  data.reverse();

  // remove first column of data
  var dataSet = d3.keys(data[0]).filter(function(key) { return key !== "dateTime"; });

  var width = $(".chart-slide").width(),
      height = (768 >= $(".chart-slide").width() ? 425 : 450),
      windowHeight = $(window).outerHeight(),
      legendHeight = $('.spaghetti-legend').outerHeight(),
      headerHeight = $('.chart-slide').find("h3").outerHeight();

  // Orientation landscape
  if(landscape()){
    if (window.innerHeight < 900) {
      height = (windowHeight - headerHeight - legendHeight);
    } else {
      height = (windowHeight - headerHeight) / 2 - legendHeight;
    }
  }

  if(mobilePortrait()) {
    topSectionHeight = $('.usage-section').outerHeight();

    height = (windowHeight - topSectionHeight - legendHeight - headerHeight);
  }

  var margin = {top: (width / 40), right: (width / 20), bottom: (width / 40), left: (width / 4)}, // spacings
      chartWidth = width - margin.left,
      chartHeight = height - margin.top - margin.bottom,
      yAxisKey = ["High", "Med", "Low"];

  var getLastData = d3.entries(data[data.length - 1]).filter(function(d) { return d.key !== "dateTime"; }), // get last data and filter out dateTime
      dataDescending = getLastData.sort(function(a, b) { return d3.descending(a.value, b.value); }); // sort data descending

  var chartLegend = d3.select('.spaghetti-legend ul')
      .selectAll('li')
      .data(dataDescending)
      .enter().append('li')
      .attr("class", function(d) {
        return d.key;
      });

  chartLegend.append('p')
    .text(function(d) {
      switch (d.key) {
        case "Coal":
          return "Coal";
        case "BioFuel":
          return "Biofuel";
        case "WindFarm":
          return "Wind";
        case "Solar":
          return "Solar";
        case "Waste2Energy":
          return "Waste";
        case "Fossil_Fuel":
          return "Oil";
      }
    });

  // find max value from all columns
  // var maxValue = d3.max(data, function(d) {
  //     return Math.max(d["Coal"], d["BioFuel"], d["WindFarm"], d["Solar"], d["Waste2Energy"], d["Fossil_Fuel"]);
  // });

  var lines = dataSet.map(function(name) {
      return {
          name: name,
          values: data.map(function(d) {
              return {name: name, energy: d[name]};
          })
      };
  });

  var x = d3.scale.linear()
          .domain([0, data.length - 1])
          .range([0, chartWidth]),
      y = d3.scale.linear()
          .domain([
              d3.min(lines, function(l) { return d3.min(l.values, function(v) { return v.energy; }); }),
              d3.max(lines, function(l) { return d3.max(l.values, function(v) { return v.energy; }); })
          ])
          .range([chartHeight, 0]);

  var drawLine = d3.svg.line()
      .x(function(d,i) { return x(i); })
      .y(function(d,i) {
        if (d.energy == null) {
          var dataBefore = i-1,
              dataAfter = i+1,
              dataBeforeBefore = dataBefore-1,
              dataAfterAfter = dataAfter+1,
              currentType = d.name,
              average = 0;

          if (dataBefore > 1 && dataAfter < data.length - 1) {
            if (data[dataBefore][currentType] == null) {
              average = (data[dataBeforeBefore][currentType] + data[dataAfter][currentType]) / 2;
            } else if (data[dataAfter][currentType] == null) {
              average = (data[dataBefore][currentType] + data[dataAfterAfter][currentType]) / 2;
            } else {
              average = (data[dataBefore][currentType] + data[dataAfter][currentType]) / 2;
            }
          } else if (dataBefore <= 0) {
            average = data[dataAfterAfter][currentType];
          } else if (dataAfter >= data.length - 1) {
            average = data[dataBeforeBefore][currentType];
          }

          return y(average);
        } else {
          return y(d.energy);
        }
      })
      .interpolate("cardinal"); // curve points

  d3.select("#spaghetti-chart").selectAll("*").remove();

  // create SVG element
  var svg = d3.select("#spaghetti-chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

  var lineChart = svg.append("g")
      .attr("transform", "translate(" + ((margin.left / 2) + (width / 9.6)) + ","+ (margin.top + (margin.bottom / 1.2)) +")");

  // group each line
  var line = lineChart.selectAll(".line")
      .data(lines)
      .enter().append('g')
          .attr("class", "line");
  // draw line path
  var path = line.append("path")
      .attr("class", function(d){ return d.name + " line chart"; })
      .attr("d", function(d){ return drawLine(d.values); });

  var pathLength = path.node().getTotalLength();

  path
      .attr("stroke-dasharray", function(){
          return (pathLength * 2) + " " + (pathLength * 2);
      })
      .attr("stroke-dashoffset", (pathLength * 2))
      .attr("stroke-linecap", "round")
      .transition()
          .duration(5000)
          .ease("linear")
          .attr("stroke-dashoffset", 0);

  // Create horiztonal grid/lines
  for (var i = 0; i < yAxisKey.length; i++) {
      svg.append("line")
          .attr("x1", "-100%")
          .attr("y1", (height / yAxisKey.length) * (i + 1))
          .attr("x2", "200%")
          .attr("y2", (height / yAxisKey.length) * (i + 1))
          .style("stroke", "rgba(245, 245, 245, 0.3)");

      svg.append("text")
          .attr("class", "spaghetti-key")
          .attr("x", 0)
          .attr("y", (height / yAxisKey.length) * i + (height / 5)) // position text to middle of bar
          .style("fill-opacity", 0)
          .style("transform", "initial")
          .style("font-size", function() {
            var fontSize = (width / 20);
            if (landscape() && fontSize > 32) {
              return "32px";
            } else {
              return  fontSize + "px";
            }
          })
          .text(yAxisKey[i])
          .transition()
              .duration(1000)
              .attr("x", function() {
                  return (margin.left / 2) - (width / 15);
              })
              .style("fill-opacity", 1);
  }
  // vertical line
  svg.append("line")
      .attr("x1", (margin.left / 2) + (width / 9.6))
      .attr("y1", 0)
      .attr("x2", (margin.left / 2) + (width / 9.6))
      .attr("y2", height + margin.bottom)
      .style("stroke", "rgba(245, 245, 245, 0.3)");


  var timeMarkers = svg.append("g")
      .attr('class', 'time-markers')
      .attr("transform", "translate(" + ((margin.left / 2) + (width / 9.6)) + ","+ 0 +")");

  timeMarkers.selectAll('.time-marker')
    .data(data)
    .enter().append('line')
    .attr("class", 'time-marker')
    .attr("x1", function(d, i) {
      return (width - margin.left) / 46 * i;
    })
    .attr("y1", 0)
    .attr("x2", function(d, i) {
      return (width - margin.left) / 46 * i;
    })
    .attr("y2", height + margin.bottom)
    .style("stroke", function(d, i) {
      if (moment(d.dateTime).format('h:mm') === "12:00" || i == 46) {
        return "rgba(245, 245, 245, 0.3)";
      } else {
        return "transparent";
      }
    });

  timeMarkers.selectAll('.time-marker-text')
    .data(data)
    .enter().append("text")
    .attr("class", "time-marker-text")
    .attr("x", function(d, i) {
      return (width - margin.left) / 46 * i;
    })
    .attr("y", height / 14)
    .text(function(d, i) {
      if (i == 44) {
        return "Now";
      } else {
        return moment(d.dateTime).format('ha');
      }
    })
    .style("font-size", (height / 24) + "px")
    .style("fill", function(d, i) {
      if (moment(d.dateTime).format('h:mm') === "12:00" && i < 40) {
        return "#0075d0";
      } else if (i == 44) {
        return "#0075d0";
      } else {
        return "transparent";
      }
    });
};

totalEnergyChart.redraw = function(data) {
  data.reverse();

  var dataSet = d3.keys(data[0]).filter(function(key) { return key !== "dateTime"; });

  var width = $(".chart-slide").width(),
      height = (768 >= $(".chart-slide").width() ? 425 : 450),
      windowHeight = $(window).outerHeight(),
      legendHeight = $('.spaghetti-legend').outerHeight(),
      headerHeight = $('.chart-slide').find("h3").outerHeight();

  // Orientation landscape
  if(landscape()){
    if (window.innerHeight < 900) {
      height = (windowHeight - headerHeight - legendHeight);
    } else {
      height = (windowHeight - headerHeight) / 2 - legendHeight;
    }
  }

  if(mobilePortrait()) {
    topSectionHeight = $('.usage-section').outerHeight();

    height = (windowHeight - topSectionHeight - legendHeight - headerHeight);
  }

  var margin = {top: (width / 40), right: (width / 20), bottom: (width / 40), left: (width / 4)}, // spacings
      chartWidth = width - margin.left,
      chartHeight = height - margin.top - margin.bottom;

  var lines = dataSet.map(function(name) {
      return {
          name: name,
          values: data.map(function(d) {
              return {name: name, energy: d[name]};
          })
      };
  });

  var x = d3.scale.linear()
          .domain([0, data.length - 1])
          .range([0, chartWidth]),
      y = d3.scale.linear()
          .domain([
              d3.min(lines, function(l) { return d3.min(l.values, function(v) { return v.energy; }); }),
              d3.max(lines, function(l) { return d3.max(l.values, function(v) { return v.energy; }); })
          ])
          .range([chartHeight, 0]);

  var drawLine = d3.svg.line()
      .x(function(d,i) { return x(i); })
      .y(function(d,i) {
        if (d.energy == null) {
          var dataBefore = i-1,
              dataAfter = i+1,
              dataBeforeBefore = dataBefore-1,
              dataAfterAfter = dataAfter+1,
              currentType = d.name,
              average = 0;

              if (dataBefore > 1 && dataAfter < data.length - 1) {
                if (data[dataBefore][currentType] == null) {
                  average = (data[dataBeforeBefore][currentType] + data[dataAfter][currentType]) / 2;
                } else if (data[dataAfter][currentType] == null) {
                  average = (data[dataBefore][currentType] + data[dataAfterAfter][currentType]) / 2;
                } else {
                  average = (data[dataBefore][currentType] + data[dataAfter][currentType]) / 2;
                }
              } else if (dataBefore <= 0) {
                average = data[dataAfterAfter][currentType];
              } else if (dataAfter >= data.length - 1) {
                average = data[dataBeforeBefore][currentType];
              }

          return y(average);
        } else {
          return y(d.energy);
        }
      })
      .interpolate("cardinal"); // curve points

  var svg = d3.select("#spaghetti-chart").select("svg");

  // update with animation
  svg.selectAll("path")
      .data(lines)
      .transition()
          .ease("linear")
          .duration(750)
          .attr("d", function(d){ return drawLine(d.values); });

  var timeMarkers = svg.select('.time-markers');

  timeMarkers.selectAll('.time-marker')
    .data(data)
    .transition()
      .attr("x1", function(d, i) {
        return (width - margin.left) / 46 * i;
      })
      .attr("y1", 0)
      .attr("x2", function(d, i) {
        return (width - margin.left) / 46 * i;
      })
      .attr("y2", height + margin.bottom);

  timeMarkers.selectAll('.time-marker-text')
    .data(data)
    .transition()
      .attr("x", function(d, i) {
        return (width - margin.left) / 46 * i;
      })
      .attr("y", height / 14);
};


var placeholderOpts = {
      title:'Blue Planet Foundation & HECO',
      url:'#',
      key:'placeholder',
      type:'placeholder',
      template:'placeholder'
    };

// if orientation portrait
if (!landscape() || window.innerHeight < 900) {
  var placeholderChart = new Placeholder(placeholderOpts);

  placeholderChart.draw = function() {
    var Templates = {};

    Templates.placeholderTemplate = [
      '<div class="chart-placeholder">',
        '<h2>Powered By</h2>',
        '<img class="isvg" src="img/BPF_HECO_logos.svg" alt="Blue Planet Foundation And HECO">',
      '</div>'
    ].join("\n");

    $(this.container).html(Templates.placeholderTemplate);

    inlineSvgImg();
  };
}

function normalizePercentages(obj, field) {
  var values = [],
      value, total, difference, max;
  for (var i = 0; i < obj.length; i++) {
    values.push(obj[i][field]);
  }
  total = values.reduce(sum, 0);
  values = values.map(percentOf(total));
  difference = 100 - values.reduce(sum, 0);
  if (difference !== 0) {
    max = Math.max.apply(null, values);
    values[values.indexOf(max)] += difference;
  }
  return values;
}

function sum(total, current) {
  return total += current;
}

function percentOf(total) {
  return function(value, index, array) {
    return Math.round((value / total).toFixed(2) * 100);
  };
}
