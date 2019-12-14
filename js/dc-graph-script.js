        var numberFormat = d3.format(".2f");
        var mapChart = dc.bubbleOverlay("#YS-chart").svg(d3.select("#YS-chart svg"));
        var colorChart = dc.pieChart("#coloring-chart");
        var levelChart = dc.pieChart("#level-chart");
        var populationChart = dc.rowChart("#population-chart"); 
        var sexChart = dc.pieChart("#sex-chart");
        
        function isTerritoryRecord(v) {
            return v.packLevel === "Adult" || v.sex === "Male";
        }

        function isPackRecord(v) {
            return v.packLevel === "Adult" || v.sex === "Female";
        }

        function isWolvesRecord(v) {
            return v.packLevel === "Yearling" || v.sex === "Female";
        }

        d3.csv("YellowstoneWolves.csv").then(function(csv) {
            var data = crossfilter(csv);
            var all = data.groupAll();
            
            var packDimension = data.dimension(function(d) {
                return d.packName;
            });
            var packGroup = packDimension.group().reduce(
                    function(p, v) {
                        if (isTerritoryRecord(v)) {
                            p.totalTerritoryPopulationRecords++;
                            p.totalTerritoryPopulationRate += +v.count;
                            p.avgtotalTerritoryPopulationRate = p.totalTerritoryPopulationRate / p.totalTerritoryPopulationRecords;
                        }
                        if (isPackRecord(v)) {
                            p.PackRecords++;
                            p.PackRate += +v.count;
                            p.avgPackRate = p.PackRate / p.PackRecords;
                        }
                        p.packPopulationRatio = p.avgPackRate / p.avgtotalTerritoryPopulationRate * 1;
                        return p;
                    },
                    function(p, v) {
                        if (isTerritoryRecord(v)) {
                            p.totalTerritoryPopulationRecords--;
                            p.totalTerritoryPopulationRate -= +v.count;
                            p.avgtotalTerritoryPopulationRate = p.totalTerritoryPopulationRate / p.totalTerritoryPopulationRecords;
                        }
                        if (isPackRecord(v)) {
                            p.PackRecords--;
                            p.PackRate -= +v.count;
                            p.avgPackRate = p.PackRate / p.PackRecords;
                        }
                        p.packPopulationRatio = p.avgPackRate / p.avgtotalTerritoryPopulationRate * 1;
                        return p;
                    },
                    function() {
                        return {
                            totalTerritoryPopulationRecords:0,
                            totalTerritoryPopulationRate:0,
                            avgtotalTerritoryPopulationRate:0,
                            PackRecords:0,
                            PackRate:0,
                            avgPackRate:0,
                            packPopulationRatio:0
                        };
                    }
            );

            
            var levelDimension = data.dimension(function (d) { return d.packLevel; });
            var levelGroup = levelDimension.group().reduceSum(function(d) { return d.count; });

            var populationDimension = data.dimension(function (d) { return d.packName; });
            var populationGroup = populationDimension.group().reduceSum(function(d) { return d.count; });

            var sexesDimension = data.dimension(function (d) { return d.sex; });
            var sexesCount = sexesDimension.group().reduceSum(function(d) { return d.count; });
                
            
            var coloringDimension = data.dimension(function (d) { return d.coatColor; });
            var coloringGroup = coloringDimension.group().reduceSum(function(d) { return d.count; });
            
            
            colorChart.width(400)
                    .height(180)
                    .radius(80)
                    .innerRadius(30)
                    .ordinalColors(['#66cc99', '#ffcc66', '#ff6633', '#990033', '#1d91c0', '#333399'])
                    .dimension(coloringDimension)
                    .group(coloringGroup)
                    .legend(dc.legend().x(0).y(0))
                    .renderLabel(false);

            mapChart.dimension(packDimension)
                    .group(packGroup)
                    .radiusValueAccessor(function(p) {
                        return p.value.avgtotalTerritoryPopulationRate;
                    })
                    .r(d3.scaleLinear().domain([0, 200000]))
                    .colors(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666","#49006a"])
                    .colorDomain([13, 30])
                    .colorAccessor(function(p) {
                        return p.value.packPopulationRatio;
                    })
                    .point("Mollie's",400, 200)
                    .point("Cougar Creek",80, 180)
                    .point("Wapiti Lake",230, 160 )
                    .point("Prospect Peak", 230, 70)
                    .point("Junction Butte-A", 320, 70)
                    .point("Junction Butte-B", 320, 90)
                    .point("Canyon", 150, 250)
                    .point("Snake River", 240,400)
                    .point("Cinnabar", 100, 100)
                    .point("Eight Mile", 170, 125)
                    .point("Lamar Valley", 400, 70)
                    .debug(false);

            levelChart.width(300)
                    .height(180)
                    .radius(80)
                    .innerRadius(30)
                    .ordinalColors(['#66cc99', '#ffcc66', '#ff6633', '#990033', '#1d91c0', '#333399'])
                    .dimension(levelDimension)
                    .group(levelGroup)
                    .legend(dc.legend().x(0).y(0))
                    .renderLabel(false);

            populationChart.width(540)
                        .height(480)
                        .margins({top: 50, right: 40, bottom: 30, left: 120})
                        .transitionDuration(1000)
                        .dimension(populationDimension)
                        .group(populationGroup)
                        .ordinalColors(['#66cc99', '#ffcc66', '#ff6633', '#990033', '#1d91c0', '#333399'])
                            // ['rgb(127,205,187)','rgb(65,182,196)','rgb(29,145,192)','rgb(34,94,168)','rgb(37,52,148)','rgb(8,29,88)'])
                        .labelOffsetX([-8])
                        .labelOffsetY([12])
                        .title(function () { return ""; })
                        .elasticX(true)
                        .xAxis().ticks(4);

            sexChart.width(300)
                       .height(180)
                       .radius(80)
                       .innerRadius(30)
                       .ordinalColors(['#66cc99', '#ffcc66', '#ff6633', '#990033', '#1d91c0', '#333399'])
                       .dimension(sexesDimension)
                       .group(sexesCount) 
                       .legend(dc.legend().x(0).y(0))
                       .renderLabel(false);
            
            
            dc.dataCount("#data-count-top")
                    .dimension(data)
                    .group(all);
            
            dc.dataCount("#age-count")
                    .dimension(data)
                    .group(all);
            
            dc.dataCount("#sex-count")
                    .dimension(data)
                    .group(all);
            
            dc.dataCount("#color-count")
                    .dimension(data)
                    .group(all);

            dc.renderAll();
        });
 