/* design and development by Tiffany France
 * tiffany6872@gmail.com
 * tiffanyfrance.com
 * SWD May 2019
 * Kon Marie-ing my Closet
*/

const margin = {top: 10, right: 10, bottom: 40, left: 50},
    width = 380 - margin.left - margin.right,
    height = 570 - margin.top - margin.bottom;

let tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

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
    .text((d) => (d.Description).charAt(0).toUpperCase() + (d.Description).slice(1));

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
  
  addRect(donateData, '#ccc', 'Donate/Toss');
  addRect(keepData, 'red', 'Keep');
}

function addRect(data, color, label) {
  let svg = d3.select('#viz')
    .append('div')
    .attr('class', 'col')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'stack')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top * 2})`);

  let barWidth = 55, // Make percentage instead of fixed
      barPadding = 3,
      barHeight = 8; // Make percentage instead of fixed

  svg.selectAll('rect')
    .data(data)
    .enter()
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
    .attr('x', (d, i) => i%5 * (barWidth + barPadding)) 
    .attr('y', (d, i) => height - Math.floor(i/5) * (barHeight + barPadding))
    // .on('mouseover', function(d) {
    //   console.log(d.Description)
    // });
    .on("mouseover", function(d) {		

      let htmlStr = '';
      let description = (d.Description).toLowerCase();

      if (d.Keep == 0) {
        if (d['Spark joy'] == 1) {
          htmlStr += '🌟 Sparked joy!<br />';
        }

        htmlStr += `Thank you, ${description}.`;
      } else {
        if (d['Spark joy'] == 1) {
          htmlStr += '🌟 Sparks joy!<br />';
        }

        htmlStr += `You get to stay, ${description}!`;
      }

      tooltip.transition()		
        .duration(200)		
        .style("opacity", 1);		
      tooltip.html(htmlStr)	
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");	
      })					
    .on("mouseout", function(d) {		
      tooltip.transition()		
        .duration(500)		
        .style("opacity", 0);	
    });

    svg.append('text')
      .text(label)
      .attr('text-anchor', 'middle')
      .attr('x', (d) => (5 * (barWidth + barPadding)) / 2) 
      .attr('y', (d) => height + margin.bottom - margin.top)
      .style('text-transform', 'uppercase')
      .style('font-size', 10);
}
