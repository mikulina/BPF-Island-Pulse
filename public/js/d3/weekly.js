function weeklyChart() {

    var elmContainer = ".usage-section";

    var date = new Date(),
        oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

    var dateToday = getDate(date),
        dateOneWeekAgo = getDate(oneWeekAgo);

    var width = $(elmContainer).width() / 2,
        height = (768 >= $(elmContainer).width() ? 330 : 430);

    // Orientation landscape
    if(landscape()){
        var windowHeight = $(window).height(),
        headerHeight = $('.gauge').siblings("h2").outerHeight();
        height = (windowHeight - headerHeight) / 2;
    }

    var rowSpacing = {top: (height / 8.6)},
        svg, chart;

    // create SVG element
    svg = d3.select("#weekly-chart").append("svg")
        .attr("class", "weekly-progress-chart")
        .attr("width", width)
        .attr("height", height);

    // High Low labels
    svg.append("text")
        .attr("class", "weekly-label first")
        .attr("x", (width / 2.3))
        .attr("y", (height / 10.75))
        .text("Low");
    svg.append("text")
        .attr("class", "weekly-label second")
        .attr("x", (width / 1.4))
        .attr("y", (height / 10.75))
        .text("High");

    // highlight today
    svg.append("rect")
        .attr("x", 0)
        .attr("y", height - (height / 6.5))
        .attr("width", width)
        .attr("height", height / 9.5)
        .style("fill", "rgba(255, 255, 255, 0.5)")
        .style("stroke-width", 2)
        .style("stroke", "rgba(255, 255, 255, 0.75)");

    // Lines
    svg.append("line")
        .attr("class", "weekly-grid-lines first")
        .attr("x1", 0)
        .attr("y1", (height / 8.6))
        .attr("x2", width)
        .attr("y2", (height / 8.6));
    svg.append("line")
        .attr("class", "weekly-grid-lines second")
        .attr("x1", (width / 2.3) - (width / 22))
        .attr("y1", 0)
        .attr("x2", (width / 2.3) - (width / 22))
        .attr("y2", height);
    svg.append("line")
        .attr("class", "weekly-grid-lines third")
        .attr("x1", (width / 1.4) - (width / 22))
        .attr("y1", 0)
        .attr("x2", (width / 1.4) - (width / 22))
        .attr("y2", height);

    var areaId;

    if (isValidUrlHash()) {
      areaId = locations.indexOf(urlLocation()) + 1;

      setData('/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2023:00:00&areaId=' + areaId, 'weeklyData', false);
    } else {
      setData('/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2023:00:00', 'weeklyData', false);
    }

    // Update every 5 minutes
    setInterval(function() {
        date = new Date();
        oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

        dateToday = getDate(date);
        dateOneWeekAgo = getDate(oneWeekAgo);

        if (isValidUrlHash()) {
          setData('/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2023:00:00&areaId=' + areaId, 'weeklyData', true);
        } else {
          setData('/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2023:00:00', 'weeklyData', true);
        }
    }, 300000);
    // }, 5000);

    function setData(url, key, update) {
        // if online get new data else use localStorage
        if (navigator.onLine) {
            d3.json(url, function(error, data) {
                if (update == false) {
                    drawWeeklyChart(key, data);
                } else {
                    updateWeeklyChart(key, data);
                }
                localStorage.setItem(key, JSON.stringify(data));
            });
        } else {
            var json = JSON.parse(localStorage.getItem(key));
            var data = json;
            if (update == false) {
                drawWeeklyChart(key, data);
            } else {
                updateWeeklyChart(key, data);
            }
        }

    }

    // '/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2000:00:00'
    // '/api/highlow?date=2014-01-14%2000:00:00,2014-01-20%2000:00:00'
    // d3.json('/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2000:00:00', function(error, data) {
    function drawWeeklyChart(key, data) {
        var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            currentDay = weekday[date.getDay()];
        var weekMin = d3.min(data, function(d) { return d["Low"];}),
            weekMax = d3.max(data, function(d) { return d["High"];});

        chart = svg.selectAll('g')
            .data(data)
            .enter().append('g')
            .attr("class", "chart-data");

        chart.append("text")
            .attr("class", function(d) {
                if (d["dayOfWeek"] === currentDay) {
                    return "weekly-day today";
                } else {
                    return "weekly-day";
                }
            })
            .attr("x", (width / 14))
            .attr("y", function(d, i) { return -(i * rowSpacing.top) + height - (height / 12.28);})
            .text(function(d) {
                if (d["dayOfWeek"] === currentDay) {
                    return "Today";
                } else {
                    return d["dayOfWeek"];
                }
            });

        chart.append("text")
            .attr("class", function(d) {
                if (d["Low"] === weekMin) {
                    return "weekly-value left-value low";
                } else {
                    return "weekly-value left-value";
                }
            })
            .attr("x", (width / 2.3))
            .attr("y", function(d, i) { return -(i * rowSpacing.top) + height - (height / 12.28);})
            .text(function(d) { return (d["Low"] === null || d["Low"] === undefined) ? 0 : numberWithCommas(Math.round(d["Low"]));});

        chart.append("text")
            .attr("class", function(d) {
                if (d["High"] === weekMax) {
                    return "weekly-value right-value high";
                } else {
                    return "weekly-value right-value";
                }
            })
            .attr("x", (width / 1.4))
            .attr("y", function(d, i) { return -(i * rowSpacing.top) + height - (height / 12.28);})
            .text(function(d) { return (d["High"] === null || d["High"] === undefined) ? 0 : numberWithCommas(Math.round(d["High"]));});
    }

    function updateWeeklyChart(key, data) {
        d3.selectAll(".weekly-day").classed("today", false);
        d3.selectAll(".weekly-value").classed({"low": false, "high": false});

        var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            currentDay = weekday[date.getDay()];
        var weekMin = d3.min(data, function(d) { return d["Low"];}),
            weekMax = d3.max(data, function(d) { return d["High"];});

        var svg = d3.select("#weekly-chart").select("svg");

        svg.selectAll(".weekly-day")
            .data(data)
            .attr("class", function(d) {
                if (d["dayOfWeek"] === currentDay) {
                    return "weekly-day today";
                } else {
                    return "weekly-day";
                }
            })
            .text(function(d) {
                if (d["dayOfWeek"] === currentDay) {
                    return "Today";
                } else {
                    return d["dayOfWeek"];
                }
            });

        svg.selectAll(".left-value")
            .data(data)
            .attr("class", function(d) {
                if (d["Low"] === weekMin) {
                    return "weekly-value left-value low";
                } else {
                    return "weekly-value left-value";
                }
            })
            .text(function(d) { return (d["Low"] === null || d["Low"] === undefined) ? 0 : numberWithCommas(Math.round(d["Low"]));});

        svg.selectAll(".right-value")
            .data(data)
            .attr("class", function(d) {
                if (d["High"] === weekMax) {
                    return "weekly-value right-value high";
                } else {
                    return "weekly-value right-value";
                }
            })
            .text(function(d) { return (d["High"] === null || d["High"] === undefined) ? 0 : numberWithCommas(Math.round(d["High"]));});
    }
}

$(function(){
    weeklyChart();

    $(window).resize(function() {
        waitForFinalEvent(function(){
            $('#weekly-chart svg').remove();

            weeklyChart();
        }, 500, 'weeklyResize');
    });
});

function getDate(date) {
    var curr_date = ("0" + date.getDate()).slice(-2),
        curr_month = ("0" + (date.getMonth() + 1)).slice(-2),
        curr_year = date.getFullYear();
    return curr_year + "-" + curr_month + "-" + curr_date;
}
