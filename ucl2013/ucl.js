(function(){
  String.prototype.titleize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  jedi.debugging = false;

  var engine = (function(){
    // Render champion
    var champion;
    // champion = "dortmund";
    champion = "bayernmunich";

    var options = {
      tweetWidth: 50,
      chartHeight: 300,
      goalWidth: 20,
      axisGutter: 10
    };

    var state = {
      teamSelected: false
    };

    var data = {
      timeSeries:{},
      teams:{},
      games:{}
    };

    var delimiter = "|";

    var vis;
    var connectionG, gameG, logoG;
    var width = 1240;
    var height = champion?3130:2630;

    var theforce = new jedi.force();

    var timeScale = d3.scale.linear()
      .domain([-30, 150])
      .range([0, options.chartHeight]);

    var countScale = d3.scale.linear()
      .range([0, options.tweetWidth]);
    var countScale2 = d3.scale.linear()
      .range([0, options.goalWidth]);

    var numFormat = d3.format(",d");

    var posArea = d3.svg.area()
      .interpolate("linear")
      .y(function(d) { return timeScale(d.minute); })
      .x0(0)
      .x1(function(d) { return countScale(d.count); })
    var negArea = d3.svg.area()
      .interpolate("linear")
      .y(function(d) { return timeScale(d.minute); })
      .x0(0)
      .x1(function(d) { return -countScale(d.count); })

    var goalArea = d3.svg.area()
      .interpolate("basis")
      .y(function(d) { return timeScale(d.minute); })
      .x0(function(d) { return countScale2(d.count); })
      .x1(function(d) { return -countScale2(d.count); })

    var myTip;

    var bigEarSVG = "M 32.36 12.38 C 39.68 7.78 48.76 7.28 57.13 8.29 C 65.13 9.32 72.77 14.26 76.01 21.80 C 79.37 29.72 79.93 38.84 77.55 47.11 C 74.01 60.84 68.98 74.11 64.04 87.38 C 70.91 90.45 74.85 100.15 69.12 106.12 C 65.98 106.06 62.63 105.92 59.93 104.09 C 54.29 100.46 52.70 92.71 54.35 86.55 C 59.72 70.73 66.54 54.95 67.08 38.01 C 67.21 31.03 65.66 22.68 59.09 18.89 C 54.68 16.01 49.14 17.01 44.45 18.56 C 37.57 20.96 32.27 26.50 28.76 32.73 C 23.49 42.06 21.10 52.68 19.54 63.19 C 16.87 83.15 17.38 103.39 18.87 123.43 C 21.02 150.18 25.21 176.74 30.64 203.01 C 35.60 226.62 41.52 250.05 49.00 272.99 C 53.83 287.40 58.97 301.89 67.13 314.81 C 51.18 268.95 43.37 220.03 46.00 171.47 C 48.86 170.98 51.74 170.60 54.63 170.28 C 53.44 170.24 51.07 170.16 49.88 170.13 C 59.63 163.66 69.01 156.59 77.54 148.57 C 82.66 143.60 87.67 138.26 90.88 131.83 C 91.20 127.30 90.90 122.74 91.01 118.20 C 86.96 114.10 82.57 110.32 78.79 105.95 C 76.72 105.94 74.66 105.93 72.59 105.93 C 72.59 104.04 72.59 102.15 72.59 100.27 C 130.86 100.26 189.14 100.26 247.41 100.27 C 247.41 102.15 247.41 104.04 247.41 105.93 C 245.34 105.93 243.27 105.94 241.21 105.95 C 237.43 110.32 233.04 114.10 228.99 118.20 C 229.10 122.74 228.79 127.30 229.12 131.83 C 232.33 138.27 237.34 143.60 242.47 148.58 C 251.01 156.60 260.39 163.68 270.16 170.14 C 268.94 170.14 266.52 170.15 265.31 170.15 C 268.21 170.56 271.10 170.99 274.00 171.48 C 276.63 220.04 268.82 268.95 252.87 314.81 C 260.76 302.33 265.81 288.36 270.52 274.44 C 283.47 234.67 292.39 193.62 298.07 152.19 C 301.24 127.59 303.30 102.72 301.90 77.91 C 300.97 64.40 299.26 50.68 293.93 38.11 C 290.53 30.17 285.05 22.48 276.84 19.06 C 271.63 17.02 265.19 15.75 260.30 19.27 C 254.20 23.25 252.82 31.23 252.92 37.99 C 253.45 54.93 260.27 70.71 265.64 86.53 C 267.31 92.73 265.69 100.56 259.96 104.16 C 257.28 105.94 253.98 106.05 250.88 106.12 C 245.15 100.15 249.09 90.44 255.96 87.37 C 251.61 75.81 247.32 64.21 243.85 52.35 C 242.30 46.71 240.52 40.94 241.06 35.01 C 241.41 27.06 243.91 18.52 250.45 13.46 C 257.60 7.73 267.37 7.22 276.10 8.30 C 284.50 9.29 292.00 14.33 297.03 21.00 C 304.13 30.49 307.83 42.02 310.32 53.47 C 315.99 81.30 315.37 109.96 313.31 138.14 C 311.14 162.87 307.93 187.63 301.22 211.58 C 291.01 250.00 278.41 287.86 262.23 324.20 C 255.12 340.00 247.36 355.53 238.34 370.33 C 230.78 382.73 222.15 394.59 211.60 404.62 C 210.26 405.94 208.71 407.05 207.61 408.59 C 200.44 419.19 193.02 429.78 183.77 438.69 C 185.38 439.39 188.12 438.97 188.62 441.12 C 191.05 448.47 194.48 455.59 199.60 461.45 C 206.64 469.70 216.58 475.11 227.04 477.68 C 231.13 478.89 235.55 478.95 239.42 480.91 C 237.64 481.07 235.88 481.32 234.13 481.68 C 235.71 481.65 237.28 481.56 238.86 481.38 C 241.46 483.80 244.06 486.24 246.62 488.72 C 189.89 502.09 130.11 502.09 73.38 488.72 C 75.94 486.24 78.53 483.80 81.14 481.38 C 82.71 481.57 84.29 481.68 85.87 481.71 C 84.12 481.35 82.36 481.08 80.59 480.91 C 84.46 478.95 88.89 478.89 93.00 477.67 C 104.37 474.89 115.13 468.66 122.22 459.21 C 126.41 453.81 129.23 447.52 131.39 441.08 C 131.92 438.97 134.63 439.39 136.23 438.69 C 126.60 429.52 119.17 418.38 111.56 407.57 C 96.27 393.94 84.85 376.64 74.98 358.85 C 56.25 324.81 42.20 288.39 30.35 251.45 C 25.09 234.77 20.29 217.94 16.03 200.97 C 11.34 181.09 8.73 160.77 6.89 140.44 C 5.14 118.97 4.45 97.35 6.39 75.87 C 7.73 61.81 10.03 47.65 15.40 34.51 C 19.02 25.88 24.21 17.38 32.36 12.38 Z";

    var rounds = {
      "sixteen": {
        "pairs": [
          {team1: "porto", team2: "malaga", game1Date: "02-19", game2Date: "03-13"},
          {team1: "shahktar", team2: "dortmund", game1Date: "02-13", game2Date: "03-05"},
          {team1: "realmadrid", team2: "manutd", game1Date: "02-13", game2Date: "03-05"},
          {team1: "galatasaray", team2: "schalke", game1Date: "02-20", game2Date: "03-12"},
          {team1: "valencia", team2: "psg", game1Date: "02-12", game2Date: "03-06"},
          {team1: "milan", team2: "barcelona", game1Date: "02-20", game2Date: "03-12"},
          {team1: "arsenal", team2: "bayernmunich", game1Date: "02-19", game2Date: "03-13"},
          {team1: "celtic", team2: "juventus", game1Date: "02-12", game2Date: "03-06"}
        ]
      },
      "quarter": {
        "teams": [
          {name: "malaga", index1: 0, index2: 0, direction1: -1, direction2: -1},
          {name: "dortmund", index1: 1, index2: 0, direction1: -1, direction2: +1},
          {name: "realmadrid", index1: 2, index2: 1, direction1: +1, direction2: -1},
          {name: "galatasaray", index1: 3, index2: 1, direction1: +1, direction2: +1},
          {name: "psg", index1: 4, index2: 2, direction1: -1, direction2: -1},
          {name: "barcelona", index1: 5, index2: 2, direction1: -1, direction2: +1},
          {name: "bayernmunich", index1: 6, index2: 3, direction1: -1, direction2: -1},
          {name: "juventus", index1: 7, index2: 3, direction1: -1, direction2: +1}
        ],
        "pairs": [
          {team1: "malaga",       team2: "dortmund",    game1Date: "04-03", game2Date: "04-09"},
          {team1: "realmadrid",   team2: "galatasaray", game1Date: "04-03", game2Date: "04-09"},
          {team1: "psg",          team2: "barcelona",   game1Date: "04-02", game2Date: "04-10"},
          {team1: "bayernmunich", team2: "juventus",    game1Date: "04-02", game2Date: "04-10"}
        ]
      },
      "semi": {
        "teams": [
          {name: "dortmund", index1: 0, index2: 0, direction1: -1, direction2: -1},
          {name: "realmadrid", index1: 1, index2: 0, direction1: +1, direction2: +1},
          {name: "bayernmunich", index1: 3, index2: 1, direction1: +1, direction2: -1},
          {name: "barcelona", index1: 2, index2: 1, direction1: -1, direction2: +1}
        ],
        "pairs": [
          {team1: "dortmund",     team2:"realmadrid", game1Date: "04-24", game2Date: "04-30"},
          {team1: "bayernmunich", team2:"barcelona",  game1Date: "04-23", game2Date: "05-01"}
        ]
      },
      "final": {
        "teams": [
          {name: "dortmund", index1: 0, index2: 0, direction1: +1, direction2: -1},
          {name: "bayernmunich", index1: 1, index2: 0, direction1: +1, direction2: +1}
        ],
        "pairs": [
          {team1: "dortmund",     team2:"bayernmunich", game1Date: "05-25", game2Date: null}
        ]
      }
    };

    function init(id){
      myTip = new sstooltip("myTip");

      // clean after init
      sstooltip = null;

      vis = d3.select("#"+id)
        .append("svg")
        .attr("width", width+"px")
        .attr("height", height+"px")

      // vis.append("rect")
      //   .style("opacity", 0.95)
      //   .style("fill", "#fefef0")
      //   .attr("width", width)
      //   .attr("height", height);

      connectionG = vis.append("g")
        .attr("transform", "translate("+0+","+40+")");

      gameG = vis.append("g");

      $("#normalizedScaleRadio").on("click", function(e){
        updateScale("normalized");
      });
      $("#gameScaleRadio").on("click", function(e){
        updateScale("game");
      });
      $("#roundScaleRadio").on("click", function(e){
        updateScale("round");
      });
      $("#absoluteScaleRadio").on("click", function(e){
        updateScale("absolute");
      });
    }

    function loadCombinedData(combinedFile){
      d3.json(combinedFile, function(error, result){
        data = result;

        // console.log(data);

        visualize();
      });
    }

    function loadData(dataFile, teamFile, gameFile){
      queue()
        .defer(d3.csv, dataFile)
        .defer(d3.csv, teamFile)
        .defer(d3.json, gameFile)
        .awaitAll(ready);

      function ready(error, results){
        var rawData = results[0];
        var teamData = results[1];
        var gameData = results[2];

        rawData.forEach(function(row){
          row.count = +row.count;
          row.minute = +row.minute;

          var key = row.term+"|"+row.date;
          var ts = data.timeSeries[key];
          if(!ts){
            ts = {
              extent: [],
              points: []
            };
            data.timeSeries[key] = ts;
          }

          ts.points.push(row);
        });

        var allSeries = Object.keys(data.timeSeries).map(function(key){
          var ts = data.timeSeries[key];
          ts.extent = d3.extent(ts.points, function(d){return d.count;});
          return ts;
        });

        //calculate max tpm
        data.maxTPM = d3.max(allSeries, function(d){return d.extent[1];});
        //calculate max tpm per round
        Object.keys(rounds).forEach(function(roundKey){
          var round = rounds[roundKey];
          var series = [];
          round.pairs.forEach(function(pair){
            series.push(data.timeSeries[pair.team1+delimiter+pair.game1Date]);
            series.push(data.timeSeries[pair.team2+delimiter+pair.game1Date]);
            if(pair.game2Date){
              series.push(data.timeSeries[pair.team1+delimiter+pair.game2Date]);
              series.push(data.timeSeries[pair.team2+delimiter+pair.game2Date]);
            }
          });
          round.maxTPM = d3.max(series, function(d){return d.extent[1];});
        });

        //process team data
        teamData.forEach(function(row){
          data.teams[row.key] = row;
        });

        //process game data
        gameData.forEach(function(row){
          data.games[row.team1+delimiter+row.team2+delimiter+row.dateKey] = row;
          row.events.forEach(function(event){
            event.minute = +event.minute;
          });
        });


        visualize();
      }
    }

    var roundParams = {
      "sixteen": {
        "options": {
          startY: 25,
          tweetWidth: 35,
          chartHeight: 300,
          chartPaddingBottom: 80,
          goalWidth: 6,
          axisGutter: 0,
          gutter: 35,
          showGoal: false,
          showScorer: false
        }
      },
      "quarter": {},
      "semi": {},
      "final": {}
    };

    roundParams["quarter"].options = {
      startY: roundParams["sixteen"].options.startY + (roundParams["sixteen"].options.chartHeight+roundParams["sixteen"].options.chartPaddingBottom)*2,
      tweetWidth: 35,
      chartHeight: 300,
      chartPaddingBottom: 80,
      goalWidth: 10,
      axisGutter: 0,
      gutter: 70,
      showGoal: false,
      showScorer: true
    };

    roundParams["semi"].options = {
      startY: roundParams["quarter"].options.startY + (roundParams["quarter"].options.chartHeight+roundParams["quarter"].options.chartPaddingBottom)*2,
      tweetWidth: 35,
      chartHeight: 300,
      goalWidth: 20,
      axisGutter: 0,
      gutter: 165,
      chartPaddingBottom: 100,
      showGoal: true,
      showScorer: true,
      showPlayerStats: true,
      offsideOffset: 30,
      playerStatsOffset: 30,
      playerStatsGap: 28
    };

    roundParams["final"].options = {
      startY: roundParams["semi"].options.startY + (roundParams["semi"].options.chartHeight+roundParams["semi"].options.chartPaddingBottom)*2,
      tweetWidth: 35,
      chartHeight: 400,
      goalWidth: 24,
      axisGutter: 0,
      gutter: 170,
      chartPaddingBottom: 80,
      showGoal: true,
      showScorer: true,
      showPlayerStats: true,
      offsideOffset: 30,
      playerStatsOffset: 30,
      playerStatsGap: 28
    };

    var halfWidth = width/2;

    function visualize(){
      // Setup params
      Object.keys(roundParams).forEach(function(key){
        var param = roundParams[key];
        param.options.halfChartWidth = param.options.tweetWidth+param.options.goalWidth+param.options.axisGutter + param.options.gutter;
        param.axisPos = calculateAxisPos(param.options, rounds[key].pairs.length);
      });

      renderRound(rounds["sixteen"].pairs, roundParams["sixteen"].options);
      renderRound(rounds["quarter"].pairs, roundParams["quarter"].options);
      renderRound(rounds["semi"].pairs, roundParams["semi"].options);

      // Render logos
      logoG = vis.append("g").classed("logo", true);
      rounds["sixteen"].pairs.forEach(function(pair, i){
        var xPos = roundParams["sixteen"].axisPos[i];
        logoG.append("image")
          .classed("logo", true)
          .classed(pair.team1, true)
          .attr("x", xPos-32-roundParams["sixteen"].options.goalWidth)
          .attr("y", roundParams["sixteen"].options.startY - 25)
          .attr("width", 32)
          .attr("height", 32)
          .attr("xlink:href", "img/logos/"+pair.team1+".png")
          .on("click", function(d){ highlightTeam(pair.team1); d3.event.stopPropagation(); });

        logoG.append("image")
          .classed("logo", true)
          .classed(pair.team2, true)
          .attr("x", xPos+roundParams["sixteen"].options.goalWidth)
          .attr("y", roundParams["sixteen"].options.startY - 25)
          .attr("width", 32)
          .attr("height", 32)
          .attr("xlink:href", "img/logos/"+pair.team2+".png")
          .on("click", function(d){ highlightTeam(pair.team2); d3.event.stopPropagation(); });
      });

      // Render connections between rounds
      renderConnectionBetweenRound("quarter", "sixteen");
      renderConnectionBetweenRound("semi", "quarter");

      if(champion){
        // Render final
        renderRound(rounds["final"].pairs, roundParams["final"].options);
        renderConnectionBetweenRound("final", "semi");

        var ballYPos = roundParams["final"].options.startY + roundParams["final"].options.chartHeight + 170;

        vis.append("g")
          .attr("transform", "translate("+(halfWidth-(320*0.51/2))+","+(ballYPos - 50)+") scale(.51)")
        .append("path")
          .classed("big-ear", true)
          .attr("d", bigEarSVG)
          .style("fill", "#222")

        // vis.append("circle")
        //   .attr("cx", halfWidth)
        //   .attr("cy", ballYPos+75)
        //   .attr("r", 65)
        //   .style("fill", "#383838")
        //   .style("opacity", 1)

        vis.append("text")
          .classed("ucl-final", true)
          .attr("x", halfWidth)
          .attr("y", ballYPos+73)
          .text("Champions")
          .style("text-anchor", "middle")
        vis.append("text")
          .classed("ucl-final-date", true)
          .attr("x", halfWidth)
          .attr("y", ballYPos+73+20)
          .text(data.teams[champion].name)
          .style("text-anchor", "middle")

        renderConnection(
          champion==rounds["final"].pairs[0].team1 ? (halfWidth - roundParams["final"].options.goalWidth-1) : (halfWidth + roundParams["final"].options.goalWidth+1),
          roundParams["final"].options.startY + (roundParams["final"].options.chartHeight),
          halfWidth,
          ballYPos,
          data.teams[champion].color
        );
      }
      else{
        var ballYPos = roundParams["final"].options.startY + 70;

        renderConnectionBetweenRound("final", "semi");

        vis.append("g")
          .attr("transform", "translate("+(halfWidth-(320*0.51/2))+","+(ballYPos - 50)+") scale(.51)")
        .append("path")
          .classed("big-ear", true)
          .attr("d", bigEarSVG)
          .style("fill", "#333")

        vis.append("text")
          .classed("ucl-final", true)
          .attr("x", halfWidth)
          .attr("y", ballYPos+73)
          .text("#UCLFinal")
          .style("text-anchor", "middle")
        vis.append("text")
          .classed("ucl-final-date", true)
          .attr("x", halfWidth)
          .attr("y", ballYPos+73+20)
          .text("May 25, 2013")
          .style("text-anchor", "middle")
      }

    }

    function calculateAxisPos(options, numPair){
      return d3.range(halfWidth - options.halfChartWidth*(numPair-1), halfWidth + options.halfChartWidth*(numPair-1) +1, options.halfChartWidth*2);
    }

    function renderConnectionBetweenRound(roundTo, roundFrom){
      var teams = rounds[roundTo].teams;
      var roundParams1 = roundParams[roundFrom];
      var roundParams2 = roundParams[roundTo];
      var axisPos1 = roundParams1.axisPos;
      var axisPos2 = roundParams2.axisPos;
      var options1 = roundParams1.options;
      var options2 = roundParams2.options;

      teams.forEach(function(team){
        renderConnection(
          axisPos1[team.index1]+(options1.goalWidth+1)*team.direction1,
          options2.startY - options1.chartPaddingBottom,
          axisPos2[team.index2]+(options2.goalWidth+1)*team.direction2,
          options2.startY,
          data.teams[team.name].color
        )
        .classed("connection", true)
        .classed(team.name, true)
      });
    }

    function renderRound(pairsInRound, options){
      var halfChartWidth = options.halfChartWidth;
      var y = options.startY;
      var y2 = y + options.chartHeight + options.chartPaddingBottom;
      var numPair = pairsInRound.length;

      var axisPos = calculateAxisPos(options, numPair);

      pairsInRound.forEach(function(pair, i){
        renderGame("", data.teams[pair.team1], data.teams[pair.team2], pair.game1Date, {x: axisPos[i], y:y}, options);
        if(pair.game2Date){
          renderGame("", data.teams[pair.team2], data.teams[pair.team1], pair.game2Date, {x: axisPos[i], y:y2}, options);
          renderLegConnection(pair.team1, pair.team2, axisPos[i], y, y2, options.chartHeight, options.goalWidth);
        }
      });
    }

    function renderConnection(x1,y1,x2,y2,color){
      var midY = (y1+y2)/2;
      return connectionG.append("path")
        .attr("d", "M "+x1+ ","+y1+" C "+x1+","+midY+" "+x2+","+midY+" "+x2+","+(y2))
        .style("fill", "none")
        .style("opacity", 1)
        .style("stroke-width", 1)
        .style("stroke", color);
    }

    function renderLegConnection(team1, team2, x, y1, y2, chartHeight, goalWidth){
      renderConnection(
        x-goalWidth-1,
        y1+chartHeight,
        x+goalWidth+1,
        y2,
        data.teams[team1].color
      )
      .classed("connection", true)
      .classed(team1, true);

      renderConnection(
        x+goalWidth+1,
        y1+chartHeight,
        x-goalWidth-1,
        y2,
        data.teams[team2].color
      )
      .classed("connection", true)
      .classed(team2, true);
    }

    function renderGame(name, team1, team2, dateKey, offset, options){
      timeScale.range([0, options.chartHeight]);
      countScale.range([0, options.tweetWidth]);
      countScale2.range([0, options.goalWidth]);

      var key1 = team1.key+delimiter+dateKey;
      var key2 = team2.key+delimiter+dateKey;

      var gameKey = team1.key+delimiter+team2.key+delimiter+dateKey;
      var game = data.games[gameKey];

      var g = gameG.append("g")
        .attr("transform", "translate("+offset.x+","+offset.y+")")
        .classed("game", true)
        .classed(team1.key, true)
        .classed(team2.key, true);

      // g.append("text")
      //   .text(name)
      //   .attr("y", 10)
      //   .classed("game-name", true)
      //   .style("text-anchor", "middle")

      g.append("text")
        .text(team1.name)
        .classed(team1.key, true)
        .classed("team-label", true)
        .attr("x", -options.goalWidth-5)
        .attr("y", 30)
        .style("text-anchor", "end")
        .on("click", function(d){ highlightTeam(team1.key); d3.event.stopPropagation(); });

      g.append("text")
        .text(team2.name)
        .classed(team2.key, true)
        .classed("team-label", true)
        .attr("x", options.goalWidth+5)
        .attr("y", 30)
        .style("text-anchor", "start")
        .on("click", function(d){ highlightTeam(team2.key); d3.event.stopPropagation(); });

      var chartG = g.append("g")
        .attr("transform", "translate("+0+","+40+")");

      var chartAreaRect = chartG.append("rect")
        .attr("x", -(options.halfChartWidth-options.gutter))
        .attr("width", (options.halfChartWidth-options.gutter)*2)
        .attr("height", options.chartHeight)
        .style("fill", "#eee")
        .style("opacity", 0)

      var axisLayer = chartG.append("g").classed("axis-layer", true);
      var goalLayer = chartG.append("g").classed("goal-layer", true);
      var eventLabelLayer = chartG.append("g").classed("event-label-layer", true);
      var tweetLayer = chartG.append("g").classed("tweet-layer", true);
      var eventLayer = chartG.append("g").classed("event-layer", true);
      var highlightLayer = chartG.append("g").classed("highlight-layer", true);

      vis.on("click", function(d){
        highlightTeam(null);
      });
      // g.on("mouseover", function(d){
      //   countScale
      //     .domain([0, data.timeSeries[key1].extent[1]])
      //     .range([0, options.tweetWidth + options.axisGutter])
      //   tweetLayer.select("path.left-tweet")
      //     .style("opacity", 1)
      //     .transition()
      //       .duration(200)
      //       .attr("d", negArea);
      //   countScale
      //     .domain([0, data.timeSeries[key2].extent[1]])
      //     .range([0, options.tweetWidth + options.axisGutter])
      //   tweetLayer.select("path.right-tweet")
      //     .style("opacity", 1)
      //     .transition()
      //       .duration(200)
      //       .attr("d", posArea);
      // })
      // .on("mouseout", function(d){
      //   countScale
      //     .domain([0, data.timeSeries[key1].extent[1]])
      //     .range([0, options.tweetWidth])
      //   tweetLayer.select("path.left-tweet")
      //     .transition()
      //       .duration(200)
      //       .attr("d", negArea);
      //   countScale
      //     .domain([0, data.timeSeries[key2].extent[1]])
      //     .range([0, options.tweetWidth])
      //   tweetLayer.select("path.right-tweet")
      //     .transition()
      //       .duration(200)
      //       .attr("d", posArea);
      // })

      var halfChartWidth = options.tweetWidth+options.goalWidth+options.axisGutter;

      axisLayer.attr("transform", "translate("+(-halfChartWidth)+","+0+")");

      var timeSteps = d3.range(-30,151,5);
      axisLayer.selectAll("line.axis")
          .data(timeSteps, function(d){return d;})
        .enter().append("line")
          .classed("axis", true)
          .attr("x1", 1)
          .attr("x2", halfChartWidth*2)
          .attr("y1", function(d){return timeScale(d);})
          .attr("y2", function(d){return timeScale(d);})
          .style("stroke", function(d){
            var realMinute = getGameMinute(d);
            return ( realMinute >= 0 ) ? "#ddd" : "#f0f0f0";
          });

      axisLayer.selectAll("text.axis-label")
          .data([0,45,61,105], function(d){return d;})
        .enter().append("text")
          .text(function(d){return getGameMinute(d)+"'";})
          .classed("axis-label", true)
          .attr("x", 0)
          .attr("dy", 4)
          .attr("y", function(d){return timeScale(d);})

      // countScale.domain([0,Math.max(data.timeSeries[key1].extent[1], data.timeSeries[key2].extent[1])]);
      countScale.domain([0,data.timeSeries[key1].extent[1]]);
      // countScale.domain(data.timeSeries[key1].extent);
      tweetLayer.append("g")
        .attr("transform", "translate("+(-options.goalWidth)+","+0+")")
      .append("path")
        .attr("id", "tweet-"+team1.key+"-"+dateKey)
        .classed("tweet", true)
        .classed("left-tweet", true)
        .classed(team1.key, true)
        .datum(data.timeSeries[key1].points, function(d){return d.minute;})
        .attr("d", negArea)
        .style("fill", team1.color)

      var bait1 = renderMinuteHighlight(
        highlightLayer,
        options.tweetWidth+options.axisGutter,
        -(options.goalWidth+options.tweetWidth+options.axisGutter),
        0,
        options.chartHeight,
        data.timeSeries[key1], team1.name
      );

      bait1.on("click", function(d){
        highlightTeam(team1.key);
        d3.event.stopPropagation();
      });

      countScale.domain([0,data.timeSeries[key2].extent[1]]);
      // countScale.domain(data.timeSeries[key2].extent);
      tweetLayer.append("g")
        .attr("transform", "translate("+(options.goalWidth)+","+0+")")
      .append("path")
        .attr("id", "tweet-"+team2.key+"-"+dateKey)
        .classed("tweet", true)
        .classed("right-tweet", true)
        .classed(team2.key, true)
        .datum(data.timeSeries[key2].points, function(d){return d.minute;})
        .attr("d", posArea)
        .style("fill", team2.color)

      var bait2 = renderMinuteHighlight(
        highlightLayer,
        options.tweetWidth+options.axisGutter,
        options.goalWidth,
        0,
        options.chartHeight,
        data.timeSeries[key2], team2.name
      );

      bait2.on("click", function(d){
        highlightTeam(team2.key);
        d3.event.stopPropagation();
      });

      if(options.showGoal){
        // draw goal
        g.append("text")
          .text("#goal")
          .classed("goal-text", true)
          .style("text-anchor", "middle")
          .attr("y", 78)

        var goalKey = "goal"+delimiter+dateKey;

        countScale2.domain(data.timeSeries[goalKey].extent);
        goalLayer.append("path")
          .datum(data.timeSeries[goalKey].points, function(d){return d.minute;})
          .attr("d", goalArea)
          .style("fill", "#777")

        // draw offside
        var offsidePos = -(options.tweetWidth+options.goalWidth+options.axisGutter+options.offsideOffset);
        g.append("text")
          .text("#offside")
          .classed("goal-text", true)
          .style("text-anchor", "middle")
          .attr("x", offsidePos)
          .attr("y", 78)

        var key = "offside"+delimiter+dateKey;
        // countScale2.domain(data.timeSeries[key].extent);
        goalLayer
          .append("g")
            .attr("transform", "translate("+(offsidePos)+","+0+")")
          .append("path")
            .datum(data.timeSeries[key].points, function(d){return d.minute;})
            .attr("d", goalArea)
            .style("fill", "#777");

        renderMinuteHighlight(
          goalLayer,
          options.goalWidth,
          offsidePos-options.goalWidth/2,
          timeScale(0),
          options.chartHeight,
          data.timeSeries[key], "#offside")
      }

      if(options.showPlayerStats && game.keyPlayerStats){
        var playerStatsPos = offsidePos - options.playerStatsOffset;

        game.keyPlayerStats[0].reverse().forEach(function(player,i){
          renderPlayerStats(goalLayer, player, dateKey, team1, playerStatsPos-options.playerStatsGap/2-options.playerStatsGap*i, options, true);
        });

        game.keyPlayerStats[1].reverse().forEach(function(player,i){
          renderPlayerStats(goalLayer, player, dateKey, team2, playerStatsPos-options.playerStatsGap*i, options, false);
        });
      }

      //Draw events
      if(game){
        var events = game.events;

        // draw circle
        eventLayer.selectAll("g.event")
            .data(events, function(d,i){return i;})
          .enter().append("g")
              .attr("class", function(d){return d.side;})
              .classed("event", true)
            .append("circle")
              .attr("cy", function(d){return timeScale(gameMinuteToRealMinute(d.minute));})
              .attr("r", 3)
              .style("stroke", "black")
              .style("stroke-width", 2)
              .style("fill", function(d){return data.teams[d.side].color;})
              .on("mouseover", function(d){
                var $tmp = $("<span>Goal: </span>");
                $("<b>").text(data.teams[d.side].name).appendTo($tmp);
                $("<br>").appendTo($tmp);
                $("<span>").text(d.minute+"' "+d.info).appendTo($tmp);

                myTip.show($tmp[0].outerHTML, d3.event);

                // myTip.show("Goal: "+data.teams[d.side].name+"<br>"+d.minute+"' "+d.info, d3.event);
              })
              .on("mouseout", function(d){
                myTip.hide();
              })

        // draw labels
        var posLabelPos = halfChartWidth+5;
        var negLabelPos = -halfChartWidth-5;

        var nodes = events.map(function(event){
          var pos = timeScale(gameMinuteToRealMinute(event.minute));
          var node = new jedi.node(pos, pos, 10, event);
          node.xPos = posLabelPos;
          // if(event.side==team1.key){
          //   node.xPos = negLabelPos;
          // }
          // else if(event.side==team2.key){
          //   node.xPos = posLabelPos;
          // }
          return node;
        });
        theforce.simulate(nodes, 100);

        var labelSelection = eventLabelLayer.selectAll("g.event-label")
            .data(nodes, function(d,i){return i;})
          .enter().append("g")
            .attr("class", function(d){return d.data.side;})
            .classed("event-label", true)
            .attr("transform", function(d){return "translate("+(d.xPos)+","+d.currentPos+")";})
            .on("mouseover", function(d){
              var $tmp = $("<span>Goal: </span>");
              $("<b>").text(data.teams[d.data.side].name).appendTo($tmp);
              $("<br>").appendTo($tmp);
              $("<span>").text(d.data.minute+"' "+d.data.info).appendTo($tmp);

              myTip.show($tmp[0].outerHTML, d3.event);
            })
            .on("mouseout", function(d){
              myTip.hide();
            })

        labelSelection.append("circle")
          .attr("r", 2)

        labelSelection.append("rect")
          .attr("x", 3)
          .attr("y", -3)
          .attr("width", 6)
          .attr("height", 6)
          .style("fill", function(d){return data.teams[d.data.side].color;})

        labelSelection.append("text")
          .classed("event-label", true)
          .attr("x", function(d){return d.xPos>0?12:-5;})
          .attr("y", 4)
          .text(function(d){
            return options.showScorer ? (d.data.minute+"' "+d.data.info) : (d.data.minute+"'");
          })
          .style("text-anchor", function(d){return d.xPos>0?"start":"end";})

        tweetLayer.selectAll("path.event-link")
            .data(nodes, function(d,i){return i;})
          .enter().append("path")
            .attr("class", function(d){return d.data.side;})
            .classed("event-link", true)
            .attr("d", function(d){
              return "M "+0+ ","+d.idealPos+" C "+(d.xPos/2)+","+d.idealPos+" "+(d.xPos/2)+","+d.currentPos+" "+d.xPos+","+(d.currentPos);
            })
            .style("opacity", 0.5)
            .style("stroke", "black")
            .style("fill", "none")
      }

    }

    function renderPlayerStats(containerG, player, dateKey, team, x, options, isLabelOnTop){
      var key = player+delimiter+dateKey;
      countScale2
        .domain(data.timeSeries[key].extent)
        .range([0, options.goalWidth/3])

      var playerG = containerG.append("g")
        .classed(team.key, true)
        .classed("player-stats", true)
        .attr("transform", "translate("+(x)+","+0+")")

      if(isLabelOnTop){
        playerG.append("line")
            .attr("y1", timeScale(0)-5)
            .attr("y2", options.chartHeight)
            .style("stroke", team.color)

        playerG.append("text")
            .text(player.titleize())
            .classed("player-axis-label", true)
            .attr("transform", "translate(2,"+(timeScale(0)-11)+") rotate(45)")
            .style("text-anchor", "end")
      }
      else{
        playerG.append("line")
          .attr("y1", timeScale(0))
          .attr("y2", options.chartHeight+5)
          .style("stroke", team.color)

        playerG.append("text")
          .text(player.titleize())
          .classed("player-axis-label", true)
          .attr("transform", "translate(4,"+(options.chartHeight+13)+") rotate(-45)")
          .style("text-anchor", "end")
      }

      playerG.append("path")
        .datum(data.timeSeries[key].points, function(d){return d.minute;})
        .attr("d", goalArea)
        .style("fill", team.color);

      renderMinuteHighlight(
        playerG,
        options.goalWidth/3*2,
        -options.goalWidth/3,
        timeScale(0),
        options.chartHeight,
        data.timeSeries[key], player.titleize()
      );
    }

    function renderMinuteHighlight(containerG, minuteWidth, startX, startY, chartHeight, timeSeries, name){
      var minuteG = containerG.append("g")
        .attr("transform", "translate("+(startX)+","+(startY)+")")

      var tickRect = minuteG.append("rect")
        .classed("tick", true)
        .attr("width", minuteWidth)
        .attr("height", 2)
        .style("fill", "#444")
        .style("opacity", 0)

      var baitRect = minuteG.append("rect")
        .classed("bait", true)
        .attr("width", minuteWidth)
        .attr("height", chartHeight-startY)
        .style("opacity", 0)
        .style("fill", "#777")
        .on("mouseover", function(d){
          baitRect.transition()
            .style("opacity", 0.1)
          tickRect.transition()
            .style("opacity", 0.5)
          minuteMouseOver.call(this, d);
        })
        .on("mousemove", minuteMouseOver)
        .on("mouseout", function(d){
          baitRect.transition()
            .style("opacity", 0)
          tickRect.transition()
            .style("opacity", 0);
          myTip.hide();
        });

      var firstMin = timeSeries.points[0].minute;

      function minuteMouseOver(d){
        timeScale.range([0, chartHeight]);

        var mouse = d3.mouse(this);
        var realMinute = Math.floor(timeScale.invert(startY+mouse[1]));
        tickRect.attr("y", timeScale(realMinute)-startY);

        var $tmp = $("<span>");
        $("<b>").text(name).appendTo($tmp);
        $("<span>").text(" "+realMinuteToGameMinuteString(realMinute)).appendTo($tmp);
        $("<br>").appendTo($tmp);
        $("<span>").text("tweets/min: "+numFormat(timeSeries.points[realMinute-(firstMin)].count)).appendTo($tmp);

        myTip.show($tmp[0].outerHTML, d3.event);
      }

      return baitRect;
    }

    function updateScale(mode){
      var allTweetLayers = gameG.selectAll("g.game").selectAll(".tweet-layer");

      Object.keys(rounds).forEach(function(roundKey){
        var round = rounds[roundKey];
        var options = roundParams[roundKey].options;

        timeScale.range([0, options.chartHeight]);
        countScale.range([0, options.tweetWidth]);

        round.pairs.forEach(function(pair){
          var dateKey = pair.game1Date;
          var key1 = "tweet-"+pair.team1+"-"+dateKey;
          var key2 = "tweet-"+pair.team2+"-"+dateKey;

          if(mode=="absolute"){
            countScale.domain([0, data.maxTPM]);
          }
          else if(mode=="round"){
            countScale.domain([0, round.maxTPM]);
          }

          if(mode=="game"){
            var max = Math.max(
              data.timeSeries[pair.team1+delimiter+dateKey].extent[1],
              data.timeSeries[pair.team2+delimiter+dateKey].extent[1]
            );
            countScale.domain([0, max]);
          }

          if(mode=="normalized"){
            countScale.domain([0, data.timeSeries[pair.team1+delimiter+dateKey].extent[1]]);
          }
          allTweetLayers.selectAll("path#"+key1)
            .transition()
              .attr("d", negArea);
          if(mode=="normalized"){
            countScale.domain([0, data.timeSeries[pair.team2+delimiter+dateKey].extent[1]]);
          }
          allTweetLayers.selectAll("path#"+key2)
            .transition()
              .attr("d", posArea);

          if(pair.game2Date){
            dateKey = pair.game2Date;
            key1 = "tweet-"+pair.team1+"-"+dateKey;
            key2 = "tweet-"+pair.team2+"-"+dateKey;

            if(mode=="game"){
              var max = Math.max(
                data.timeSeries[pair.team1+delimiter+dateKey].extent[1],
                data.timeSeries[pair.team2+delimiter+dateKey].extent[1]
              );
              countScale.domain([0, max]);
            }

            if(mode=="normalized"){
              countScale.domain([0, data.timeSeries[pair.team2+delimiter+dateKey].extent[1]]);
            }
            allTweetLayers.selectAll("path#"+key2)
              .transition()
                .attr("d", negArea);
            if(mode=="normalized"){
              countScale.domain([0, data.timeSeries[pair.team1+delimiter+dateKey].extent[1]]);
            }
            allTweetLayers.selectAll("path#"+key1)
              .transition()
                .attr("d", posArea);
          }
        });
      });
    }

    function highlightTeam(teamKey){
      if(teamKey && !state.teamSelected){
        logoG.selectAll("image.logo")
          .transition()
          .style("opacity", function(d){
            var dThis = d3.select(this);
            if(dThis.classed(teamKey)){
              return 1;
            }
            return 0.15;
          });

        gameG.selectAll("g.game")
          .transition()
          .style("opacity", 0.2);

        var allTeamGames = gameG.selectAll("g.game."+teamKey);

        allTeamGames.transition()
            .style("opacity", 1);

        allTeamGames.selectAll("text.team-label")
          .transition()
          .style("opacity", function(d){
            var dThis = d3.select(this);
            if(dThis.classed(teamKey)){
              return 1;
            }
            return 0.15;
          });

        allTeamGames.selectAll(".tweet-layer").selectAll("path.right-tweet, path.left-tweet, path.event-link")
          .transition()
          .style("opacity", function(d){
            var dThis = d3.select(this);
            if(dThis.classed(teamKey)){
              return 1;
            }
            return 0.15;
          });

        allTeamGames.selectAll(".event-layer").selectAll("g.event")
          .transition()
          .style("opacity", function(d){
            var dThis = d3.select(this);
            if(dThis.classed(teamKey)){
              return 1;
            }
            return 0.3;
          });

        allTeamGames.selectAll(".event-label-layer").selectAll("g.event-label")
          .transition()
          .style("opacity", function(d){
            var dThis = d3.select(this);
            if(dThis.classed(teamKey)){
              return 1;
            }
            return 0.3;
          });

        allTeamGames.selectAll(".goal-layer").selectAll("g.player-stats")
          .transition()
          .style("opacity", function(d){
            var dThis = d3.select(this);
            if(dThis.classed(teamKey)){
              return 1;
            }
            return 0.15;
          });

        connectionG.selectAll("path.connection")
          .transition()
          .style("opacity", function(d){
            var dThis = d3.select(this);
            if(dThis.classed(teamKey)){
              return 1;
            }
            return 0.2;
          });

        state.teamSelected = true;
      }
      else{
        clearHighlight();
        state.teamSelected = false;
      }
    }

    function clearHighlight(){
      var allGames = gameG.selectAll("g.game");

      logoG.selectAll("image.logo")
        .style("opacity", 1);

      allGames.transition()
        .style("opacity", 1);
      allGames.selectAll("text.team-label")
        .transition()
        .style("opacity", 1);
      allGames.selectAll(".tweet-layer").selectAll("path.right-tweet, path.left-tweet, path.event-link")
        .transition()
        .style("opacity", 1);
      allGames.selectAll(".event-layer").selectAll("g.event")
        .transition()
        .style("opacity", 1);
      allGames.selectAll(".event-label-layer").selectAll("g.event-label")
        .transition()
        .style("opacity", 1);
      allGames.selectAll(".goal-layer").selectAll("g.player-stats")
        .transition()
        .style("opacity", 1);
      connectionG.selectAll("path.connection")
        .transition()
        .style("opacity", 1);
    }

    function gameMinuteToRealMinute(gameMinute){
      if(gameMinute >= 46){
        return gameMinute + 15;
      }
      else return gameMinute;
    }

    function realMinuteToGameMinuteString(minute){
      if(minute<0) return minute+"'";
      if(minute>105) return "90' +"+(minute-105)+"'";
      if(minute>=60) return (minute-15)+"'";
      if(minute>45) return "45' +"+(minute-45)+"'";
      else return minute+"'";
    }

    function getGameMinute(minute){
      if(minute<0) return minute;
      if(minute>110) return minute-1000;
      if(minute>=60) return minute-15;
      if(minute>50) return minute-1000;
      else return minute;
    }

    return {
      init: init,
      loadCombinedData: loadCombinedData,
      loadData: loadData,
      visualize: visualize
    };
  }());

  // Run!
  engine.init("chart");

  // engine.loadCombinedData("data/combined_data.json");

  engine.loadData(
    "data/ucl_data.csv",
    "data/team_data.csv",
    "data/game_data.json"
  );

  // Initialize Twitter widget
  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

}());
