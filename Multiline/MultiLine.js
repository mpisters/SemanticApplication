/**
 * Created by miche on 23-5-2016.
 */
let margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let x = d3.scale.linear()
    .range([0,width]);

let y = d3.scale.linear()
    .range([height, 0]);

let mult_color = d3.scale.category10();

let xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

let yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

let line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.total); });

let svg = d3.select("#multiline2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.xml("Multiline/data_alle_jaren.xml", "application/xml", function(xml) {

    let nodes = d3.select(xml).selectAll("*")[0],
        links = nodes.slice(1).map(function (d) {
            return {source: d, value: d.innerHTML};
        });

    let valueLiteral = links.map(function (item) {
        let newData = item.source;
        let xmlNode = newData.getElementsByTagName('literal');
        if (xmlNode.length> 0 && xmlNode.length < 2) {
            let x = xmlNode;
            let y = x[0].childNodes[0].nodeValue;
            y = Number(y);
            return y
        }
    });

    let ListLiterals = function (data) {
        let newList = [];
        for (let i = 0; i < data.length; i++) {
            if (typeof data[i] === 'number') {
                newList.push(data[i])
            }
        }
        return newList
    };

    let ListOfValues = ListLiterals(valueLiteral);
    let groupSize = 8;
    let groups = ListOfValues.map(function(item, index){

            return index % groupSize === 0 ? ListOfValues.slice(index, index + groupSize) : null;
        })
        .filter(function(item){ return item;

        });

    let ListData = function(data) {
        let total = data.length;
        let listImmigrants = [];
        let listNatives = [];
        let years = [];
        for (let i = 0; i < total; i++) {
            let year = data[i][0];
            let immigrants = data[i].slice(1,7).reduce((a,b) => a + b, 0);
            let natives = data[i].slice(7,8);
            listImmigrants.push(immigrants);
            listNatives.push(natives[0]);
            years.push(year);
        }
        return [listImmigrants, listNatives, years]

    };

    let makeData = function(data) {
        let immigrants = data[0];
        let natives = data[1];
        let years = data[2];
        let dataList = [];
        for (let i = 0; i < immigrants.length; i++) {
            dataList.unshift({'Immigrants': immigrants[i], 'Natives': natives[i], 'year': years[i]})
        }
        return dataList;
    };

    let listOfData = ListData(groups);

    let data = makeData(listOfData);

mult_color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));
    
    let population = mult_color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {year: d.year, total: +d[name]};
            })
        };
    });

    x.domain([2005,2016]);
    // y.domain([
    //     d3.min(population, function(c) { return d3.min(c.values, function(v) { return v.total; }); }),
    //     d3.max(population, function(c) { return d3.max(c.values, function(v) { return v.total; }); })
    // ]);
    y.domain([300000,500000]);


    svg.append("g")
        .attr("font-family", "Arial")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("font-family", "Arial")
        .attr("font-size", "11px")
        .attr("font-weight", "700")
        .attr("class", "y axis")
        .call(yAxis);
    
    let item = svg.selectAll(".item")
        .data(population)
        .enter().append("g")
        .attr("class", "item");
    
    item.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return mult_color(d.name); });

    item.append("text")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("font-weight", "700")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.total) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    // append a g for all the mouse over nonsense
    let mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

// this is the vertical line
    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

// keep a reference to all our lines
    let lines = document.getElementsByClassName('line');

// here's a g for each circle and text on the line
    let mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(population)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

// the circle
    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
            return mult_color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

// the text
    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

// rect to capture mouse movements
    mouseG.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
            let mouse = d3.mouse(this);

            // move the vertical line
            d3.select(".mouse-line")
                .attr("d", function() {
                    let d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            // position the circle and text
            d3.selectAll(".mouse-per-line")
                .attr("transform", function(d, i) {
                    let xYear = x.invert(mouse[0]),
                        bisect = d3.bisector(function(d) {return d.year; }).right;
                    idx = bisect(d.values, xYear);

                    // since we are use curve fitting we can't relay on finding the points like I had done in my last answer
                    // this conducts a search using some SVG path functions
                    // to find the correct position on the line
                    // from http://bl.ocks.org/duopixel/3824661
                    let beginning = 0,
                        end = lines[i].getTotalLength();

                    while (true){
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0])      end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    // update the text with y value
                    d3.select(this).select('text')
                        .attr("font-family", "Arial")
                        .attr("font-size", "12px")
                        .attr("font-weight", "700")
                        .text(y.invert(pos.y).toFixed(2));

                    // return position
                    return "translate(" + mouse[0] + "," + pos.y +")";
                });
        });
});