/* design and development by Tiffany France
 * tiffany6872@gmail.com
 * tiffanyfrance.com
 * SWD May 2019
 * KonMari-ing my Closet
*/

let firstVisibleIndex = 1;

$(window).scroll(() => {
  $('.tooltip').css('opacity', 0);
  $('.scroll-down').fadeTo(1000, 0);

  let $firstVisible;

  let $items = $('li');

  $items.css('color', '#333');

  let i = 0;

  for (; i < $items.length; i++) {
    let $item = $($items[i]);
    let y = $item.offset().top - $(document).scrollTop() - 200 + 15;

    if (y > 0) {
      $firstVisible = $item;
      break;
    }
  }

  if (!$firstVisible) {
    i = $items.length;
  } else {
    let color = '#ccc';

    if (data[i]['Spark joy'] === '1') {
      color = 'gold';
    } else if (data[i]['Keep'] === 1) {
      color = '#FF5858';
    }

    $firstVisible.css('color', color);
  }

  if (firstVisibleIndex != i) {
    sortData(data.slice(0, i + 1));
    firstVisibleIndex = i;

    if (i === $items.length) {
      $('#final-credits').fadeTo(500, 1);
    }
  }
});

const windowWidth = $(window).innerWidth(),
  windowHeight = $(window).innerHeight();

console.log(windowWidth)

const margin = (windowWidth < 1020) ? { top: 10, right: 0, bottom: 75, left: 0 } : { top: 10, right: 10, bottom: 75, left: 50 },
  width = 380 - margin.left - margin.right,
  mobileWidth = (d3.select('#viz').node().getBoundingClientRect().width / 2) - margin.left - margin.right,
  height = (windowWidth < 1020) ? ((windowHeight * .75) - margin.bottom) : (600 - margin.top - margin.bottom);

const barWidth = (windowWidth < 1020) ? (mobileWidth / 6) : 55,
// const barWidth = mobileWidth / 5, // Make percentage instead of fixed
  barPadding = 3,
  barHeight = 8; // Make percentage instead of fixed

let tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let data;
let donateSvg, keepSvg;

d3.csv('data.csv', (error, result) => {
  if (error) throw error;

  data = result;

  data.forEach((d) => {
    d.Keep = +d.Keep;
    d.Donate = +d.Donate;
  });

  d3.select('#poetry').selectAll('li')
    .data(data)
    .enter()
    .append('li')
    .text((d) => (d.Description).charAt(0).toUpperCase() + (d.Description).slice(1));

  console.log(data);
  sortData([]);
});

function sortData(data) {
  let keepData = [],
    donateData = [];

  for (var i = 0; i < data.length; i++) {
    if (data[i].Keep === 1) {
      keepData.push(data[i]);
    } else {
      donateData.push(data[i]);
    }
  }

  if (!donateSvg) {
    donateSvg = createChart('Donate/Toss');
  }
  updateChart(donateSvg, donateData, '#ccc');

  if (!keepSvg) {
    keepSvg = createChart('Keep');
  }
  updateChart(keepSvg, keepData, '#FF5858');
}

function createChart(label) {
  let svg = d3.select('#viz')
    .append('div')
    .attr('class', 'col')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'stack')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top * 2})`);

  svg.append('text')
    .text(label)
    .attr('text-anchor', 'middle')
    .attr('x', (d) => (5 * (barWidth + barPadding)) / 2)
    .attr('y', (d) => height + margin.bottom - margin.top)
    .attr('dy', -40)
    .style('text-transform', 'uppercase')
    .style('font-size', 10);

  svg.append('text')
    .text(0)
    .attr('class', 'count')
    .attr('text-anchor', 'middle')
    .attr('x', (d) => (5 * (barWidth + barPadding)) / 2)
    .attr('y', (d) => height + margin.bottom - margin.top)
    .attr('dy', -5)
    .style('text-transform', 'uppercase')
    .style('font-size', 30);

  return svg;
}

function updateChart(svg, data, color) {
  svg.select('text.count')
    .text(data.length);

  let rect = svg.selectAll('rect')
    .data(data);

  rect.enter()
    .append('rect')
    .attr('width', barWidth)
    .attr('height', barHeight)
    .attr('fill', (d) => {
      if (d['Spark joy'] == 1) {
        return 'gold';
      } else {
        return color;
      }
    })
    .attr('x', (d, i) => i % 5 * (barWidth + barPadding))
    .attr('y', (d, i) => height - Math.floor(i / 5) * (barHeight + barPadding))
    .style('opacity', 0)
    .on("mouseover", function (d) {
      let htmlStr = '';
      let description = (d.Description).toLowerCase();

      if (d.Keep == 0) {
        if (d['Spark joy'] == 1) {
          htmlStr += '🌟 Sparked joy!<br />';
        }

        htmlStr += `🙏 Thank you, ${description}.`;
      } else {
        if (d['Spark joy'] == 1) {
          htmlStr += '🌟 Sparks joy!<br />';
        }

        htmlStr += `👍 You get to stay, ${description}!`;
      }

      tooltip.transition()
        .duration(200)
        .style("opacity", 1);

      tooltip.html(htmlStr)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .merge(rect)
    .transition()
    .duration(200)
    .style('opacity', 1);

  rect.exit()
    .transition()
    .duration(200)
    .style('opacity', 0)
    .remove();
}