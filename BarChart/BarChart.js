let margin4 = {top: 20, right: 20, bottom: 250, left: 75},
    width5 = 1000 - margin4.left - margin4.right,
    height5 = 600 - margin4.top - margin4.bottom;

let x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width5], .1);

let x1 = d3.scale.ordinal();

let y5 = d3.scale.linear()
    .range([height5, 0]);

let color5 = d3.scale.ordinal()
    .range(['#e66101','#fdb863','#b2abd2','#5e3c99']);

let xAxis5 = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

let yAxis5 = d3.svg.axis()
    .scale(y5)
    .orient("left");

let viz2 = d3.select("#BarChart").append("svg")
    .attr("width", width5 + margin4.left + margin4.right)
    .attr("height", height5 + margin4.top + margin4.bottom)
    .append("g")
    .attr("transform", "translate(" + margin4.left + "," + margin4.top + ")");


d3.xml("BarChart/DataPerArea.xml", "application/xml", function(xml) {

    let nodes = d3.select(xml).selectAll("*")[0],
        links = nodes.slice(1).map(function (d) {
            return {source: d, value: d.innerHTML};
        });

    let valueLiteral = links.map(function (item) {
        let newData = item.source;
        let xmlNode = newData.getElementsByTagName('literal');
        if (xmlNode.length> 0 && xmlNode.length < 2) {

            let y = xmlNode[0].childNodes[0].nodeValue;
            y = Number(y);
            return y
        }
    });

    let AreaNames = links.map(function (item) {
        let newData = item.source;
        let xmlNode = newData.getElementsByTagName('binding');
        if (xmlNode.length > 1) {
            let x = xmlNode[0];
            let y = x.getElementsByTagName('literal');
            return y[0].childNodes[0].nodeValue;
        }
    });

    let FilterArray = function (data) {
        return data.filter(Boolean);
    };
    let ListOfAreaNames = FilterArray(AreaNames);
    let ListOfValues = FilterArray(valueLiteral);
    let groupSize = 7;
    let groups = ListOfValues.map(function(item, index){

            return index % groupSize === 0 ? ListOfValues.slice(index, index + groupSize) : null;
        })
        .filter(function(item){ return item;

        });
    function makeList(data,list) {
        for (let i = 0; i < data.length; i++){
            data[i].unshift(list[i])
        }
        return data;
    }
    let dataList = makeList(groups,ListOfAreaNames);

    function MakeData(data){
        let dataList = [];
        for (let i = 0; i <data.length; i++){
            let immigrants = data[i].slice(1,7).reduce(function(a, b) { return a + b; }, 0);
            let natives = data[i][7];
            let population = data[i].slice(1,8).reduce(function(a, b) { return a + b; }, 0);
            dataList.push({'Area':data[i][0], 'Immigrants': immigrants, 'Natives': natives, 'Population': population,
                'items': [{'name': data[i][0], 'value': immigrants},
                    {'name': data[i][0], 'value': natives},{'name': data[i][0], 'value': population}]});
        }
        return dataList
    }
    let data = MakeData(dataList);
    let itemNames = d3.keys(data[0]).filter(function(key) {
        if (key !== 'Area' && key !== 'items'){
            return key;
        }
    });

    data.forEach(function(d) {
        d.items = itemNames.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(data.map(function(d) { return d.Area; }));
    x1.domain(itemNames).rangeRoundBands([0, x0.rangeBand()]);
    y5.domain([0, 80000]);

    viz2.append("g")
        .attr("class", "x axis")
        .attr("id", "x")
        .attr("transform", "translate(0," + (height5) + ")")
        .call(xAxis5)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr('font-size', "13px")
        .attr("transform", function (d) {
            return "rotate(-30)";
        });

    viz2.append("g")
        .attr("class", "y axis")
        .attr("id","y")
        .call(yAxis5)
        .selectAll('text')
        .attr("y", -3)
        .attr('font-size', "12px")
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .append("text")
        .attr("transform", "rotate(-90)")
        .text("Total");

    let item = viz2.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "state")
        .attr("transform", function(d) { return "translate(" + x0(d.Area) + ",0)"; });

    item.selectAll("rect")
        .data(function(d) { return d.items; })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) {return x1(d.name); })
        .attr("y", function(d) { return y5(d.value); })
        .attr("height", function(d) {
            console.log(d);
            return height5 - y5(d.value); })
        .style("fill", function(d) { return color5(d.name); });

    let legend4 = viz2.selectAll(".legend4")
        .data(itemNames.slice().reverse())
        .enter().append("g")
        .attr("class", "legend4")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend4.append("rect")
        .attr("x", width5 - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color5);

    legend4.append("text")
        .attr("x", width5 - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

});