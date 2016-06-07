let w = 400,
    h = 400,
    r = 180,
    inner = 70;


let color4 = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.xml("PieChart/data.xml", "application/xml", function(error, xml) {
    if (error) throw error;
    let ListOfAllValues = [].map.call(xml.querySelectorAll("binding"), function(result) {
        let bindingName = result.getAttribute('name');
        let value =result.childNodes[1].innerHTML;
        return [bindingName,value]
    });

    let MakeData = function (data) {
        let dataList = [];
        for (let i = 0; i < data.length; i++) {
            dataList.push({'name': data[i][0], 'value': data[i][1]})
        }
        return dataList
    };

    let data = MakeData(ListOfAllValues);
    let total = d3.sum(data, function(d) {
        return d3.sum(d3.values(d));
    });

    let vis = d3.select("#chart")
        .append("svg:svg")
        .data([data])
        .attr("width", w)
        .attr("height",h )
        .append("svg:g")
        .attr("transform", "translate(" + r * 1.1 + "," + r * 1.1 + ")");

    let textTop = vis.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .attr("class", "textTop")
        .text( "TOTAL" )
        .attr("y", -10),
        textBottom = vis.append("text")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .attr("class", "textBottom")
            .text(total)
            .attr("y", 10);

    let arc = d3.svg.arc()
        .innerRadius(inner)
        .outerRadius(r);

    let arcOver = d3.svg.arc()
        .innerRadius(inner + 5)
        .outerRadius(r + 5);

    let pie = d3.layout.pie()
        .value(function(d) { return d.value; });

    let arcs = vis.selectAll("g.slice")
        .data(pie)
        .enter()
        .append("svg:g")
        .attr("class", "slice")
        .on("mouseover", function(d) {
            d3.select(this).select("path").transition()
                .duration(200)
                .attr("d", arcOver);

            textTop.text(d3.select(this).datum().data.name)
                .attr("y", -10);
            textBottom.text(d3.select(this).datum().data.value)
                .attr("y", 10);
        })
        .on("mouseout", function(d) {
            d3.select(this).select("path").transition()
                .duration(100)
                .attr("d", arc);

            textTop.text( "TOTAL" )
                .attr("y", -10);
            textBottom.text(total.toFixed(2));
        });

    arcs.append("svg:path")
        .attr("fill", function(d, i) { return color4(i); } )
        .attr("d", arc);

    let legend = d3.select("#chart").append("svg")
        .attr("class", "legend")
        .attr("width", 100)
        .attr("height", 170)
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 18 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return color4(i); });

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
    
});