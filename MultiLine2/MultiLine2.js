/**
 * Created by miche on 23-5-2016.
 */
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

var svg = d3.select("#multiline2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.xml("Multiline2/data_alle_jaren.xml", "application/xml", function(xml) {


    var nodes = d3.select(xml).selectAll("*")[0],
        links = nodes.slice(1).map(function (d) {
            return {source: d, value: d.innerHTML};
        }),
        root = nodes[0];

    var valueLiteral = links.map(function (item) {
        let newData = item.source;
        let xmlNode = newData.getElementsByTagName('literal');
        if (xmlNode.length> 0 && xmlNode.length < 2) {
            let x = xmlNode;
            let y = x[0].childNodes[0].nodeValue;
            y = Number(y);
            return y
        }
    });

    var ListLiterals = function (data) {
        let newList = [];
        for (let i = 0; i < data.length; i++) {
            if (typeof data[i] === 'number') {
                newList.push(data[i])
            }
        }
        return newList
    };


    var ListOfValues = ListLiterals(valueLiteral);
    var groupSize = 8;
    var groups = ListOfValues.map(function(item, index){

            return index % groupSize === 0 ? ListOfValues.slice(index, index + groupSize) : null;
        })
        .filter(function(item){ return item;

        });


    var ListData = function(data) {
        let total = data.length;
        let listImmigrants = [];
        let listNatives = [];
        let years = [];
        for (let i = 0; i < total; i++) {
            var year = data[i][0];
            var immigrants = data[i].slice(1,7).reduce((a,b) => a + b, 0);
            var natives = data[i].slice(7,8);
            listImmigrants.push(immigrants);
            listNatives.push(natives[0]);
            years.push(year);

        }
        return [listImmigrants, listNatives, years]

    };

    var makeData = function(data) {
        let immigrants = data[0];
        let natives = data[1];
        let years = data[2];
        let dataList = [];
        for (let i = 0; i < immigrants.length; i++) {
            dataList.push({'Immigrants': immigrants[i], 'Natives': natives[i], 'year': years[i]})
        }
        return dataList;
    };

    var lijst = ListData(groups);

    let data = makeData(lijst);
    console.log(data)
   
    console.log(data[0]);
color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));
    
    var population = color.domain().map(function(name) {
        console.log(name);
        return {
            name: name,
            values: data.map(function(d) {
                return {year: d.year, total: +d[name]};
            })
        };
    });
    

    x.domain(d3.extent(data, function(d) { return d.year; }));
    
    y.domain([
        d3.min(population, function(c) { return d3.min(c.values, function(v) { return v.total; }); }),
        d3.max(population, function(c) { return d3.max(c.values, function(v) { return v.total; }); })
    ]);
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (ºF)");
    
    var city = svg.selectAll(".city")
        .data(population)
        .enter().append("g")
        .attr("class", "city");
    
    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });
    
    city.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.total) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
});