var n = 400,
random = d3.random.normal(0, .2),
graph_3_data = d3.range(n).map(random);
var margin = {top: 20, right: 20, bottom: 20, left: 40},
width = 0.325*window.innerWidth - margin.left - margin.right,
height = 0.3*window.innerHeight - margin.top - margin.bottom;
var x = d3.scale.linear()
.domain([0, n - 1])
.range([0, width]);
var y = d3.scale.linear()
.domain([-1, 1])
.range([height, 0]);
var line = d3.svg.line()
.x(function(d, i) { return x(i); })
.y(function(d, i) { return y(d); });
var svg_3 = d3.select("body").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
svg_3.append("defs").append("clipPath")
.attr("id", "clip")
.append("rect")
.attr("width", width)
.attr("height", height);
svg_3.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + y(0) + ")")
.call(d3.svg.axis().scale(x).orient("bottom"));
svg_3.append("g")
.attr("class", "y axis")
.style("stroke", "grey")
.call(d3.svg.axis().scale(y).orient("left"));
var path_3 = svg_3.append("g")
.attr("clip-path", "url(#clip)")
.append("path")
.datum(graph_3_data)
.attr("class", "line")
.style("stroke", "blue")
.style("stroke-width", 1)
.attr("d", line);
tick_3();
function tick_3() {
  // push a new data point onto the back
  graph_3_data.push(random());
  // redraw the line, and slide it to the left
  path_3
  .attr("d", line)
  .attr("transform", null)
  .transition()
  .duration(500)
  .ease("linear")
  .attr("transform", "translate(" + x(-1) + ",0)")
  .each("end", tick_3);
  // pop the old data point off the front
  graph_3_data.shift();
}
