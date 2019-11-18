
  // ---------- t-SNE ----------
  var opt = {}
  opt.epsilon = 10; // epsilon is learning rate (10 = default)
  opt.perplexity = 5; // roughly how many neighbors each point influences (30 = default)
  opt.dim = 2; // dimensionality of the embedding (2 = default)

  var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
  var Y;

  // ---------- DATA ----------
  var sent = [];
  var sent_values = [];
  var sent_strings_1 = [];
  var sent_strings = [];


  // ---------- HANDLES ----------
  var scale = 2;

  // var wCanvas = window.innerWidth;
  // var hCanvas = window.innerHeight;

  var wCanvas = 1300;
  var hCanvas = 600;

  var wHalf = wCanvas / 2;
  var hHalf = hCanvas / 2;


  var random = Math.random(0,1);


  // ---------- UPDATE ----------

  function updateEmbedding() {
    var Y = tsne.getSolution();
    svg.selectAll('.sentences')
      .data(Y)
      .attr("transform", function(d, i) {
        return "translate(" +
          ((Y[i][0] * scale * ss + tx) + wHalf) + "," +
          ((Y[i][1] * scale * ss + ty) + hHalf) + ")";
      })
      }


  // ---------- DRAW WITH D3.js ----------

  var svg;

  function drawEmbedding() {

    $("#embed").empty();

    var div = d3.select("#embed");

    var Y = tsne.Y;

    svg = div.append("svg") // svg is global
      .attr("width", wCanvas)
      .attr("height", hCanvas);

    var g = svg.selectAll(".b")
      .data(sent_values)
      .enter().append("g")
      .attr("class", "sentences");

    //Draw the Circle
    g.append("circle")
      .attr("fill", "#3F574A")
      .attr("opacity", "1")
      .attr("r", 6);

    g.append("text")
      .data(sent_strings)
      .attr("text-anchor", "top")
      .attr("font-size", 14)
      .attr("fill", "333")
      .attr("opacity", "0.4")
      .text(function(d) {
        return d;
      })

      // SOON HOVER STATE
      // .on("mouseover", function(d) {
      //   if(d3.select(this).style("opacity") != 0){
      //       g.transition()
      //           .duration(200)
      //           .style("opacity", .8);
      //       g.html(d.datetime.substring(0,10) )
      //           .style("left", (d3.event.pageX + 5) + "px")
      //           .style("top", (d3.event.pageY - 24) + "px");
      //       }
      //   });



      ;

      var zoomListener = d3.behavior.zoom()
        .scaleExtent([0.1, 100])
        .center([0,0])
        .on("zoom", zoomHandler);
      zoomListener(svg);


  }

  // Zoom Variables are defined
  var tx=0, ty=0;
  var ss=1;
  function zoomHandler() {
    tx = d3.event.translate[0];
    ty = d3.event.translate[1];
    ss = d3.event.scale;
  }

  // calls the tsne.step to iterate
  function step() {
    for (var k = 0; k < 1; k++) {
      tsne.step(); // do a few steps
    }
    updateEmbedding();
  }


  //JQUERY GET JSON
  $(document).ready(function() {

    // TF-IDF Scores from JSON file & deactivate asynch
    $.ajax({
      async: false,
      url: "json/vector_colums.json",
      dataType: 'json',
      data: sent_values,
      success: function(json) {
        for (var i in json)
          sent.push(json[i]);
        for (var i in json)
          sent_values.push(Object.values(sent[i]));
      }
    });
    // Get Sentences as Strings
    $.ajax({
      async: false,
      url: "json/P1_Sentences.json",
      dataType: 'json',
      data: sent_strings,
      success: function(json) {
        for (var i in json)
          sent_strings_1.push(Object.values(json[i]));
        sent_strings = sent_strings_1[0];
      }
    });
    tsne.initDataRaw(sent_values); // t-SNE gets values here!!!
    drawEmbedding();
    setInterval(step, 0);
    //updateEmbedding(); // updateEmbedding (normaly in step function)

  });
