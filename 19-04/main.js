/* design and development by Tiffany France
 * tiffany6872@gmail.com
 * tiffanyfrance.com
 * SWD April 2019
 * Top Rated Film Noir Movies
*/

const margin = {top: 10, right: 0, bottom: 20, left: 100},
    width = 1400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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
            .padding(0.5);

  let y = d3.scaleLinear()
            .range([height, 0]);
            
  let svg = d3.select(".viz").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + (margin.top * 2) + ")");

    x.domain(data.map((d) => d.title));
    y.domain([5.5, 10]);

    let tickArr = [7.0,7.5,8.0,8.5,9.0,9.5];

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
        .attr("y", (d) => y(d.rating))
        .attr("height", (d) => height - y(d.rating));
    }

    svg.selectAll(".label")
        .data(data)
        .enter()
        .append('text')
        .text((d) => `${d.title} \xa0 (${d.year})`)
        .attr("x", (d) => x(d.title))
        .attr("y", (d) => y(d.rating))
        .attr('class','label')
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
      .attr('y', 130)
      // .attr('width', 512 + 'px')
      .attr('height', 580 + 'px')
      // // clip the image using id
      .attr('clip-path', 'url(#rect-clip1)')
      .style('cursor', 'pointer')
      .on('click', function(d) {
        let win = window.open(d.url, '_blank');
        win.focus();
      });

    svg.append('text')
      .text('IMDB rating')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '11px')
      .style("text-anchor", "end");

}

function length(data) {

  let x = d3.scaleBand()
            .range([0, width])
            .padding(0.5);

  let y = d3.scaleLinear()
            .range([0, height]);
            
  let svg = d3.select(".viz").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map((d) => d.title));
    y.domain([40, 160]);

    let tickArr = [60,80,100,120,140,160];
    
    svg.append("g")
      .call(d3.axisLeft(y)
        .tickValues(tickArr)
        .tickSizeInner(-width + margin.top - margin.bottom)
        .tickSizeOuter(0)
      );

    function bar(svg) {
      svg.selectAll(".bar2")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar2")
        .attr("x", (d) => x(d.title))
        .attr("width", x.bandwidth())
        .attr("y", (d) => 0)
        .attr("height", (d) => y(d.length));
    }

    const defs = svg.append('defs');
    
    defs.append('clipPath')
      .attr('id', 'rect-clip2')
      .call(bar);

    svg.selectAll("image")
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
      });

    svg.append('text')
      .text('Running time (min)')
      .attr('x', 0)
      .attr('y', 10)
      .style('font-size', '11px')
      .style("text-anchor", "end");

}
