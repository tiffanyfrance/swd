/* design and development by Tiffany France
 * tiffany6872@gmail.com
 * tiffanyfrance.com
 * SWD April 2019
 * Top Rated Film Noir Movies
*/

const margin = {top: 10, right: 10, bottom: 20, left: 50},
    width = 1280 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

d3.csv("filmnoir.csv", (error, data) => {
  if (error) throw error;

  data.forEach((d) => {
    d.rating = +d.rating;
    d.length = +d.length;
  });

  ratings(data);
  length(data);
});

function ratings(data) {

  let x = d3.scaleBand()
            .range([0, width])
            .padding(0.6);

  let y = d3.scaleLinear()
            .range([height, 0]);
              
  let svg = d3.select(".viz").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + (margin.top * 2) + ")");
  

  x.domain(data.map((d) => d.title));
  y.domain([6, 9.5]);

  let tickArr = [6.5,7.0,7.5,8.0,8.5,9.0,9.5];

  svg.append("g")
    .call(d3.axisLeft(y)
      .tickValues(tickArr)
      .tickSizeInner(-width + margin.top - margin.bottom)
      .tickSizeOuter(0)
    );

  function bar(svg) {
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.title))
      .attr("width", x.bandwidth())
      .attr("y", (d) =>  y(d.rating))
      .attr("height", (d) => height - y(d.rating));
  }

  svg.selectAll(".title")
      .data(data)
      .enter()
      .append('text')
      .text((d) => `${d.title} \xa0 (${d.year})`)
      .attr("x", (d) => x(d.title))
      .attr("y", (d) => y(d.rating))
      .attr('class', 'title')
      .style("text-anchor", "end")
      .attr('transform', (d) => `rotate(270,${x(d.title) - 1},${y(d.rating) + 4})`)
      .style('font-size', '11px')
      .style('fill', '#333');

  const defs = svg.append('defs');
  
  defs.append('clipPath')
    .attr('id', 'rect-clip1')
    .call(bar);

  svg.selectAll("image")
    .data(data)
    .enter()
    .append('image')
    .attr('xlink:href', (d) => `images/${d.image}`)
    .attr('x', (d) => x(d.title))
    .attr('y', 100)
    // .attr('width', 512 + 'px')
    .attr('height', 580 + 'px')
    // // clip the image using id
    .attr('clip-path', 'url(#rect-clip1)')
    .style('cursor', 'pointer')
    .on('click', function(d) {
      let win = window.open(d.url, '_blank');
      win.focus();
    })
    .on('mouseover', function(d) {
      mouseOver(rollover,x,20,d);
    })
    .on('mouseout', mouseOut);

    axisLabel(svg,'IMDB Rating');

    addLabel(svg,619,38,40,40,5,68,'Highest IMDB Rating');

    let rollover = svg.append('g')
      .attr('class', 'rollover');
}

function length(data) {

  let x = d3.scaleBand()
            .range([0, width])
            .padding(0.6);

  let y = d3.scaleLinear()
            .range([0, height]);
  
  let svg = d3.select('.viz').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 
              'translate(' + margin.left + ',' + margin.top + ')');
        
  x.domain(data.map((d) => d.title));
  y.domain([40, 160]);

  let tickArr = [60,80,100,120,140];
  
  svg.append('g')
    .call(d3.axisLeft(y)
      .tickValues(tickArr)
      .tickSizeInner(-width + margin.top - margin.bottom)
      .tickSizeOuter(0)
    );

  function bar(svg) {
    svg.selectAll('.bar2')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar2')
      .attr('x', (d) => x(d.title))
      .attr('width', x.bandwidth())
      .attr('y', (d) => 0)
      .attr('height', (d) => y(d.length));
  }

  const defs = svg.append('defs');
  
  defs.append('clipPath')
    .attr('id', 'rect-clip2')
    .call(bar);

  svg.selectAll('image')
    .data(data)
    .enter()
    .append('image')
    .attr('xlink:href', (d) => `images/${d.image}`)
    .attr('x', (d) => x(d.title))
    .attr('y', -270)
    // .attr('width', 512 + 'px')
    .attr('height', 580 + 'px')
    // // clip the image using id
    .attr('clip-path', 'url(#rect-clip2)')
    .style('cursor', 'pointer')
    .on('click', function(d) {
      let win = window.open(d.url, '_blank');
      win.focus();
    })
    .on('mouseover', function(d) {
      mouseOver(rollover,x,0,d);
    })
    .on('mouseout', mouseOut);

  axisLabel(svg,'Movie length (min)')

  addLabel(svg,98,330,35,35,-58,-12,'Longest Runtime');
  addLabel(svg,850,255,48,48,-58,-10,'Most Popular on IMDB');
  addLabel(svg,1143,322,40,40,-58,-10,'Most Votes in Poll');

  let rollover = svg.append('g')
    .attr('class', 'rollover');

}

function mouseOver(rollover,x,y,d) {
  let image = d.image;
  let titlePos = x(d.title);

  if (titlePos > 1030) {
    titlePos = titlePos - 200;
  }

  rollover.append('image')
    .attr('xlink:href', `images/originals/${image}`)
    .attr('class', 'rollover-image')
    .transition()
    .duration(200)
    .attr('height', height - margin.top)
    .attr('x', titlePos)
    .attr('y', y)
    .style('pointer-events', 'none');
}

function mouseOut() {
  d3.selectAll('.rollover-image')
    .transition()
    .duration(200)
    .style('opacity','0')
    .remove();
}

function axisLabel(svg,str) {
  svg.append('text')
      .text(str)
      .attr('x', -(height/2))
      .attr('y', -40)
      .style('font-size', '11px')
      .style("text-anchor", 'middle')
      .style('transform', 'rotate(270deg)');
}

function addLabel(svg,x,y,x1,x2,y1,y2,str) {
  let label = svg.append('g')
    .attr('class', 'label')
    .attr('transform', `translate(${x},${y})`);

  label.append('line')
    .attr('x1', x1)
    .attr('x2', x2)
    .attr('y1', y1)
    .attr('y2', y2)
    .attr('stroke', '#444')
    .attr('stroke-width', '0.5');

  label.append('text')
    .text(str)
    .style('font-size', '9px');
}
