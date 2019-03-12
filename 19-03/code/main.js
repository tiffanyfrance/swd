let format = (num) => d3.format('.2s')(num).replace(/G/,'B'),
    curr = d3.format("$,"),
    base;

d3.csv('data.csv').then(function (csvData) {
  // console.log(csvData);

  let overall = {
    title: 'Country Aid by Year (1973-2013)',
    total: 0,
    donors: {},
    recipients: {}
  };

  let dataMap = {};

  for (let d1 of csvData) {
    let amount = +d1.commitment_amount_usd_constant;

    overall.total += amount;
    addToTotal(overall.donors, d1.donor, amount);
    addToTotal(overall.recipients, d1.recipient, amount);

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

    d2.total += amount;

    addToTotal(d2.donors, d1.donor, amount);
    addToTotal(d2.recipients, d1.recipient, amount);
  }

 

  overall.donors = mapToSortedArray(overall.donors);
  overall.recipients = mapToSortedArray(overall.recipients);

  let data = [];

  for (let year in dataMap) {
    let d = dataMap[year];

    d.donors = mapToSortedArray(d.donors);
    d.recipients = mapToSortedArray(d.recipients);

    data.push(d);
  }

  buildChart(overall, data);
});

function addToTotal(map, name, amount) {
  let value = map[name];

  if (!value) {
    value = {
      name: name,
      total: 0
    };

    map[name] = value;
  }

  value.total += amount;
}

function mapToSortedArray(map) {
  let array = [];

  for (let name in map) {
    array.push(map[name]);
  }

  array.sort((a, b) => b.total - a.total);

  return array;
}

function buildChart(overall, data) {
  console.log(overall);

  let svg = d3.select('#mainChart'),
    width = +svg.attr('width'),
    height = +svg.attr('height');

  let gradient = svg.append('defs')
    .append('radialGradient')
    .attr('id', 'gradient');

  gradient.append('stop')
    .attr('offset', '65%')
    .attr('stop-color', 'lightblue');

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'steelblue');


  base = svg.append('g')
    .attr('class', 'base-group')
    .attr('transform', `translate(${(width / 2)}, ${(height / 2)})`);

  let theta = (2 * Math.PI) / data.length;
  let startAngle = -1 * Math.PI / 2;

  let maxTotal = d3.max(data, d => d.total);

  let radius = d3.scaleLinear()
    .domain([0, maxTotal])
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
    .style('fill', 'url(#gradient)');
    // .style('fill', 'steelblue');

  const textRadius = innerRadius - 20;

  base.append('g')
    .selectAll('text.year')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'year')
    .attr('text-anchor', 'middle')
    .text(d => d.year)
    .attr('transform', function (d, i) {
      let x = Math.cos(d.angle) * textRadius;
      let y = Math.sin(d.angle) * textRadius;
      let rotate = (d.angle * (180 / Math.PI)) + 90;
      return `translate(${x},${y}) rotate(${rotate})`;
    })
    .style('font-size', '10px');

  buildCenterStuff(overall);

  base.append('circle')
    .attr('r', width/3.4)
    .attr('stroke', '#eee')
    .attr('stroke-width', 5)
    .attr('fill', 'none')
    .attr('stroke-dasharray', 2);

  buildInvisibleDonut(data,width,height);
}


function buildCenterStuff(stuff) {

  base.select('.center-group').remove();

  let centerGroup = base.append('g')
    .attr('class', 'center-group');

  centerGroup.append('text')
    .attr('text-anchor', 'middle')
    .text(stuff.title)
    .attr('transform', 'translate(0, -180)')
    .style('font-size', '18px')
    .style('font-weight', '700');

  centerGroup.append('text')
    .attr('text-anchor', 'middle')
    .text(`Donated: ${curr(stuff.total)}`)
    .attr('transform', 'translate(0, -150)')
    .style('font-size', '14px');

  createMajorDonors(centerGroup, stuff.donors.slice(0, 5));
  createMajorRecipients(centerGroup, stuff.recipients.slice(0, 5));
}

function createMajorDonors(centerGroup, donors) {

  const width = 400;
  const deltaX = width / donors.length;
  const startX = -(width / 2) + (0.5 * deltaX);

  let majorDonors = centerGroup.append('g')
    .attr('transform', 'translate(0, -60)');

  majorDonors.append('text')
    .attr('text-anchor', 'middle')
    .text('Major Donors')
    .attr('transform', 'translate(0, -30)')
    .style('font-size', '12px');

  let donor = majorDonors.selectAll('g')
    .data(donors)
    .enter()
    .append('g')
    .attr('transform', function (d, i) {
      let x = startX + (i * deltaX);
      return `translate(${x}, 0)`;
    });

  donor.append('text')
    .attr('text-anchor', 'middle')
    .text(d => d.name);

  donor.append('text')
    .attr('text-anchor', 'middle')
    .text(d => '$' + format(d.total))
    .attr('transform', 'translate(0, 15)');

  const maxRadius = 30;

  let maxTotal = d3.max(donors, d => d.total);

  let radius = d3.scaleLinear()
    .domain([0, maxTotal])
    .range([0, maxRadius]);

  let greenShades = ['#20B01A','#41C558','#92DD79','#9EE287','#B7E9A6']

  donor.append('circle')
    .attr('fill', (d,i) => greenShades[i])
    .attr('cy', maxRadius + 40)
    .attr('r', d => radius(d.total))
    .attr('transform', 'translate(0, -15)');
}

function createMajorRecipients(centerGroup, recipients) {
  const startY = 0;
  const deltaY = 22;

  let majorRecipients = centerGroup.append('g')
    .attr('transform', 'translate(0, 100)');

  majorRecipients.append('text')
    .attr('text-anchor', 'middle')
    .text('Major Recipients')
    .attr('transform', 'translate(0, -30)')
    .style('font-size', '12px');

  let recipient = majorRecipients.selectAll('g')
    .data(recipients)
    .enter()
    .append('g')
    .attr('transform', function (d, i) {
      let y = startY + (i * deltaY);
      return `translate(-140, ${y})`;
    });

  recipient.append('text')
    .attr('text-anchor', 'end')
    .text(d => d.name)
    .attr('transform', 'translate(50, 0)');

  const maxBarWidth = 250;
  const barHeight = 20;

  let maxTotal = d3.max(recipients, d => d.total);

  let width = d3.scaleLinear()
    .domain([0, maxTotal])
    // .domain([0, 11000000000])
    .range([0, maxBarWidth]);

  recipient.append('rect')
    .attr('fill', 'lightgrey')
    .attr('x', 60)
    .attr('width', d => width(d.total))
    .attr('y', -6 -(barHeight / 2))
    .attr('height', barHeight)
    .attr('rx','3')
    .attr('ry','3');

  recipient.append('text')
    // .attr('text-anchor', 'end')
    .text(d => '$' + format(d.total))
    .attr('transform', (d) => `translate(${65 + width(d.total)}, -2)`);
}

function buildInvisibleDonut(data,width,height) {

  let thickness = 160;
  let radius = width / 2 + 8; //cutting off the right part of donut

  let arc = d3.arc()
    // .startAngle(-1 * Math.PI / 2)
    .innerRadius(radius - thickness)
    .outerRadius(radius);

  let pie = d3.pie()
    // .startAngle(-1 * Math.PI / 2)
    .value(d => d.year)
    .sort(null);

  let donut = base.append('g')
    .attr('id','invisible-donut')
    .attr('transform', 'rotate(-3.5)');

  let path = donut.selectAll('path')
    .data(pie(data))
    .enter()
    .append('g')
    .append('path')
    .attr('d', arc)
    // .attr('fill', (d,i) => color(i));
    .style('fill', 'white')
    .style('fill-opacity', '0')
    .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .style("fill", "white")
        .style('fill-opacity', '0.3');

      buildCenterStuff(d.data);
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .style('fill-opacity', '0');
    })
    .each(function(d, i) { this._current = i; });
}



