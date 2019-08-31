let margin = { top: 0, right: 0, bottom: 0, left: 0 },
  containerWidth = d3.select('.col-right').node().getBoundingClientRect().width;

let width = containerWidth - margin.left - margin.right,
  height = containerWidth - margin.top - margin.bottom;

let innerRadius = 10,
  outerRadius = Math.min(width, height) / 2 - 6;

let parseTime = d3.timeParse("%Y-%m-%d"),
  formatMonth = d3.timeFormat("%b"),
  fullCircle = 2 * Math.PI;

let svg = d3.select(".col-right").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x = d3.scaleTime()
  .range([0, fullCircle]);

let y = d3.scaleRadial()
  .range([innerRadius, outerRadius]);

let lineTMAX = d3.lineRadial()
  .angle(function (d) { return x(d.DATE); })
  .radius(function (d) { return y(d.TMAX); });

let lineTMIN = d3.lineRadial()
  .angle(function (d) { return x(d.DATE); })
  .radius(function (d) { return y(d.TMIN); });

let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let prettyDate = d3.timeFormat('%a, %b %d, %Y');

d3.csv("weather.csv", function (d) {
  d.DATE = parseTime(d.DATE);
  d.TMAX = +d.TMAX;
  d.TMIN = +d.TMIN;

  return d;
}, function (error, data) {
  if (error) throw error;

  let dataByYear = getDataByYear(data);

  buildBackgroundPath(dataByYear);

  for (let year in dataByYear) {
    buildYear(year, svg, dataByYear[year]);
  }

  console.log(dataByYear);
});

function getDataByYear(data) {
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

  return dataByYear;
}

function buildBackgroundPath(dataByYear) {
  let maxVals = getMaxVals(dataByYear);

  let bgTMAX = d3.lineRadial()
    .angle(function (d) { return d.angle; })
    .radius(function (d) { return d.radius; });

  let g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  g.append("path")
    .datum(maxVals)
    .attr("fill", "#efefef")
    .attr("stroke", "none")
    .attr("d", bgTMAX)
}

function getMaxVals(dataByYear) {
  let maxVals = [];

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

  return maxVals;
}

function buildYear(year, svg, data) {
  let className = 'year year-' + year;

  let g = svg.append("g")
    .attr('class', className)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  x.domain(d3.extent(data, function (d) { return d.DATE; }));
  y.domain([-8, 105]);

  let linePlot1 = g.append('path')
    .datum(data)
    .attr('class', 'tmax')
    .attr('d', lineTMAX);

  let linePlot2 = g.append('path')
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
    .attr('fill', 'red')
    .style('visibility', function (d) {
      if (d.TMAX >= 100) {
        return 'visible'
      } else {
        return 'hidden'
      }
    })
    .on('mouseover', (d) => {
      div.transition()
        .duration(200)
        .style("opacity", .9);

      div.html(`<div class="date">${prettyDate(d.DATE)}</div><div class="red">${d.TMAX}°F</div>`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
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
    .attr('fill', 'blue')
    .style('visibility', function (d) {
      if (d.TMIN <= 0) {
        return 'visible'
      } else {
        return 'hidden'
      }
    })
    .on('mouseover', (d) => {
      div.transition()
        .duration(200)
        .style("opacity", .9);

      div.html(`<div class="date">${prettyDate(d.DATE)}</div><div class="blue">${d.TMIN}°F</div>`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });

  let xAxis = g.append("g");

  let xTick = xAxis
    .selectAll("g")
    .data(x.ticks(12))
    .enter().append("g")
    .attr("text-anchor", "middle")
    .attr("transform", function (d) {
      return "rotate(" + ((x(d)) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)";
    });

  let title = g.append("g")
    .attr("class", "title")
    .append("text")
    .attr("dy", "-0.2em")
    .attr("text-anchor", "middle")
    .text(year)
}


$(document).ready(function () {

  for (let i = 1948; i < 2019; i++) {
    $('select').append(`<option value="${i}">${i}</option>`);
  }

  $('select').change(function () {
    let year = $(this).val();

    if (year === 'all') {
      $('.year').removeClass('active inactive');
      $('.legend-1').show();

    } else {
      $('.year').addClass('inactive').removeClass('active');
      $(`.year-${year}`).removeClass('inactive').addClass('active');
      $('.legend-1').hide();
      $('.legend-3').empty();

      d3.select(`.year-${year}`).raise();
    }
  });

  //.tmin, .low

  $('.high-checkbox').on('change', function (event) {
    console.log(event.target.checked)
  });


});


