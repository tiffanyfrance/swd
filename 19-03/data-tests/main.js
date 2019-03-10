function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

d3.csv('data.csv')
.then(function(data) {
  console.log(data);

  let uniqueDonors = new Set();
  let donorsMap = {};

  for(let d of data) {
    uniqueDonors.add(d.donor);

    let country = donorsMap[d.donor];

    if(!country) {
      country = {
        name: d.donor,
        totalDonations: 0
      };

      donorsMap[d.donor] = country;
    }

    country.totalDonations += +d.commitment_amount_usd_constant;
  }

  uniqueDonors = Array.from(uniqueDonors);
  let donors = [];

  for(let name of uniqueDonors) {
    // donorsMap[name].logTotal = getBaseLog(1.1, donorsMap[name].totalDonations);
    donorsMap[name].logTotal = donorsMap[name].totalDonations;
    donors.push(donorsMap[name]);
  }

  donors.sort((a,b) => b.totalDonations - a.totalDonations);

  donors = donors.slice(0,20);

  console.log(donors);

  // let h = 500,
  //   w = 1200,
  //   m = {t: 10, b: 10, l: 10, r: 10};

  let svg = d3.select('#countries');
    // .attr('height', h)
    // .attr('width', w);

  let maxDonation = d3.max(donors, (d) => d.totalDonations);

  let powerScale = d3.scalePow()
    .exponent(0.75)
    .domain([0, maxDonation])
    .range([0, 10]);

  let g = svg.selectAll('g')
    .data(donors)
    .enter()
    .append('g')
    .attr('transform', function (d, i) {
      let x = ((0.5 + i) / donors.length) * 100;
      let y = 25;

      return `translate(${x},${y})`;
    });

  g.append('circle')
      // .attr("cx", function (d, i) {
      //   return ((0.5 + i) / donors.length) * 100;
      // })
      // .attr('cy', 25)
      .attr('r', (d) => {
        return powerScale(d.totalDonations);
        // return (getBaseLog(1.1, d.totalDonations)/getBaseLog(1.1, maxDonation)) * 1;
        // return (getBaseLog(1.1, d.totalDonations)/getBaseLog(1.1, maxDonation)) * 1;
      })
      .attr('fill', 'black')
      .style('opacity', 0.5);

  g.append('text')
      .text((d) => d.name)
      .style('font-size', '0.5px')
      .attr('transform', 'rotate(270)');








});