/* design and development by Tiffany France
 * tiffany6872@gmail.com
 * tiffanyfrance.com
 * SWD May 2019
 * Kon Marie-ing my Closet
*/

const margin = {top: 10, right: 10, bottom: 20, left: 50},
    width = 1280 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

d3.csv("data.csv", (error, data) => {
  if (error) throw error;

  data.forEach((d) => {
    d.Keep = +d.Keep;
    d.Donate = +d.Donate;
  });

  buildRect(data);
  console.log(data)
});

function buildRect(data) {
  let svg = d3.select('#viz').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top * 2})`);

  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('width', 20)
    .attr('height', 5)
    .attr('fill', (d, i) => {
      if (d['Spark joy'] === 1) {
        return 'gold';
      } else if (d.Keep === 1) {
        return 'red';
      } else if (d.Keep === 0) {
        return '#ccc';
      }
    })
    .attr('x', (d, i) => 25 * i);

}
