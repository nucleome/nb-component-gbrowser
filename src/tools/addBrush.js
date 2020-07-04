export default function (render,callback) {
  var svg = render.svg()
  var coords = render.coord()
  var dispatch = render.dispatch()
  var extent, r;
  var brush = d3.brushX() //.extent([0,0],[ coord.range(0)[1],_barHeight]); //
    .on("start", function () {
      callback(true)
      dispatch.call("brush",this,[])
      svg.selectAll(".selection").style("display", "")
      svg.selectAll(".resp").style("display", "none")
    })
    .on("brush", function () {
      extent = d3.event.selection;
      r = coords.invert(extent)
      dispatch.call("brush", this, r)
    })
    .on("end", function () {
      //make .tmap on top of brush */
      if (_checkBrush()) {
        $(svg.node()).find(".tmap").prependTo(svg.node());
      } else {
        $(svg.node()).find(".scopebrush").prependTo(svg.node());
      }
      callback(false)
    })

  var brushArea = svg.insert("g", ":first-child")
    .classed("scopebrush", true)
    .call(brush)
    .selectAll(".selection")
    .on("contextmenu", function (d) {
      d3.event.preventDefault();
      dispatch.call("update", this, r)
    })
  var _checkBrush = function () {
    var retv = false
    brushArea.each(function (d, i) {
      if (d3.select(this).attr("width") != null) {
        retv = true
      }
    })
    return retv
  }
}
