let format = (num) => d3.format('.2s')(num).replace(/G/,'B'),
    curr = d3.format("$,"),
    base,
    categoriesBase;

const innerRadius = 300;
const textRadius = innerRadius - 20;

const BLUE_SHADES = ['#4983B5','#639AC2','#78ACCC','#8DBDD7','#ACD7E6'];
const GREEN_SHADES = ['#20B01A','#41C558','#92DD79','#9EE287','#B7E9A6'];

d3.csv('data.csv').then(csvData => {
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

  createChart(csvData);
  buildCategories(csvData);
});

function buildCategories(csvData) {
  for(let d of csvData) {
    let category = categories.find(c => d.coalesced_purpose_code.startsWith(c.prefix));
    let amount = +d.commitment_amount_usd_constant;

    category.total += amount;
    category.totalByYear[d.year] += amount;
  }

  for(let c of categories) {
    c.count = Math.round(c.total / 100000000);

    c.countByYear = {};

    for(let year in c.totalByYear) {
      c.countByYear[year] = Math.round(c.totalByYear[year] / 100000000);
    }
  }

  categories = categories.filter(c => c.count > 10);

  categoriesBase = base.append('g')
    .attr('class', 'categories');

  buildDollars();
}

function buildDollars(year) {
  categoriesBase.selectAll('.category').remove();

  let catBlock = categoriesBase.selectAll('.category')
    .data(categories)
    .enter();

  catBlock.each(function(d) {
    let yearCount = 0;

    if(year) {
      yearCount = d.countByYear[year];
    }

    let yearStr = '';

    for (var i = 0; i < yearCount; i++) {
      yearStr += '$ ';
    }

    let str = '';

    for (var i = 0; i < (d.count - yearCount); i++) {
      str += '$ ';
    }

    let foreignObj = categoriesBase.append('foreignObject')
      .attr('class', 'category')
      .attr('x', d.x)
      .attr('y', d.y)
      .attr("width", d.w)
      .attr("height", d.h)
      .append("xhtml:div")
      .html(`
        <h2>${d.name}</h2>
        <p><span style="color: green;">${yearStr}</span>${str}</p>
        `);

  });
}

function createChart(csvData) {
  // console.log(csvData);

  let overall = {
    title: 'All Years (1973-2013)',
    total: 0,
    donors: {},
    recipients: {},
    donorColors: BLUE_SHADES,
    recipientColor: '#aaa'
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
        maxTotal: 10000000000,
        total: 0,
        donors: {},
        recipients: {},
        donorColors: GREEN_SHADES,
        recipientColor: 'lightgrey'
      };

      dataMap[d1.year] = d2;
    }

    d2.total += amount;

    addToTotal(d2.donors, d1.donor, amount);
    addToTotal(d2.recipients, d1.recipient, amount);
  }

  let data = [];

  for (let year in dataMap) {
    let d = dataMap[year];

    d.donors = mapToSortedArray(d.donors);
    d.recipients = mapToSortedArray(d.recipients);

    data.push(d);
  }

  overall.donors = mapToSortedArray(overall.donors);
  overall.recipients = mapToSortedArray(overall.recipients);
  overall.maxTotal = d3.max(overall.recipients, d => d.total);

  buildMainChart(overall, data);
}

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

function buildMainChart(overall, data) {
  console.log(overall);

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

  buildCenterStuff(overall);

  base.append('circle')
    .attr('r', 260)
    .attr('stroke', '#eee')
    .attr('stroke-width', 5)
    .attr('fill', 'none')
    .attr('stroke-dasharray', 2);

  buildYears(data);
  buildInvisibleDonut(data,200,460,overall,'white');
}

function buildCenterStuff(stuff) {

  base.select('.center-group').remove();

  let centerGroup = base.append('g')
    .attr('class', 'center-group');

  centerGroup.append('text')
    .attr('text-anchor', 'middle')
    .text(stuff.title)
    .attr('transform', 'translate(0, -190)')
    .style('font-size', '18px');

  centerGroup.append('text')
    .attr('text-anchor', 'middle')
    .text(`Donated: ${curr(stuff.total)}`)
    .attr('transform', 'translate(0, -160)')
    .style('font-size', '14px')
    .style('font-weight', 500);

  createMajorDonors(centerGroup, stuff.donors.slice(0, 5), stuff.maxTotal, stuff.donorColors);
  createMajorRecipients(centerGroup, stuff.recipients.slice(0, 5), stuff.maxTotal, stuff.recipientColor);
}

function createMajorDonors(centerGroup, donors, maxTotal, colors) {

  const width = 400;
  const deltaX = width / donors.length;
  const startX = -(width / 2) + (0.5 * deltaX);

  let majorDonors = centerGroup.append('g')
    .attr('transform', 'translate(0, -70)');

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

  const maxRadius = 60;

  // let maxTotal = d3.max(donors, d => d.total);

  // let radius = d3.scaleLinear()
  //   // .domain([0, maxTotal])
  //   .domain([0, 11000000000])
  //   .range([0, maxRadius]);

  let radius = d3.scalePow()
    .exponent(0.5)
    .domain([0, maxTotal])
    // .domain([0, 11000000000])
    .range([0, maxRadius]);

  donor.append('circle')
    .attr('fill', (d,i) => colors[i])
    .attr('cy', maxRadius + 40)
    .attr('r', d => radius(d.total))
    .attr('transform', 'translate(0, -15)');
}

function createMajorRecipients(centerGroup, recipients, maxTotal, color) {
  const startY = 0;
  const deltaY = 22;

  let majorRecipients = centerGroup.append('g')
    .attr('transform', 'translate(0, 110)');

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

  // let maxTotal = d3.max(recipients, d => d.total);

  // let width = d3.scaleLinear()
  //   .domain([0, maxTotal])
  //   .range([0, maxBarWidth]);

  let width = d3.scalePow()
    .exponent(0.5)
    .domain([0, maxTotal])
    .range([0, maxBarWidth]);

  recipient.append('rect')
    .attr('fill', color)
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

function buildInvisibleDonut(data,thickness,radius,overall,color) {

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

  let lastHoveredData = null;

  let path = donut.selectAll('path')
    .data(pie(data))
    .enter()
    .append('g')
    .append('path')
    .attr('d', arc)
    .style('fill', color)
    .style('fill-opacity', '0')
    .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .style("fill", color)
        .style('fill-opacity', '0.3');

      buildCenterStuff(d.data);
      buildDollars(d.data.year);
      lastHoveredData = d.data;
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .style('fill-opacity', '0');

      if(lastHoveredData === d.data) {
        buildCenterStuff(overall);
        buildDollars();
      }
    })
    .each(function(d, i) { this._current = i; });
}

function buildYears(data) {
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
}

