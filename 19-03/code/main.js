d3.csv('data.csv').then(function (csvData) {
  console.log(csvData);

  let overall = {
    title: 'Overall',
    total: 0,
    donors: {},
    recipients: {}
  };

  let dataMap = {};

  for (let d1 of csvData) {
    let d2 = dataMap[d1.year];

    if (!d2) {
      d2 = {
        title: d1.year,
        year: d1.year,
        total: 0,
        donors: {},
        recipients: {}
      };

      dataMap[d1.year] = d2;
    }

    d2.total += +d1.commitment_amount_usd_constant;

    let donorData = d2.donors[d1.donor];

    if (!donorData) {
      donorData = {
        name: d1.donor,
        total: 0
      };

      d2.donors[d1.donor] = donorData;
    }

    donorData.total += +d1.commitment_amount_usd_constant;

    let recipientData = d2.recipients[d1.recipient];

    if (!recipientData) {
      recipientData = {
        name: d1.recipient,
        total: 0
      };

      d2.recipients[d1.recipient] = recipientData;
    }

    recipientData.total += +d1.commitment_amount_usd_constant;
  }

  let data = [];

  for (let year in dataMap) {
    let d = dataMap[year];

    let donors = [];
    
    for(let name in d.donors) {
      donors.push(d.donors[name]);
    }

    donors.sort((a, b) => b.total - a.total);

    d.donors = donors;

    let recipients = [];
    
    for(let name in d.recipients) {
      recipients.push(d.recipients[name]);
    }

    recipients.sort((a, b) => b.total - a.total);

    d.recipients = recipients;

    data.push(d);
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

  let maxDonations = d3.max(data, d => d.total);

  let radius = d3.scaleLinear()
    .domain([0, maxDonations])
    .range([0, 200]);

  for (let i = 0; i < data.length; i++) {
    let d = data[i];
    d.angle = startAngle + theta * i;
    d.radius = radius(d.total);
  }

  console.log(data);

  const innerRadius = 300;

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

  const textRadius = innerRadius - 20;

  base.selectAll('.text')
    .data(data)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .text(d => d.year)
    .attr('transform', function (d, i) {
      let x = Math.cos(d.angle) * textRadius;
      let y = Math.sin(d.angle) * textRadius;
      let rotate = (d.angle * (180 / Math.PI)) + 90;
      return `translate(${x},${y}) rotate(${rotate})`;
    });
}