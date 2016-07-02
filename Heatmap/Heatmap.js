let margin2 = { top: 300, right: 0, bottom: 0, left: 220 },
    width2 = 1000 - margin2.left - margin2.right,
    height2 = 700 - margin2.top - margin2.bottom,
    gridSize = Math.floor(width2 / 22),
    legendElementWidth = 100,
    colors3 = ['#ffffb2','#fecc5c','#fd8d3c','#e31a1c'],
    labels = ['low','average','high'];

let img = d3.select("#heatmap").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.xml("Heatmap/HeatMap.xml", "application/xml", function(xml) {
    let ListOfAllValues = [].map.call(xml.querySelectorAll("binding"), function(result) {
        let bindingName = result.getAttribute('name');
        let value =result.childNodes[1].innerHTML;
        return [bindingName,value]
    });

    function grouper(array, cols) {

        function split(array, cols) {
            if (cols==1) return array;
            let size = Math.ceil(array.length / cols);
            return array.slice(0, size).concat([null]).concat(split(array.slice(size), cols-1));
        }

        let a = split(array, cols);
        let groups = [];
        let group = [];
        for(let i = 0; i < a.length; i++) {
            if (a[i] === null) {
                groups.push(group);
                group = [];
                continue;
            }
            group.push(a[i]);

        }
        groups.push(group);
        return groups;

    }
    function makeOneList(data){
        let dataList = [];
        for (i=0; i<data.length; i++){
            let item = data[i];
            for(let k = 0; k < item.length;k++){
                dataList.push(item[k]);
            }
        }
        return dataList
    }
    let oneList = makeOneList(ListOfAllValues);
    let totalColumns = oneList.length / 4;
    let ListOfLists = grouper(oneList, totalColumns);


    function giveValueforCategory(data){
        for (i=0;i <data.length; i++){
            let array = data[i];
            for (let k = 0; k < array.length; k++){
                if (array[k] === 'high'){
                    array[k] = 3
                }
                if (array[k]=== 'average'){
                    array[k] = 2
                }
                if (array[k] === 'low') {
                    array[k] = 1
                }
            }
        }
        return data;
    }
    let CategorizedData = giveValueforCategory(ListOfLists);
  
    function toNumbers(data,string) {
        let number = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === string) {
                data[i] = number;
            }
            else{
                number = number +1;
                string = data[i];
                data[i] = number;
            }
        }
        return data
    }

    function allAreasList(data){
        let dataList = [];
        for (i=0; i < data.length; i++){
            dataList.push(data[i][1])
        }
        return dataList
    }

    function allDomainsList(data){
        let dataList = [];
        for (i=0; i < data.length; i++){
            dataList.push(data[i][0])
        }
        return dataList
    }
    let allDomainsNamesList = allDomainsList(CategorizedData);
    let allAreasNamesList = allAreasList(CategorizedData);

    function AreaToNumbers(data, checkList) {
        let dataList = [];
        for (let i = 0; i < data.length; i++) {
            let areas = data[i][1];
            for (let k = 0; k < checkList.length; k++){
                if (areas === checkList[k][0]){
                    dataList.push(checkList[k][1])
                }
            }
        }
        return dataList
    }
    let allDistinctAreas = allAreas(CategorizedData);
    function allValuesList(data){
        let dataList = [];
        for (i=0; i < data.length; i++){
            dataList.push(data[i][2])
        }
        return dataList

    }
    let valueNumbers = allValuesList(CategorizedData);
    let areaNumbers = AreaToNumbers(CategorizedData, allDistinctAreas[1]);
    let domainNumbers = toNumbers(allDomainsNamesList, "Concentration_immigrants");

    let dataList = [];
    dataList.push(domainNumbers);
    dataList.push(areaNumbers);
    dataList.push(valueNumbers);
    function arrayContains(needle, arrhaystack)
    {
        return (arrhaystack.indexOf(needle) > -1);
    }

    function allDomains(data){
        let dataList = [];
        for (i=0; i < data.length; i++){
            let domain = data[i][0];
            let outcome = arrayContains(domain, dataList);
            if (outcome === false){
                dataList.push(domain)
            }
        }
        return dataList;
    }
    function allAreas(data){
        let dataList = [];
        let number = 0;
        let numberedList = [];
        for (i=0; i < data.length; i++){
            let areas = data[i][1];
            let outcome = arrayContains(areas, dataList);
            if (outcome === false){
                dataList.push(areas);
                numberedList.push([areas,number]);
                number = number + 1
            }
        }
        return [dataList, numberedList];
    }
    let allDistinctDomains = allDomains(CategorizedData);
    let finalData = function(data) {
        let finalList = [];
        for (let i = 0; i < data[0].length; i++){
            finalList.push({'domain': data[0][i], 'area': data[1][i] , 'value': data[2][i]})
        }
        return finalList
    };

    let data = finalData(dataList);

    let dayLabels = img.selectAll(".dayLabel")
        .data(allDistinctDomains)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", -50)
        .attr("y", function (d, i) { return i * gridSize + -10; })
        .style("text-anchor", "end")
        .attr("font-size","14px");

    let timeLabels = img.selectAll(".timeLabel")
        .data(allDistinctAreas[0])
        .enter().append("text")
        .text(function(d) {return d; })
        .attr("x", 50)
        .attr("y", function(d,i){return i*gridSize -15})
        .attr("dy", ".35em")
        .attr("transform", " rotate(270)")
        .style("text-anchor", "start")
        .attr("font-size","14px");

    let colorScale = d3.scale.quantile()
        .domain([0, 3])
        .range(colors3);

    let cards = img.selectAll(".area")
        .data(data, function(d) {return d.domain+':'+d.area;});

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function(d) { return (d.area-1) * gridSize; })
                .attr("y", function(d) { return (d.domain-1) * gridSize; })
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
                .style("fill", function(d, i) { return colors3[i+1]; });

            legend.append("text")
                .data(labels)
                .attr("class", "mono")
                .text(function(d) { return d })
                .attr("x", function(d, i) { return legendElementWidth * i +25; })
                .attr("y", height2 * 0.8);

            legend.exit().remove();

        });
