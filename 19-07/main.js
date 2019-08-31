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

let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let prettyDate = d3.timeFormat('%a, %b %d, %Y');

d3.csv("weather.csv", (d) => {
  d.DATE = parseTime(d.DATE);
  d.TMAX = +d.TMAX;
  d.TMIN = +d.TMIN;

  return d;
}, (error, data) => {
  if (error) throw error;

  let dataByYear = getDataByYear(data);

  buildBackgroundPath(dataByYear);

  for (let year in dataByYear) {
    buildYearGraph(year, svg, dataByYear[year]);
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
    .angle(d => d.angle)
    .radius(d => d.radius);

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

    x.domain(d3.extent(dataByYear[d.year], d => d.DATE));
    y.domain([-8, 105]);

    d.angle = x(d.DATE);
    d.radius = y(d.TMAX);

    maxVals[i] = d;
  }

  return maxVals;
}

function buildYearGraph(year, svg, data) {
  let className = 'year year-' + year;

  let g = svg.append("g")
    .attr('class', className)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  x.domain(d3.extent(data, d => d.DATE));
  y.domain([-8, 105]);

  buildTemperatureGroup(g, data, 'TMAX', d => d.TMAX >= 100);
  buildTemperatureGroup(g, data, 'TMIN', d => d.TMIN <= 0);
}

function buildTemperatureGroup(parent, data, keyName, isVisible) {
  let g = parent.append("g")
    .attr('class', keyName);

  let line = d3.lineRadial()
    .angle(d => x(d.DATE))
    .radius(d => y(d[keyName]));

  g.append('path')
    .datum(data)
    .attr('d', line);

  g.selectAll(`.${keyName} circle`)
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => Math.cos(x(d.DATE) - (Math.PI / 2)) * y(d[keyName]))
    .attr('cy', d => Math.sin(x(d.DATE) - (Math.PI / 2)) * y(d[keyName]))
    .attr('r', 2)
    .style('visibility', d => isVisible(d) ? 'visible' : 'hidden')
    .on('mouseover', d => {
      div.transition()
        .duration(200)
        .style("opacity", .9);

      div.html(`<div class="date">${prettyDate(d.DATE)}</div><div class="${keyName}">${d[keyName]}°F</div>`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", d => {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

$(document).ready(() => {
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

  $('.high-checkbox').on('change', () => $('.TMAX').toggle());
  $('.low-checkbox').on('change', () => $('.TMIN').toggle());
});


