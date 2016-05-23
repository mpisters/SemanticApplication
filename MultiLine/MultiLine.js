var Immigrants = [{
    "total": 290806,
    "year": "2016"
},
    {
        "total": 285416,
        "year": "2015"
    },
    {
        "total": 282067,
        "year": "2014"
    },
    {
        "total": 279077,
        "year": "2013"
    },
    {
        "total": 276392,
        "year": "2012"
    },
    {
        "total": 273151,
        "year": "2011"
    },
    {
        "total": 268211,
        "year": "2010"
    },
    {
        "total": 262759,
        "year": "2009"
    },
    {
        "total": 258494,
        "year": "2008"
    },
    {
        "total": 256258,
        "year": "2007"
    },
    {
        "total": 255169,
        "year": "2006"
    },
    {
        "total": 254331,
        "year": "2005"
    }];
var Natives = [{
    "total": 403476,
    "year": "2016"
},
    {
        "total": 402732,
        "year": "2015"
    },
    {
        "total": 400093,
        "year": "2014"
    },
    {
        "total": 394645,
        "year": "2013"
    },
    {
        "total": 390813,
        "year": "2012"
    },
    {
        "total": 388035,
        "year": "2011"
    },
    {
        "total": 385009,
        "year": "2010"
    },
    {
        "total": 381948,
        "year": "2009"
    },
    {
        "total": 381374,
        "year": "2008"
    },
    {
        "total": 382104,
        "year": "2007"
    },
    {
        "total": 382746,
        "year": "2006"
    },
    {
        "total": 383897,
        "year": "2005"
    }];



var margin = {top: 40, right: 80, bottom: 30, left: 50},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var vis = d3.select("#multiline").append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scale.linear().range([margin.left, width - margin.right]).domain([2005, 2016]),
    yScale = d3.scale.linear().range([height - margin.top, margin.bottom]).domain([200000, 500000]),
    xAxis = d3.svg.axis()
        .scale(xScale),
    yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

vis.append("svg:g")
    .attr("class", "x axis")
    .attr("font-family","Arial")
    .attr("font-size", "12px")
    .attr("color","black")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(xAxis);
vis.append("svg:g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (margin.left) + ",0)")
    .call(yAxis);
var lineGen = d3.svg.line()
    .x(function(d) {
        return xScale(d.year);
    })
    .y(function(d) {
        return yScale(d.total);
    })
    .interpolate("basis");
vis.append('svg:path')
    .attr('d', lineGen(Immigrants))
    .attr('stroke', '#6b486b')
    .attr('stroke-width', 2)
    .attr('fill', 'none');
vis.append('svg:path')
    .attr('d', lineGen(Natives))
    .attr('stroke', '#ff8c00')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

vis.append("text")
    .attr("id","label")
    .attr("x", (width * 0.93))
    .attr("y", (height * 0.35))
    .attr("text-anchor", "middle")
    .text("Natives");

vis.append("text")
    .attr("id","label")
    .attr("x", (width * 0.98))
    .attr("y", (height * 0.66))
    .attr("text-anchor", "middle")
    .text("Non-Western Immigrants");