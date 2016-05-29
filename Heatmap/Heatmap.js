let margin2 = { top: 50, right: 0, bottom: 100, left: 30 },
    width2 = 960 - margin2.left - margin2.right,
    height2 = 430 - margin2.top - margin2.bottom,
    gridSize = Math.floor(width2 / 24),
    legendElementWidth = gridSize*2,
    buckets = 9,
    colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

let vis = d3.select("#heatmap").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

let dayLabels = vis.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * gridSize; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

let timeLabels = vis.selectAll(".timeLabel")
    .data(times)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });



d3.xml("Heatmap/Heatmap.xml", "application/xml", function(xml) {

    let nodes = d3.select(xml).selectAll("*")[0],
        links = nodes.slice(1).map(function (d) {
            return {source: d, value: d.innerHTML};
        });

    let valuesBinding = links.map(function (item) {
        let newData = item.source;
        let xmlNode = newData.getElementsByTagName('binding');
        if (xmlNode.length > 1) {
            let x = xmlNode[1];
            let valueName = x.getAttribute('name');
            if (valueName === 'one') {
                return 1;
            }
            else if(valueName === 'two'){
                return 2;
            }
            else{
                return 3;
            }
        }
    });
    let DomainsAreasValues = links.map(function (item) {
        let newData = item.source;
        let xmlNode = newData.getElementsByTagName('binding');
        if (xmlNode.length > 1) {
            let x = xmlNode[0];
            let y = x.getElementsByTagName('literal');
            let area = y[0].childNodes[0].nodeValue;
            let domain = x.getAttribute('name');
            return [domain, area]
        }
    });


    let FilterArray = function (data) {
        let filterArray = data.filter(Boolean);
        return filterArray
    };

    let listofDomainAreas = FilterArray(DomainsAreasValues);
    let ListOfValues = FilterArray(valuesBinding);

    let makeList = function (data){
        let domainList = []
        let areaList = []
        for (let i = 0; i < data.length; i++){
            domainList.push(data[i][0])
            areaList.push(data[i][1])
        }
        return [domainList,areaList]
    }

    // console.log(ListOfValues);

    let Data = []
    Data.push(makeList(listofDomainAreas)[0])
    Data.push(makeList(listofDomainAreas)[1])
    Data.push(ListOfValues)

    function listvalues(data){
        let areaNames  = []
        for (let i = 0; i < data.length; i++){
            if (areaNames.indexOf(data[i]) === -1 ){
                areaNames.push(data[i])
            }
        }

    }

    let allAreas = listvalues(Data[1])
    let allDomains = listvalues(Data[0])
    //
    let changeStringtoNumber = function(data,string) {
        console.log(data.length);
        let numberList = [];
        let number = 1;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === string) {
                console.log(data[i])
                numberList.push(number);
            }
            else{
                number = number +1
                numberList.push(number)
                string = data[i]
            }
        }
        return numberList
    }

    let changeArestoNumber = function(data){
        let numberList = [];
        let number = 1;
        let 
        for (let i = 0; i < data.length; i++) {
            if (data[i] === string) {
                console.log(data[i])
                numberList.push(number);
            }
            else{
                number = number +1
                numberList.push(number)
                string = data[i]
            }
        }
        return numberList
    }

    console.log(changeArestoNumber(Data[2]))
    let data2 = []
    data2.push(changeStringtoNumber(Data[0], "Concentration_immigrants"));
    data2.push(Data[1]);
    data2.push(Data[2]);

    console.log(Data[1], "data1--------")
    let finalData = function(data) {
        let finalList = [];
        for (let i = 0; i < data[0].length; i++){
            finalList.push({'domain': data[0][i], 'area': data[1][i] , 'value': data[2][i]})

        }
        console.log(finalList)
    }
console.log(finalData(data2))



            // cards.append("title");
            //
            // cards.enter().append("rect")
            //     .attr("x", function(d) { return (d.hour - 1) * gridSize; })
            //     .attr("y", function(d) { return (d.day - 1) * gridSize; })
            //     .attr("rx", 4)
            //     .attr("ry", 4)
            //     .attr("class", "hour bordered")
            //     .attr("width", gridSize)
            //     .attr("height", gridSize)
            //     .style("fill", colors[0]);
            //
            // cards.transition().duration(1000)
            //     .style("fill", function(d) { return colorScale(d.value); });
            //
            // cards.select("title").text(function(d) { return d.value; });
            //
            // cards.exit().remove();
            //
            // let legend = vis.selectAll(".legend")
            //     .data([0].concat(colorScale.quantiles()), function(d) { return d; });
            //
            // legend.enter().append("g")
            //     .attr("class", "legend");
            //
            // legend.append("rect")
            //     .attr("x", function(d, i) { return legendElementWidth * i; })
            //     .attr("y", height2)
            //     .attr("width", legendElementWidth)
            //     .attr("height", gridSize / 2)
            //     .style("fill", function(d, i) { return colors[i]; });
            //
            // legend.append("text")
            //     .attr("class", "mono")
            //     .text(function(d) { return "≥ " + Math.round(d); })
            //     .attr("x", function(d, i) { return legendElementWidth * i; })
            //     .attr("y", height2 + gridSize);
            //
            // legend.exit().remove();

        });

