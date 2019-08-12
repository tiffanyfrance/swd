var margin = { top: 0, right: 0, bottom: 0, left: 0 };

var width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var innerRadius = 10,
    outerRadius = Math.min(width, height) / 2 - 6;

var parseTime = d3.timeParse("%Y-%m-%d"),
    formatMonth = d3.timeFormat("%b"),
    fullCircle = 2 * Math.PI;

var svg = d3.select(".right").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let maxVals = [];

var x = d3.scaleTime()
  .range([0, fullCircle]);

var y = d3.scaleRadial()
  .range([innerRadius, outerRadius]);

var lineTMAX = d3.lineRadial()
  .angle(function (d) { return x(d.DATE); })
  .radius(function (d) { return y(d.TMAX); });

var lineTMIN = d3.lineRadial()
  .angle(function (d) { return x(d.DATE); })
  .radius(function (d) { return y(d.TMIN); });

var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);

var prettyDate = d3.timeFormat('%A, %b %d, %Y');

d3.csv("weather.csv", function (d) {
  d.DATE = parseTime(d.DATE);
  d.TMAX = +d.TMAX;
  d.TMIN = +d.TMIN;

  return d;
}, function (error, data) {
  if (error) throw error;

  let dataByYear = {};

  for (let d of data) {
    let year = d.DATE.toISOString().substr(0, 4);

    let arr = dataByYear[year];

    if (!arr) {
      arr = [];
      dataByYear[year] = arr;
    }

    arr.push(d);
  }

  for (let i = 0; i < 365; i++) {

    let max = 0;
    let d = null;

    for (let year in dataByYear) {
      let val = dataByYear[year];
      if (val[i] && val[i].TMAX > max) {
        max = val[i].TMAX;
        d = val[i];
        d.year = year;
      }
    }

    x.domain(d3.extent(dataByYear[d.year], function (d) { return d.DATE; }));
    y.domain([-8, 105]);

    d.angle = x(d.DATE);
    d.radius = y(d.TMAX);

    maxVals[i] = d;
  }

  var bgTMAX = d3.lineRadial()
    .angle(function (d) { return d.angle; })
    .radius(function (d) { return d.radius; });

  var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  g.append("path")
    .datum(maxVals)
    .attr("fill", "#efefef")
    .attr("stroke", "none")
    .attr("d", bgTMAX)

  for (var year in dataByYear) {
    buildSVG(year);
  }

  function buildSVG(year) {
    var className = 'year year-' + year;

    var g = svg.append("g")
      .attr('class', className)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var data = dataByYear[year];

    var hotDays = 0;

    for (var d of data) {
      if (d.TMAX > 100) {
        hotDays++
      }
    }

    var coldDays = 0;

    for (var d of data) {
      if (d.TMIN < 0) {
        coldDays++
      }
    }

    x.domain(d3.extent(data, function (d) { return d.DATE; }));
    y.domain([-8, 105]);
    // y.domain(d3.extent(data, function (d) { return d.TMAX; }));
    // console.log(d3.extent(data, function (d) { return d.TMIN; }));

    // var yAxis = g.append("g")
    //   .attr("text-anchor", "middle")
    //   .attr('class', 'y-axis');

    // var yTick = yAxis
    //   .selectAll(".y-axis")
    //   .data(y.ticks(1))
    //   .enter().append("g");

    // yTick.append("circle")
    //   .attr("fill", "transparent")
    //   .attr("stroke", "#eee")
    //   .attr('stroke-width', 1)
    //   .attr('class', function (d, i) { return 'ring-' + d; })
    //   .attr("r", y);

    var linePlot1 = g.append('path')
      .datum(data)
      .attr('class', 'tmax')
      .attr('d', lineTMAX);

    var linePlot2 = g.append('path')
      .datum(data)
      .attr('class', 'tmin')
      .attr('d', lineTMIN);

    g.selectAll('.high')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'high')
      .attr('cx', function (d) { return Math.cos(x(d.DATE) - (Math.PI / 2)) * y(d.TMAX); })
      .attr('cy', function (d) { return Math.sin(x(d.DATE) - (Math.PI / 2)) * y(d.TMAX); })
      .attr('r', 2)
      .attr('fill', function (d) {
        if (d.TMAX >= 100) {
          return 'red'
        } else {
          return 'transparent'
        }
      })
      .on('mouseover', (d) => {
        div.transition()		
          .duration(200)		
          .style("opacity", .9);
          
        div.html(`<div class="date">${prettyDate(d.DATE)}</div><div class="low">${d.TMAX}</div>`)
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {		
        div.transition()		
          .duration(500)		
          .style("opacity", 0);	
      });

    g.selectAll('.low')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'low')
      .attr('cx', function (d) { return Math.cos(x(d.DATE) - (Math.PI / 2)) * y(d.TMIN); })
      .attr('cy', function (d) { return Math.sin(x(d.DATE) - (Math.PI / 2)) * y(d.TMIN); })
      .attr('r', 2)
      .attr('fill', function (d) {
        if (d.TMIN <= 0) {
          return 'blue'
        } else {
          return 'transparent'
        }
      })
      .on('mouseover', (d) => {
        div.transition()		
          .duration(200)		
          .style("opacity", .9);

        div.html(`<div class="date">${prettyDate(d.DATE)}</div><div class="low">${d.TMIN}</div>`)
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {		
        div.transition()		
          .duration(500)		
          .style("opacity", 0);	
      });

    // var labels = yTick.append("text")
    //     .attr("y", function(d) { return -y(d); })
    //     .attr("dy", "0.35em")
    //     .text(function(d) { return d; });

    // yTick.append("text")
    //   .attr("y", function(d) { return -y(d); })
    //   .attr("dy", "0.35em")
    //   .text(function(d) { return d; });

    var xAxis = g.append("g");

    var xTick = xAxis
      .selectAll("g")
      .data(x.ticks(12))
      .enter().append("g")
      .attr("text-anchor", "middle")
      .attr("transform", function (d) {
        return "rotate(" + ((x(d)) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)";
      });

    // xTick.append("line")
    //   .attr("x2", -5)
    //   .attr("stroke", "#000");

    // xTick.append("text")
    //   .attr("transform", function (d) {
    //     var angle = x(d);
    //     return ((angle < Math.PI / 2) || 
    //       (angle > (Math.PI * 3 / 2))) ? "rotate(90)translate(0,22)" : "rotate(-90)translate(0, -15)";
    //   })
    //   .text(function (d) {
    //     return formatMonth(d);
    //   })
    //   .attr("opacity", 0.6)

    var title = g.append("g")
      .attr("class", "title")
      .append("text")
      .attr("dy", "-0.2em")
      .attr("text-anchor", "middle")
      .text(year)

    // var subtitle = g.append("text")
    // 		.attr("dy", "1em")
    //     .attr("text-anchor", "middle")
    // 		.attr("opacity", 0.6)
    // 		.text("16/17");  

    // var lineLength = linePlot.node().getTotalLength();

    // linePlot
    //   .attr("stroke-dasharray", lineLength + " " + lineLength)
    //   .attr("stroke-dashoffset", -lineLength)
    //   .transition()
    //     .duration(2000)
    //     .ease(d3.easeLinear)
    //     .attr("stroke-dashoffset", 0);
  }
});

$(document).ready(function() {

  for (var i = 1948; i < 2019; i++) {
    $('select').append(`<option value="${i}">${i}</option>`);
  }

  $('select').change(function() {
    let year = $(this).val();

    if (year === 'all') {
      $('.year').removeClass('active inactive');

    } else {
      $('.year').addClass('inactive').removeClass('active');
  
      $(`.year-${year}`).removeClass('inactive').addClass('active');

      d3.select(`.year-${year}`).raise();
    }
  });

});
