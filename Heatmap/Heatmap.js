let margin2 = { top: 50, right: 0, bottom: 100, left: 30 },
    width2 = 960 - margin2.left - margin2.right,
    height2 = 430 - margin2.top - margin2.bottom,
    gridSize = Math.floor(width2 / 23),
    legendElementWidth = gridSize*2,
    buckets = 4,
    colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"] // alternatively colorbrewer.YlGnBu[9]

let img = d3.select("#heatmap").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");





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
        let filteredArray = data.filter(Boolean);
        return filteredArray
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
        return areaNames
    }

    let allAreas = listvalues(Data[1])
    let allDomains = listvalues(Data[0])

    let allDomainsNumbers = allAreas.map(function(item) {
        return [item, allAreas.indexOf(item)]
    })
    //
    let changeStringtoNumber = function(data,string) {
        let numberList = [];
        let number = 1;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === string) {
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

    let changeAreastoNumber = function(checkList, data) {
        let List = []
        for (let i = 0; i < data.length; i++){
            for (let k = 0; k < checkList.length; k++){
                if (data[i] === checkList[k][0]){
                    List.push(checkList[k][1])
                }
            }
        }
        return List
    }

    let AreaListNumbers = changeAreastoNumber(allDomainsNumbers, Data[1])

    let data2 = []
    data2.push(changeStringtoNumber(Data[0], "Concentration_immigrants"));
    data2.push(AreaListNumbers);
    data2.push(Data[2]);

    let finalData = function(data) {
        let finalList = [];
        for (let i = 0; i < data[0].length; i++){
            finalList.push({'domain': data[0][i], 'area': data[1][i] , 'value': data[2][i]})

        }
        return finalList
    }

    let data3 = finalData(data2);
    
    let dayLabels = img.selectAll(".dayLabel")
        .data(allDomains)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    let timeLabels = img.selectAll(".timeLabel")
        .data(allAreas)
        .enter().append("text")
        .text(function(d) {
            console.log(d);
            return d; })
        .attr("x", function(d, i) {return i * gridSize; })
        .attr("y", 0)
        .attr("dy", ".35em")
        .attr("transform", "translate(" + gridSize / 2 + ", -6) rotate(90)")
        .style("text-anchor", "start");


    var colorScale = d3.scale.quantile()
        .domain([0, buckets - 1, d3.max(data3, function (d) {
            return d.value; })])
        .range(colors);

    var cards = img.selectAll(".area")
        .data(data3, function(d) {return d.domain+':'+d.area;});

            cards.append("title");
            
            cards.enter().append("rect")
                .attr("x", function(d) { return (d.area - 1) * gridSize; })
                .attr("y", function(d) { return (d.domain - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);
            
            cards.transition().duration(1000)
                .style("fill", function(d) { return colorScale(d.value); });
            
            cards.select("title").text(function(d) { return d.value; });
            
            cards.exit().remove();
            
            let legend = img.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; });
            
            legend.enter().append("g")
                .attr("class", "legend");
            
            legend.append("rect")
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height2)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", function(d, i) { return colors[i]; });
            
            legend.append("text")
                .attr("class", "mono")
                .text(function(d) { return "≥ " + Math.round(d); })
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height2 + gridSize);
            
            legend.exit().remove();

        });

