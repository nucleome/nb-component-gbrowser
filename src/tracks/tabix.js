/*Template for New Track TYPE
 */
import font from "../shape/font"
import T from "../data/tabix"
var _font = font()
import coords from "../data/coords"

import datgui from "../datgui"
function getMapSize(x) {
    var len = 0;
    for (var count in x) {
            len++;
    }

    return len;
}
function renderLabel(ctx, label, width) {
    var l = label.length
    var x = width / 2 - _font.width * l / 2
    ctx.font = _font.font
    ctx.fillStyle = "#000"
    ctx.fillText(label, x, _font.height) //TODO
}




export default function () {
  var gap = 20
  var width
  var height
  var modal
  var mask
  var scope
  var dispatch
  var state
  var regions
  var canvas
  var bg 
  var coord
  var svg 
  var canvasHeight
  var inBrush = false
  var inCtrl = false
  var state
  var render 
  var glyph
  
  //Callback to tracksRender Processing Callback Code
  var callback = function(_){
    console.log("TODO callback ",_)
  }
 var _addBrush = function () {
    var extent, r;
    var brush = d3.brushX() //.extent([0,0],[ coord.range(0)[1],_barHeight]); //
      .on("start", function () {
        inBrush = true
        dispatch.call("brush", this, [])
        svg.selectAll(".selection").style("display", "")
        svg.selectAll(".resp").style("display", "none")
      })
      .on("brush", function () {
        inCtrl = true;
        extent = d3.event.selection;
        r = coord.invert(extent)
        dispatch.call("brush", this, r)
      })
      .on("end", function () {
        inBrush = false;
        inCtrl = false;
        if (_checkBrush()) {
          $(svg.node()).find(".tmap").prependTo(svg.node());
        } else {
          $(svg.node()).find(".scopebrush").prependTo(svg.node());
        }
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
 
  var chart = function (el) {

    var d = el.datum()

    glyph = d.glyph || "bed3"
    if (typeof state == "undefined" || (getMapSize(state) == 0 && (d.glyph in glyphStates))) {
        state = JSON.parse(JSON.stringify(glyphStates[d.glyph || "bed3"]))
    } else {
        //console.log("not init state",state,getMapSize(state))
    }
    var server = d.server || state.server || scope.server || "";
    coord = coords().width(width).gap(gap).regions(regions).init();
    svg = el.append("svg")
          .classed("respSvg", true)
          .attr("width", width)
          .attr("height", 100) 
    render = T()
            .URI(server + "/" + d.prefix)
            .id(d.id || d.shortLabel)
            .regions(regions)
            .coord(coord)
            .glyph(d.glyph || "bed3")
            .parser(d.parser || "bed3")
            .state(state)
            .callback(function(d0){
                canvasHeight = d0.data.canvasHeight || 100
                svg.attr("height",canvasHeight)
                _addBrush()
                var l = d.longLabel || d.shortLabel || d.id || "UNKNOWN"
                renderLabel(canvas.node().getContext("2d"),l, width)
                callback(d0)
            })
            .bg(bg)
    canvas.call(render)

  }
  /* brush in hubs.js ~ line 1247 */
  chart.brush = function (d) { //TODO interface for respose hubs brush.
    if (!svg) {
      return
    }
    if (!inBrush) {
      svg.selectAll(".selection").style("display", "none");
      svg.selectAll(".resp").style("display", "")
      var r = coord(d)
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
        .classed("resp", true)
        .merge(resp)
        .attr("x", function (d) {
          return d.x
        })
        .attr("y", 0)
        .attr("height", canvasHeight)
        .attr("width", function (d) {
          return d.l
        })
        .attr("fill",function(d){
          return d.color || fill}
          )
        .attr("opacity", 0.1)
        .on("contextmenu", function () {
          d3.event.preventDefault();
          dispatch.call("update", this, d)
        })

    } else {
      svg.selectAll(".resp").remove();
    }

  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  }
  chart.height = function (_) {
    return arguments.length ? (height = _, chart) : height;
  }
  chart.gap = function (_) {
    return arguments.length ? (gap = _, chart) : gap;
  }
  chart.modal = function (_) {
    return arguments.length ? (modal = _, chart) : modal;
  }
  chart.mask = function (_) {
    return arguments.length ? (mask = _, chart) : mask;
  }
  chart.scope = function (_) {
    return arguments.length ? (scope = _, chart) : scope;
  }
  chart.dispatch = function (_) {
    return arguments.length ? (dispatch = _, chart) : dispatch;
  }
  chart.state = function (_) {
    return arguments.length ? (state = _, chart) : state;
  }
  chart.callback = function(_) { return arguments.length ? (callback= _, chart) : callback; }
  chart.regions = function(_) { return arguments.length ? (regions= _, chart) : regions; }
  chart.canvas = function(_) { return arguments.length ? (canvas= _, chart) : canvas; }
  chart.bg = function(_) { return arguments.length ? (bg= _, chart) : bg; }

  chart.init = function(_) {
    return chart
    //TODO
  }

  /* TODO: MODULIZED CONFIG WRITING
   * TO REVISE CONFIG BASED ON THE TRACK
   * Config TO Glyph
   */
  chart.config = function() {
    modal.selectAll("div").remove();
    var cfg = modal.append("div")
    var datIO = datgui().closable(false);
    var opts = JSON.parse(JSON.stringify(state))
    var _state = JSON.parse(JSON.stringify(state))
    cfg.selectAll(".datgui").remove();
    cfg.selectAll(".datgui")
      .data([{
        "options": opts,
        "config": _state
      }])
      .enter()
      .append("div")
      .classed("datgui", true)
      .call(datIO)
    var _renderContent = function () {
      state = JSON.parse(JSON.stringify(_state))
      render.state(state)
      canvas.call(render)
      _addBrush()
      mask.style("display", "none")
      modal.style("display", "none");
      callback({
        "code": "state",
        "data": state
      })
    }
    cfg.selectAll(".default").remove();
    cfg.append("input")
      .attr("type", "button")
      .classed("default", true)
      .attr("value", "default")
      .on("click", function (d0) {
        _state = JSON.parse(JSON.stringify(glyphStates[glyph]))
        _renderContent()
      })
    cfg.selectAll(".submit").remove();
    cfg.append("input")
      .attr("type", "button")
      .classed("submit", true)
      .attr("value", "submit")
      .on("click", function (d0) {
        _renderContent()
      })
    cfg.selectAll(".cancel").remove();
    cfg.append("input")
      .attr("type", "button")
      .classed("cancel", true)
      .attr("value", "cancel")
      .on("click", function (d0) {
        mask.style("display", "none")
        modal.style("display", "none");
      })

  }
  return chart
}


var glyphStates = {
    "ORM": {
        "higher":"#F00",
        "middle":"#F70",
        "lower":"#FF0",
        "signalsOnly":true,
    },
    "bed3": {
        "color":"#0FF"
    }
}
