/* design and development by Tiffany France
 * tiffany6872@gmail.com
 * tiffanyfrance.com
 * SWD April 2019
 * Top Rated Film Noir Movies
*/

const margin = {top: 10, right: 20, bottom: 10, left: 40},
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
            
  let svg = d3.select(".container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map((d) => d.title));
    y.domain([5.5, 10]);

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.title))
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d.rating))
        .attr("height", (d) => height - y(d.rating));

    svg.selectAll(".foo")
        .data(data)
        .enter()
        .append('text')
        .text((d) => `${d.title} \xa0 (${d.year})`)
        .attr("x", (d) => x(d.title))
        .attr("y", (d) => y(d.rating))
        .attr('class','foo')
        .style("text-anchor", "end")
        .attr('transform', (d) => `rotate(270,${x(d.title) - 1},${y(d.rating) + 4})`)
        .style('font-size', '11px');

    let tickArr = [7.0,7.5,8.0,8.5,9.0,9.5,10];

    svg.append("g")
        .call(d3.axisLeft(y).tickValues(tickArr));

}

function length(data) {

  let x = d3.scaleBand()
            .range([0, width])
            .padding(0.5);
  let y = d3.scaleLinear()
            .range([0, height]);
            
  let svg = d3.select(".container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");



    x.domain(data.map((d) => d.title));
    y.domain([40, 160]);

    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.title))
        .attr("width", x.bandwidth())
        .attr("y", (d) => 0)
        .attr("height", (d) => y(d.length));

    let tickArr = [60,80,100,120,140,160];
    
    svg.append("g")
        .call(d3.axisLeft(y).tickValues(tickArr));

}
