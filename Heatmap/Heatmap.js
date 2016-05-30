let margin2 = { top: 300, right: 0, bottom: 0, left: 220 },
    width2 = 1000 - margin2.left - margin2.right,
    height2 = 600 - margin2.top - margin2.bottom,
    gridSize = Math.floor(width2 / 22),
    legendElementWidth = 100,
    colors3 = ['#e66101','#fdb863','#b2abd2','#5e3c99'],
    labels = ['unknown','low','average','high'];

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
        return data.filter(Boolean);
    };

    let listofDomainAreas = FilterArray(DomainsAreasValues);
    let ListOfValues = FilterArray(valuesBinding);

    let makeList = function (data){
        let domainList = [];
        let areaList = [];
        for (let i = 0; i < data.length; i++){
            domainList.push(data[i][0]);
            areaList.push(data[i][1]);
        }
        return [domainList,areaList]
    };
    
    let Data = [];
    Data.push(makeList(listofDomainAreas)[0]);
    Data.push(makeList(listofDomainAreas)[1]);
    Data.push(ListOfValues);

    function listvalues(data){
        let areaNames  = [];
        for (let i = 0; i < data.length; i++){
            if (areaNames.indexOf(data[i]) === -1 ){
                areaNames.push(data[i])
            }

        }
        return areaNames
    }

    let allAreas = listvalues(Data[1]);
    let allDomains = listvalues(Data[0]);
    let allDomainsNumbers = allAreas.map(function(item) {
        return [item, allAreas.indexOf(item)]
    });

    let changeStringToNumber = function(data,string) {
        let numberList = [];
        let number = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === string) {
                numberList.push(number);
            }
            else{
                number = number +1;
                numberList.push(number);
                string = data[i]
            }
        }
        return numberList
    };

    let changeAreasToNumber = function(checkList, data) {
        let List = [];
        for (let i = 0; i < data.length; i++){
            for (let k = 0; k < checkList.length; k++){
                if (data[i] === checkList[k][0]){
                    List.push(checkList[k][1])
                }
            }
        }
        return List
    };

    let AreaListNumbers = changeAreasToNumber(allDomainsNumbers, Data[1])

    let data2 = [];
    data2.push(changeStringToNumber(Data[0], "Concentration_immigrants"));
    data2.push(AreaListNumbers);
    data2.push(Data[2]);

    let finalData = function(data) {
        let finalList = [];
        for (let i = 0; i < data[0].length; i++){
            finalList.push({'domain': data[0][i], 'area': data[1][i] , 'value': data[2][i]})

        }
        return finalList
    };

    let data3 = finalData(data2);
    
    let dayLabels = img.selectAll(".dayLabel")
        .data(allDomains)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", -50)
        .attr("y", function (d, i) { return i * gridSize + -10; })
        .style("text-anchor", "end")
        .attr("font-size","14px");

    let timeLabels = img.selectAll(".timeLabel")
        .data(allAreas)
        .enter().append("text")
        .text(function(d) {return d; })
        .attr("x", 50)
        .attr("y", function(d,i){return i*gridSize -15})
        .attr("dy", ".35em")
        .attr("transform", " rotate(270)")
        .style("text-anchor", "start")
        .attr("font-size","14px");

    var colorScale = d3.scale.quantile()
        .domain([0, 3])
        .range(colors3);

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
                .style("fill",  function(d, i) { return colors3[i]; });
            
            cards.transition().duration(1000)
                .style("fill", function(d) { return colorScale(d.value); });
            
            cards.select("title").text(function(d) { return d.value; });
            
            cards.exit().remove();
            
            let legend = img.selectAll(".legend")
                .data(labels);

            legend.enter().append("g")
                .attr("class", "legend");
            
            legend.append("rect")
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height2 * 0.70)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", function(d, i) { return colors3[i]; });
            
            legend.append("text")
                .data(labels)
                .attr("class", "mono")
                .text(function(d) { return d })
                .attr("x", function(d, i) { return legendElementWidth * i +25; })
                .attr("y", height2 * 0.80);
            
            legend.exit().remove();

        });

