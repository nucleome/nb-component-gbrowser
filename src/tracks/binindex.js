import B from "../data/binindex"
import toolsAddChrPrefix from "../tools/addChrPrefix"
import regionsText from "../tools/regionsText"
import coord from "../data/coords"
import datgui from "../datgui"

export default function(){
  var server = ""
  var dbname = "bigbed"
  var id = "gene"
  var y = 20
  var x = 0
  var width
  var gap = 10
  var coords
  var canvas
  var regions
  var modal
  var mask
  var scope 
  var dispatch
  var genome
  var _dispatch = d3.dispatch("clearBrush")
  var state
  var callback
  var svg
  var inCtrl = false
  var inBrush = false
  var render
  var canvasHeight = 130 //TODO
  var omero
  var bg
  var chart = function(selection){ //selection and data ???
    selection
      .on("mouseover", function () {
        inCtrl = true;
      })
      .on("mouseout", function () {
        inCtrl = false;
      })
    var d = selection.datum()
    //var id = "gene" //TO FIX;
    var lserver = d.server || server || state.server || scope.server || "";
    var ctx = canvas.node().getContext("2d")
    omero = d.omero || "";
    ctx.fillStyle = "#29468e"
    ctx.fillText("LOADING...",20,10)
    coords = coord().width(width).gap(gap).regions(regions).init();
    render = B().coord(coords)
        .regions(regions)
        .width(width)
        .URI(lserver  + "/" + d.prefix)
        .id(d.id)
        .y(y)
        .color(state.color || "#00F").mode(state.mode || "full")
        .omero(omero)
        .bg(bg)
        .callback(function(_){
          canvasHeight = render.canvasHeight()
          _addBrush()
          callback({"code":"height","data":{"canvasHeight":canvasHeight, "labels":_}})
        })
    canvas.call(render)
    //canvasHeight = render.canvasHeight();
    //console.log("canvas Height",canvasHeight)
    //selection.style("height",canvasHeight)

    _addBrush();
  }
  var _addBrush = function(){
    svg = render.svg()
    //svg.attr("height",canvasHeight)
    var extent,r;
    var brush = d3.brushX()//.extent([0,0],[ coord.range(0)[1],_barHeight]); //
    .on("start",function(){
      svg.selectAll(".selection").style("display","")
      svg.selectAll(".resp").style("display","none")
    })
    .on("brush", function(){
      inBrush = true;
      extent = d3.event.selection;
      r = coords.invert(extent)
      dispatch.call("brush",this,r)
    })
    .on("end", function(){
      inBrush = false;
    })

    var brushArea = svg.append("g")
    .classed("scopebrush",true)
    .call(brush)
    .selectAll(".selection")
    .on("contextmenu",function(d){
      d3.event.preventDefault();
      dispatch.call("update",this,r)
    })

    _dispatch.on("clearBrush",function(){
    })
    var axisToggle = false;
    svg.on("contextmenu", function(e) {
      d3.event.preventDefault();
      if (axisToggle) {
        axisToggle = false
        svg.selectAll(".axis").remove()
      } else {
        axisToggle = true;
        var mousePosition = d3.mouse(svg.node())
        var i = coords.invertHost([mousePosition[0], mousePosition[0] + 1])
        var r = []
        i.forEach(function(i0){
          r.push(regions[i])
        })
        console.log(mousePosition, r)
        svg.selectAll(".axis").remove()
        var arr = [];
        r.forEach(function(d){
          arr.push({"i":i[0],"region":d,"render":coords(d)[0]})
        })
        var axis = svg.selectAll(".axis").data(arr)
          .enter()
          .append("rect")
          .classed("axis", true)
          .attr("x", function(d) {
            return d.render.x
          })
          .attr("y", 0)
          .attr("height", canvasHeight)
          .attr("width", function(d) {
            return d.render.l
          })
          .attr("fill", "#000")
          .attr("opacity", 0.2)


          var dragged = function(d) {
            d.x += d3.event.dx
            d3.select(this).attr("x", function(d) {
              return d.x
            })
          }
          var dragstarted = function(d) {
            d.x = d.render.x
          }
          var dragended = function(d) {
            console.log(d.x,d.render.x, d.region) //TODO Add I and change i.....
            d3.select(this).attr("x", function(d) {
              return d.render.x
            })
            var scale = d3.scaleLinear().domain([d.region.start,d.region.end]).range([d.render.x,d.render.x+d.render.l])
            console.log(scale.invert(d.x),scale.invert(d.x+d.render.l))
            regions[d.i].start = Math.round(scale.invert(d.x))
            regions[d.i].end = Math.round(scale.invert(d.x + d.render.l))
            dispatch.call("move",this,regions)
        }
        axis.call(
          d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
        )

      }
    })

  }
  /* track interface */
  chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; }
  chart.modal = function(_) { return arguments.length ? (modal= _, chart) : modal; }
  chart.mask = function(_) { return arguments.length ? (mask= _, chart) : mask; }
  chart.scope = function(_) { return arguments.length ? (scope= _, chart) : scope; }
  chart.dispatch = function(_) { return arguments.length ? (dispatch= _, chart) : dispatch; }
  chart.state = function(_) { return arguments.length ? (state= _, chart) : state; }
  chart.init = function(){return chart}
  chart.callback = function(_) { return arguments.length ? (callback= _, chart) : callback; }

  chart.brush = function(d) { //listen to brush event.
    if (!inBrush) {
      svg.selectAll(".selection").style("display","none");
      svg.selectAll(".resp").style("display","")
      var r = coords(d)
      //var fill = d.color || d[0].color || "#000"
      var fill = "#000"
      if (d.length > 0 && (typeof d[0].color != "undefined")) {
        fill = d[0].color
      }
      if (typeof d.color != "undefined") {
        fill = d.color
      }
      var resp = svg.selectAll(".resp")
        .data(r)
      resp.exit().remove();
      resp = resp.enter()
        .append("rect")
        .classed("resp",true)
        .merge(resp)
        .attr("x",function(d){return d.x})
        .attr("y",0)
        .attr("height",canvasHeight)
        .attr("width",function(d){return d.l})
        .attr("opacity",0.2)
        .attr("fill",function(d){
          return d.color || fill
        })
        .on("contextmenu",function(){
          d3.event.preventDefault();
          dispatch.call("update",this,d)
        })

    } else {
      svg.selectAll(".resp").remove();
    }
  }

  /*************/
  chart.config = function() {
    modal.selectAll("div").remove();
    var cfg = modal.append("div")
    var datIO = datgui().closable(false);
    var opts = {
      "color": state["color"] || "#29724c",
      "mode" : ["full"]
    }
    cfg.selectAll(".datgui").remove();
    cfg.selectAll(".datgui")
      .data([{
        "options": opts,
        "config": state
      }])
      .enter()
      .append("div")
      .classed("datgui", true)
      .call(datIO)
    cfg.selectAll(".submit").remove();
    cfg.append("input")
      .attr("type", "button")
      .classed("submit", true)
      .attr("value", "submit")
      .on("click", function (d0) {
        render.color(state.color)
        render.mode(state.mode || "full")
        canvas.call(render)
        _addBrush()
        mask.style("display", "none")
        modal.style("display", "none");
        callback({"code":"state","data":state})
      })
  }
  chart.mode = function(_) {
    var o = render.mode();
    if (o!=_) {
      render.mode(_);
      canvas.call(render);
      state.mode = _;
      callback({"code":"state","data":state})
      _addBrush();
    }

  }
  chart.server = function(_) { return arguments.length ? (server= _, chart) : server; }
  chart.dbname = function(_) { return arguments.length ? (dbname= _, chart) : dbname; }
  chart.id = function(_) { return arguments.length ? (id= _, chart) : id; }
  chart.x = function(_) { return arguments.length ? (x= _, chart) : x; }
  chart.y = function(_) { return arguments.length ? (y= _, chart) : y; }
  chart.width = function(_) { return arguments.length ? (width= _, chart) : width; }
  chart.gap = function(_) { return arguments.length ? (gap= _, chart) : gap; }
  chart.canvas = function(_) { return arguments.length ? (canvas= _, chart) : canvas; }
  chart.omero = function(_) { return arguments.length ? (omero= _, chart) : omero; }
  chart.bg=function(_) {return arguments.length ? (bg= _, chart) : bg; }
  return chart
}
