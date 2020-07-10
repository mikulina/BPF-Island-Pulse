(function () {

    var elmContainer = ".gauge",
        width = $(elmContainer).width() * 1.4,
        windowHeight = $(window).height();

    if ((windowHeight - 150) < width) {
        width = windowHeight - 250;
    }

    // Orientation portrait
    if (!landscape()) {
        width = (768 >= $(window).width() ? 475 : 650);
    }

    var height = width, // set height
        r = width / 2, // radius of circle
        pi = Math.PI,
        gaugeLines = 100,
        needleExtra = width / 30, // needle excess
        needleBase = width / 32, // base of needle
        minData = 500, // Min value of gauge
        maxData = 1200, // Max value of gauge
        guageData = 0,
        innerData = 0,
        flicker = false,
        gauge, gaugeGroup, bgArc, blueArc, dataArc, innerArc, setDataArc, setInnerArc, needle;

    // Create SVG element
    function gaugeDraw() {
        gauge = d3.select("#gauge").append("svg")
            .attr("width", (width / 2) + needleBase + needleExtra)
            .attr("height", height + (needleExtra * 2));
            // .attr("viewBox", "0 0 " + ((width / 2) + needleBase + needleExtra) + " " + (height + (needleExtra * 2)) ); // make it scale/responsive

        // Group all the things and move center of circle
        gaugeGroup = gauge.append('g')
            .attr("transform", "translate("+ (r + needleExtra) +", "+ (r + needleExtra) +")rotate(180)");

        // Background arc
        bgArc = d3.svg.arc()
            .innerRadius(r - (r / 4.5))
            .outerRadius(r)
            .startAngle(0)
            .endAngle(pi);

        // Blue background arc
        blueArc = d3.svg.arc()
            .innerRadius(r - (r / 6))
            .outerRadius(r - (r / 18))
            .startAngle(0)
            .endAngle(pi);

        // White data arc
        dataArc = d3.svg.arc()
            .innerRadius(r - (r / 6))
            .outerRadius(r - (r / 18))
            .startAngle(0);

        // Inner arc
        innerArc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(r / 2.3)
            .startAngle(0);

        // Set transparent background arc
        gaugeGroup.append("path")
            .attr("d", bgArc)
            .style("fill", "rgba(255, 255, 255, 0.1)");

        // Set blue background arc
        gaugeGroup.append("path")
            .attr("d", blueArc)
            .style("fill", "#0075D0");

        // Set white data arc
        setDataArc = gaugeGroup.append("path")
            .datum({endAngle: 0})
            .attr("d", dataArc)
            .style("fill", "#ffffff");

        // Set inner arc
        setInnerArc = gaugeGroup.append("path")
            .datum({endAngle: 0})
            .attr("d", innerArc)
            .style("fill", "rgba(249, 27, 27, 0.3)");

        // Create grid/ticks
        for (var i = 1; i < gaugeLines; i++) {
            gaugeGroup.append("line")
                .attr("class", "gauge-lines")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", -(r - (r / 5.9)))
                .attr("y2", -(r - (r / 19)))
                .attr("transform", "rotate("+ (i * (180 / gaugeLines)) +")")
                .style("stroke-width", ((width / 1.5) / gaugeLines));
        }

        // Base of Needle
        gaugeGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", needleBase)
            .style("fill", "#fff");

        // Create needle group
        needle = gaugeGroup.append("g")
            .attr("transform", "rotate(0)")
            .style("stroke-width", ((width / 2) / gaugeLines));
        // Needle
        needle.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", -(r + needleExtra))
            .style("stroke", "#ffffff");
        // Red part of needle
        needle.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", -(r - (r / 3)))
            .attr("y2", -(r - (r / 19)))
            .style("stroke", "#F50017");
        // Red small dot on base
        gaugeGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", needleBase / 8)
            .style("fill", "#F50017");
    }

    var date = new Date(),
        yesterday = new Date(),
        oneWeekAgo = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

    var dateToday = getDate(date),
        dateYesterday = getDate(yesterday),
        dateOneWeekAgo = getDate(oneWeekAgo),
        timeNow = getNearestHalfHourTimeString(date);

    var areaId;

    if (isValidUrlHash()) {
      areaId = locations.indexOf(urlLocation()) + 1;

      setData('/api/current?limit=1&areaId=' + areaId, 'guageData');
      setData('/api/current?date='+ dateYesterday +'%2000:00:00,'+ dateYesterday +'%20'+ timeNow +'&limit=1&areaId=' + areaId, 'innerData');
    } else {
      setData('/api/mix?limit=1', 'guageData');
      setData('/api/mix?date='+ dateYesterday +'%2000:00:00,'+ dateYesterday +'%20'+ timeNow +'&limit=1', 'innerData');
    }

    // Update every 30 seconds
    setInterval(function() {
        date = new Date();
        yesterday = new Date();
        oneWeekAgo = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

        dateToday = getDate(date);
        dateYesterday = getDate(yesterday);
        dateOneWeekAgo = getDate(oneWeekAgo);
        timeNow = getNearestHalfHourTimeString(date);

        if (isValidUrlHash()) {
          setData('/api/current?limit=1&areaId=' + areaId, 'guageData');
          setData('/api/current?date='+ dateYesterday +'%2000:00:00,'+ dateYesterday +'%20'+ timeNow +'&limit=1&areaId=' + areaId, 'innerData');
        } else {
          setData('/api/mix?limit=1', 'guageData');
          setData('/api/mix?date='+ dateYesterday +'%2000:00:00,'+ dateYesterday +'%20'+ timeNow +'&limit=1', 'innerData');
        }
    }, 30000);

    // Flicker Needle
    setInterval(function(){
        var ranNum = ((Math.random()*1.5 / 2) * pi) * 0.01;
        if (flicker) {
            needle.transition()
                .duration(1000)
                .ease("elastic")
                .attr("transform", "rotate("+ (180 * (guageData - ranNum) / pi) +")");
        }
    }, 200);

    function setData(url, key) {
        // if online get new data else use localStorage
        if (navigator.onLine) {
            d3.json(url, function(error, data) {
                getHighLowData(function() {
                    guageChart(key, data);
                    localStorage.setItem(key, JSON.stringify(data));
                });
            });
        } else {
            var highLowData = JSON.parse(localStorage.getItem('highLowData'));
            var json = JSON.parse(localStorage.getItem(key));
            var data = json;

            minData = highLowData.minData;
            maxData = highLowData.maxData;

            guageChart(key, data);
        }
    }

    function getHighLowData(callback) {
        if (isValidUrlHash()) {
          setHighLowData('/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2023:00:00&areaId=' + areaId, callback);
        } else {
          setHighLowData('/api/highlow?date='+ dateOneWeekAgo +'%2000:00:00,'+ dateToday +'%2023:00:00', callback);
        }
    }

    function setHighLowData(url, callback) {
        d3.json(url, function(error, data) {
            var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                currentDay = weekday[date.getDay()];
            var weekMin = d3.min(data, function(d) { return d["Low"];}),
                weekMax = d3.max(data, function(d) { return d["High"];});

            if (weekMin && weekMax) {
                minData = Math.round(weekMin);
                maxData = Math.round(weekMax);

                minData = minData - (minData * 0.10);
                maxData = maxData + (maxData * 0.10);

                minData = Math.round(minData);
                maxData = Math.round(maxData);
            } else {
                minData = 0;
                maxData = 0;
            }

            localStorage.setItem('highLowData', JSON.stringify({
                minData: minData,
                maxData: maxData
            }));

            $('.gauge .low.label > p').text(numberWithCommas(minData) + 'MW');
            $('.gauge .high.label > p').text(numberWithCommas(maxData) + 'MW');

            callback();
        });
    }

    function guageChart(key, data) {
        var dataSet = d3.keys(data[0]).filter(function(key) { return key !== "dateTime"; });
        var energyData = dataSet.map(function(name) {
                        return {
                            name: name,
                            values: data.map(function(d) {
                                return {energy: +d[name]};
                            })
                        };
                    });
        var sum = d3.sum(energyData, function(e) { return d3.sum(e.values, function(v) { return v.energy;}); });
        var dataSum = sum;
        if (sum < minData) {
            dataSum = minData;
        } else if (sum > maxData) {
            dataSum = maxData;
        }
        if (data.length > 0) {
            if (key == 'guageData') {
                setMWRightNow(data, sum);
                guageData = ((dataSum - minData) / (maxData - minData) * pi);
            } else if (key == 'innerData') {
                innerData = ((dataSum - minData) / (maxData - minData) * pi);
            }
        }
        guageAnimation();
    }

    // Animate guage arc
    function guageAnimation() {
        flicker = false;
        guageData = guageData || 0;

        // Data Arc Transition
        if (setDataArc) {
            setDataArc.transition()
                .duration(1000)
                .call(arcTween, dataArc, guageData);
        }

        // Inner Arc Transition
        if (setInnerArc) {
            setInnerArc.transition()
                .duration(1000)
                .call(arcTween, innerArc, innerData);
        }

        // Needle Animation
        if (needle) {
            needle.transition()
                .duration(1500)
                .ease("elastic")
                .attr("transform", "rotate("+ (180 * guageData / pi) +")");
        }


        // Flicker needle after transition
        if (guageData > 0.05) {
            setTimeout(function() {
                flicker = true;
            }, 1500);
        }
    }

    function setMWRightNow(data, sum) {

        if (moment() < moment(data[0]['dateTime']).add('minutes', 34)) {
            $('.using-right-now .contain').children('p:first-child').html("We Are <br/> Using");
            $('#mw-right-now').html(numberWithCommas(Math.round(sum)));
            $('.using-right-now .contain').children('p:last-child').html("Megawatts <br/> Right Now");
        } else {
            $('.using-right-now .contain').children('p:first-child').html("We Were <br/> Using");
            $('#mw-right-now').html(numberWithCommas(Math.round(sum)));
            $('.using-right-now .contain').children('p:last-child').html("Megawatts <br/> At " + moment(data[0]['dateTime']).format('h:mma'));
        }
        $('.yesterday.label p span').html(moment(data[0]['dateTime']).format('h:mma'));
    }

     // Arc Animation Tween
    function arcTween(transition, arcName, newAngle) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arcName(d);
        };
      });
    }

    $(function(){
        gaugeDraw();

        $('#gauge').css({
            'right': -needleBase + 'px'
        });

        $(window).resize(function() {
            waitForFinalEvent(function(){
                $("#gauge").children("svg").remove();

                width = $(elmContainer).width() * 1.4;
                windowHeight = $(window).height();

                if ((windowHeight - 150) < width) {
                    width = windowHeight - 250;
                }

                // Orientation portrait
                if (!landscape()) {
                    width = (768 >= $(window).width() ? 475 : 650);
                }

                height = width;
                r = width / 2;
                needleExtra = width / 30;
                needleBase = width / 32;

                // gauge.attr("width", (width / 2) + needleBase + needleExtra);
                // gauge.attr("height", height + (needleExtra * 2));

                gaugeDraw();

                if (isValidUrlHash()) {
                  setData('/api/current?limit=1&areaId=' + areaId, 'guageData');
                  setData('/api/current?date='+ dateYesterday +'%2000:00:00,'+ dateYesterday +'%20'+ timeNow +'&limit=1&areaId=' + areaId, 'innerData');
                } else {
                  setData('/api/mix?limit=1', 'guageData');
                  setData('/api/mix?date='+ dateYesterday +'%2000:00:00,'+ dateYesterday +'%20'+ timeNow +'&limit=1', 'innerData');
                }

                $('#gauge').css({
                    'right': -needleBase + 'px'
                });
            }, 500, 'gaugeResize');
        });
    });
})();

// get date in YYYY-MM-DD format
function getDate(date) {
    var curr_date = ("0" + date.getDate()).slice(-2),
        curr_month = ("0" + (date.getMonth() + 1)).slice(-2),
        curr_year = date.getFullYear();
    return curr_year + "-" + curr_month + "-" + curr_date;
}

function getNearestHalfHourTimeString(date) {
  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = date.getMinutes();
  if (minutes < 30) {
      minutes = "00";
  } else {
      minutes = "30";
  }
  return(hours + ":" + minutes + ":00");
}
