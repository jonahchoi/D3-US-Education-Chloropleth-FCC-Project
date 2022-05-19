let h = 600;
let w = 1000;
let padding = 50;

let svg = d3.select("#svg-container").
append('svg').
attr('height', h).
attr('width', w);

let tooltip = d3.select('#svg-container').
append('div').
attr('id', 'tooltip');

let lW = 300;
let lH = 100;
let lP = 25;

let legend = svg.append('g').
attr('id', 'legend').
attr('transform', 'translate(550,50)');


Promise.all([d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'),
d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')]).
then(function (data) {
  let countyData = data[0];
  let topo = data[1];

  let geometries = topo.objects.counties.geometries;
  let arcs = geometries.map(d => d.arcs);

  let max = d3.max(countyData.map(d => d.bachelorsOrHigher));
  let min = d3.min(countyData.map(d => d.bachelorsOrHigher));
  let step = (max - min) / 8;

  let domainArray = [];
  for (let i = 1; i < 7; i++) {
    domainArray.push(min + i * step);
  }

  legendArray = [...domainArray];
  legendArray.unshift(min);
  legendArray.push(min + 7 * step);

  let myColor = d3.scaleThreshold().
  domain(domainArray).
  range(d3.schemeBlues[7]);

  let lScale = d3.scaleLinear().
  domain([min, 66]).
  range([lP, lW - lP]);

  let lAxis = d3.axisBottom(lScale).tickSize(15).tickValues(legendArray).tickFormat(d => d.toFixed(0) + '%');

  legend.append('g').
  call(lAxis);
  legendArray.pop();legend.selectAll('rect').
  data(legendArray).
  enter().
  append('rect').
  attr('width', 36).
  attr('height', 10).
  attr('x', d => lScale(d)).
  attr('fill', d => myColor(d)).
  attr('stroke', 'black');
  let path = d3.geoPath();
  //Map
  svg.append('g').selectAll("path").
  data(topojson.feature(topo, topo.objects.counties).features).
  enter().
  append('path').
  attr("d", path).
  attr('class', 'county').
  attr('data-fips', d => d.id).
  attr('data-education', (d, i) => {

    let county = countyData.filter(county => county.fips === d.id);

    return county[0].bachelorsOrHigher;
  }).
  attr('fill', (d, i) => {

    let county = countyData.filter(county => county.fips === d.id);

    return myColor(county[0].bachelorsOrHigher);
  })
  //tooltip function
  .on('mouseover', function (e, d) {
    tooltip.style('opacity', 0.9);
    tooltip.html(function () {
      let county = countyData.filter(county => county.fips === d.id);
      let output = '<p>' + county[0].area_name + ', ' + county[0].state + '<br>' + county[0].bachelorsOrHigher + '%';
      return output;
    }).
    attr('data-education', () => {

      let county = countyData.filter(county => county.fips === d.id);

      return county[0].bachelorsOrHigher;
    }).
    style('left', () => e.pageX + 20 + 'px').
    style('top', () => e.pageY - 20 + 'px');

  }).
  on('mouseout', function (e, d) {
    tooltip.style('opacity', 0);
  });

  svg.
  append('path').
  attr('d', path(topojson.mesh(topo, topo.objects.states, function (a, b) {
    return a !== b;
  }))).
  attr('stroke', '#fff').
  style('fill', 'none');

});