d3.csv('data.csv').then(function (csvData) {
  // console.log(csvData);

  let dataMap = {};

  for (let d1 of csvData) {
    let d2 = dataMap[d1.year];

    if (!d2) {
      d2 = {
        year: d1.year,
        totalDonations: 0
      };

      dataMap[d1.year] = d2;
    }

    d2.totalDonations += +d1.commitment_amount_usd_constant;
  }

  let data = [];

  for (let year in dataMap) {
    data.push(dataMap[year]);
  }

  buildChart(data);
});

function buildChart(data) {
  let svg = d3.select('#mainChart'),
    width = +svg.attr('width'),
    height = +svg.attr('height');



  let gradient = svg.append('defs')
    .append('radialGradient')
    .attr('id', 'gradient');

  gradient.append('stop')
    .attr('offset', '75%')
    .attr('stop-color', '#FF9133');

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#FF0015');


  let base = svg.append('g')
    .attr('class', 'base-group')
    .attr('transform', `translate(${(width / 2)}, ${(height / 2)})`);

  let theta = (2 * Math.PI) / data.length;
  let startAngle = -1 * Math.PI / 2;

  let maxDonations = d3.max(data, d => d.totalDonations);

  let radius = d3.scaleLinear()
    .domain([0, maxDonations])
    .range([0, 100]);

  for (let i = 0; i < data.length; i++) {
    let d = data[i];
    d.angle = startAngle + theta * i;
    d.radius = radius(d.totalDonations);
  }

  console.log(data);

  const innerRadius = 200;

  let areaGenerator = d3.areaRadial()
    .curve(d3.curveBasisClosed)
    .angle(d => d.angle)
    .innerRadius(innerRadius)
    .outerRadius(d => innerRadius + d.radius);

  let pathData = areaGenerator(data);

  base.append('path')
    .attr('d', pathData)
    // .style('fill', 'url(#gradient)');
    .style('fill', 'steelblue');
}