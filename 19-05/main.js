/* design and development by Tiffany France
 * tiffany6872@gmail.com
 * tiffanyfrance.com
 * SWD May 2019
 * Kon Marie-ing my Closet
*/

const margin = {top: 10, right: 10, bottom: 20, left: 50},
    width = 380 - margin.left - margin.right,
    height = 680 - margin.top - margin.bottom;

d3.csv('data.csv', (error, data) => {
  if (error) throw error;

  data.forEach((d) => {
    d.Keep = +d.Keep;
    d.Donate = +d.Donate;
  });

  d3.select('#poetry').selectAll('li')
    .data(data)
    .enter()
    .append('li')
    .text((d) => d.Description);

  sortData(data);
  console.log(data);
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
  
  addRect(donateData, '#ccc');
  addRect(keepData, 'red');
}

function addRect(data, color) {
  let svg = d3.select('#viz')
    .append('div')
    .attr('class', 'col')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'stack')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top * 2})`);

  let delta = Math.floor(data.length / 5);

  console.log(delta)

  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('width', 20)
    .attr('height', 5)
    .attr('fill', (d) => {
      if (d['Spark joy'] === 1) {
        return 'gold';
      } else {
        return color;
      }
    })
    .attr('x', (d, i) => 25) 
    .attr('y', (d, i) => height - Math.floor(i/5) * 10);
}
