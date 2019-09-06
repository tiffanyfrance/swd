let margin = { top: 0, right: 0, bottom: 40, left: 0 },
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

let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let prettyDate = d3.timeFormat('%a, %b %d, %Y');

const animDelay = 1000;
const animYearOffset = 150;

d3.csv("weather.csv", (d) => {
  d.DATE = parseTime(d.DATE);
  d.TMAX = +d.TMAX;
  d.TMIN = +d.TMIN;

  return d;
}, (error, data) => {
  if (error) throw error;

  let dataByYear = getDataByYear(data);

  // let averageTMAX = Array(366).fill(0);
  // let averageTMIN = Array(366).fill(0);
  // let count = Array(366).fill(0);

  // for (let year in dataByYear) {
  //   let days = dataByYear[year];

  //   for (let i = 0; i < days.length; i++) {
  //     averageTMAX[i] += days[i].TMAX;
  //     averageTMIN[i] += days[i].TMIN;
  //     count[i]++;
  //   }
  // }

  // for (let i = 0; i < count.length; i++) {
  //   averageTMAX[i] /= count[i];
  //   averageTMIN[i] /= count[i];
  // }

  // console.log(average, count)

  buildBackgroundPath(dataByYear);

  setTimeout(() => {
    let i = 0;
    for (let year in dataByYear) {
      setTimeout(buildYearGraph, i * animYearOffset, year, svg, dataByYear[year], i + 1)
      i++;
    }
  }, animDelay);

  anime({
    targets: '.legend',
    opacity: 1,
    delay: animDelay + (72 * animYearOffset) + 750,
    easing: 'easeInOutSine'
  });

  anime({
    targets: '.filter',
    opacity: 1,
    delay: animDelay + (72 * animYearOffset) + 1750,
    easing: 'easeInOutSine'
  });
});

const DEG_TO_RAD = Math.PI / 180;

let g = svg.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// buildText(g, "WINTER", 30, (outerRadius - 40));
// buildText(g, "SPRING", 110, (outerRadius - 10));
// buildText(g, "SUMMER", 200, (outerRadius + 10));
// buildText(g, "AUTUMN", 290, (outerRadius - 20));

// function buildText(g, text, angle, radius) {
//   angle -= 90;

//   let x = Math.cos(angle * DEG_TO_RAD) * radius;
//   let y = Math.sin(angle * DEG_TO_RAD) * radius;

//   g.append('text')
//     .text(text)
//     .attr('text-anchor', 'middle')
//     .attr('transform', `translate(${x},${y})rotate(${angle + 90})`)
//     .style('fill', '#666')
//     .style('font-size', '8px')
// }

function getDataByYear(data) {
  let dataByYear = {};
  let dataByDay = {};

  for (let d of data) {
    let year = d.DATE.toISOString().substr(0, 4);
    addToMap(dataByYear, year, d);

    let monthDay = d.DATE.toISOString().substr(5, 5);
    addToMap(dataByDay, monthDay, d);
  }

  console.log(dataByDay);

  return dataByYear;
}

function addToMap(map, key, d) {
  let arr = map[key];

  if (!arr) {
    arr = [];
    map[key] = arr;
  }

  arr.push(d);
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

    let x = d3.scaleTime()
      .range([0, fullCircle]);

    let y = d3.scaleRadial()
      .range([innerRadius, outerRadius]);

    x.domain(d3.extent(dataByYear[d.year], d => d.DATE));
    y.domain([-8, 105]);

    d.angle = x(d.DATE);
    d.radius = y(d.TMAX);

    maxVals[i] = d;
  }

  return maxVals;
}

function buildYearGraph(year, svg, data, count) {
  let className = 'year year-' + year;

  let g = svg.append("g")
    .attr('class', className)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  buildTemperatureGroup(g, data, 'TMAX', d => d.TMAX >= 100, count);
  buildTemperatureGroup(g, data, 'TMIN', d => d.TMIN <= 0, count);

  $('#title-years').text(count);
}

function buildTemperatureGroup(parent, data, keyName, isVisible, count) {
  let g = parent.append("g")
    .attr('class', keyName);

  let x = d3.scaleTime()
    .range([0, fullCircle]);

  let y = d3.scaleRadial()
    .range([innerRadius, outerRadius]);

  x.domain(d3.extent(data, d => d.DATE));
  y.domain([-8, 105]);

  let line = d3.lineRadial()
    .angle(d => x(d.DATE))
    .radius(d => y(d[keyName]));

  g.append('path')
    .datum(data)
    .attr('d', line);

  let visibleCircles = data.filter(isVisible);
  buildCircles(g, keyName, visibleCircles, 'visible', x, y);

  setTimeout(() => {
    let hiddenCircles = data.filter(d => !isVisible(d));
    buildCircles(g, keyName, hiddenCircles, 'hidden', x, y);
  }, (72 - count) * animYearOffset + 2500);
}

function buildCircles(g, keyName, data, visibility, x, y) {
  g.selectAll(`.${keyName} circle.circle-${visibility}`)
    .data(data)
    .enter()
    .append('circle')
    .attr('class', `circle-${visibility}`)
    .attr('cx', d => Math.cos(x(d.DATE) - (Math.PI / 2)) * y(d[keyName]))
    .attr('cy', d => Math.sin(x(d.DATE) - (Math.PI / 2)) * y(d[keyName]))
    .attr('r', 2)
    .style('visibility', visibility)
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
      $('.legend-2').hide();
      $('.legend-1').show();

      $('#year-maps').empty();
    } else {
      $('.year').addClass('inactive').removeClass('active');
      $(`.year-${year}`).removeClass('inactive').addClass('active');
      $('.legend-1').hide();
      $('.legend-2').show();

      $('#year-maps').html(`<p>${year}</p>`);

      d3.select(`.year-${year}`).raise();
    }
  });

  $('.high-checkbox').on('change', () => $('.TMAX').toggle());
  $('.low-checkbox').on('change', () => $('.TMIN').toggle());
});


