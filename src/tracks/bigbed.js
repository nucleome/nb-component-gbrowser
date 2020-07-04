import B from "../data/bigbed"
import strToColor from "../tools/strToColor"
import coord from "../data/coords"
import datgui from "../datgui"
import font from "../shape/font"
import addDragTitle from "../tools/addDragTitle";
import * as d3 from "d3"
var _font = font()


export default function () {
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
  var _dispatch = d3.dispatch("clearBrush")
  var state
  var callback
  var svg
  var inCtrl = false
  var inBrush = false
  var render
  var canvasHeight = 130
  var d
  var loadDiv
  var bg = false
  var chart = function (selection) { //selection and data ???

    selection
      .on("mouseover", function () {
        inCtrl = true;
      })
      .on("mouseout", function () {
        inCtrl = false;
      })

    d = selection.datum()
    //var id = "gene" //TO FIX;
    var lserver = d.server || server || state.server || scope.server || "";
    var ctx = canvas.node().getContext("2d")
    ctx.fillStyle = "#29468e"
    ctx.fillText("LOADING...", 20, 10)
    coords = coord().width(width).gap(gap).regions(regions).init();
    render = B.canvas()
      .coord(coords)
      .regions(regions)
      .width(width)
      .URI(lserver + "/" + d.prefix + ".bigbed")
      .id(d.id)
      .longLabel(d.longLabel || d.id || "")
      .y(y)
      .bg(bg)
      .color(state.color || strToColor(d.id) || "#00F").mode(state.mode || "full")
      .callback(function (_) {
        loadDiv.style("display", "none")
        canvasHeight = render.canvasHeight()
        _addBrush()
        callback({
          "code": "height",
          "data": {
            "canvasHeight": canvasHeight,
            "labels": _.firstNames,
            "beds": _.beds
          }
        })
      })
      .dispatch(dispatch)
    d3.select(canvas.node().parentNode).selectAll(".loader").remove()
    loadDiv = d3.select(canvas.node().parentNode)
      .append("div")
      .classed("loader", true)
      .style("position", "absolute") //TODO FOR Width Mask
      .style("left", (width / 2 - 15) + "px")
      .style("top", "5px")
      .style("width", "20px")
      .style("height", "20px")
    canvas.call(render)
    if (d.metaLink) {
      (function () {
        var _name = d.longLabel || d.id;
        var _svg = render.svg();
        var _l = _name.length
        var _x = width / 2 - _font.width * _l / 2
        _svg.append("rect")
          .attr("width", _l * _font.width)
          .attr("height", _font.height)
          .attr("x", _x)
          .attr("y", 0)
          .attr("fill", "#000")
          .attr("opacity", 0.0)
          .on("mouseover", function () {
            d3.select(this).attr("opacity", 0.2)
          })
          .on("mouseout", function () {
            d3.select(this).attr("opacity", 0.0)
          })
          .on("click", function () {
            window.open(d.metaLink, "_blank")
          })
      })()
    }
  }
  var _addBrush = function () {
    svg = render.svg()
    //svg.attr("height",canvasHeight)
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
        r = coords.invert(extent)
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
        //console.log(d3.select(this).attr("width"))
        if (d3.select(this).attr("width") != null) {
          retv = true
        }
      })
      return retv
    }
  }
  /* track interface */
  chart.regions = function (_) {
    return arguments.length ? (regions = _, chart) : regions;
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
  chart.init = function () {
    return chart
  }
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  }

  chart.brush = function (d) { //listen to brush event.
    if (!svg) {
      return
    }
    if (!inBrush) {
      svg.selectAll(".selection").style("display", "none");
      svg.selectAll(".resp").style("display", "")
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
        .attr("fill", function (d) {
          return d.color || fill
        })
        .attr("opacity", 0.2)
        .on("contextmenu", function () {
          d3.event.preventDefault();
          dispatch.call("update", this, d)
        })

    } else {
      //clear response;
      svg.selectAll(".resp").remove();
      //wasCtrl = true;
    }
  }

  /*************/
  chart.config = function () {
    modal.selectAll("div").remove();
    var cfg = modal.append("div")
    var datIO = datgui().closable(false);
    var _state = JSON.parse(JSON.stringify(state))
    var opts = {
      "alias": _state["alias"] || "",
      "color": _state["color"] || strToColor(d.id),
      "mode": ["full", "dense"]
    }
    cfg.selectAll(".title").remove();


    /* Title Drag Section */
    /*
    function handleDragStart(e) {
      this.style.opacity = '0.4'; 
      e.dataTransfer.setData("track", JSON.stringify({
        "server":d.server,
        "prefix":d.prefix,
        "id":d.id,
        "longLabel":d.longLabel || d.id
      }))
    }

    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }

      e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

      return false;
    }

    function handleDragEnter(e) {
      // this / e.target is the current hover target.
      this.classList.add('over');
    }

    function handleDragLeave(e) {
      this.classList.remove('over'); // this / e.target is previous target element.
    }

    function handleDrop(e) {
      // this / e.target is current target element.

      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      var r = e.dataTransfer.getData("track")
      console.log(e.target, r)
      return false;
    }

    function handleDragEnd(e) {
      this.style.opacity = '1.0'; // this / e.target is the source node.
    }

    var cold3 = cfg.append("div").classed("title", true).style("height","30px")
    
    var col = cold3.node()
    var _text = cold3.append("span").style("user-select","all").style("cursor","grab").text(d.longLabel || d.id)
    col.addEventListener('dragstart', handleDragStart,
      false);
    col.addEventListener('dragenter', handleDragEnter,
      false);
    col.addEventListener('dragover', handleDragOver,
      false);
    col.addEventListener('dragleave', handleDragLeave,
      false);
    col.addEventListener('drop', handleDrop, false);
    col.addEventListener('dragend', handleDragEnd,
      false);
    /* End of Title Drag Section　*/
    addDragTitle(d,cfg)


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
      render.color(state.color)
      render.mode(state.mode || "full")
      canvas.call(render)
      _addBrush()
      mask.style("display", "none")
      modal.style("display", "none");
      callback({
        "code": "state",
        "data": state
      })
    }
    cfg.selectAll(".default").remove()
    cfg.append("input")
      .attr("type", "button")
      .classed("default", true)
      .attr("value", "default")
      .on("click", function (d0) {
        _state.color = strToColor(d.id)
        _renderContent()
      })
    cfg.selectAll(".category").remove()
    cfg.append("input")
      .attr("type", "button")
      .classed("category", true)
      .attr("value", "color by name")
      .on("click", function (d0) {
        _state.color = "#ffffff"
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
  chart.mode = function (_) {
    var o = render.mode();
    if (o != _) {
      render.mode(_);
      canvas.call(render);
      state.mode = _;
      callback({
        "code": "state",
        "data": state
      })
      _addBrush();
    }

  }
  chart.server = function (_) {
    return arguments.length ? (server = _, chart) : server;
  }
  chart.dbname = function (_) {
    return arguments.length ? (dbname = _, chart) : dbname;
  }
  chart.id = function (_) {
    return arguments.length ? (id = _, chart) : id;
  }
  chart.x = function (_) {
    return arguments.length ? (x = _, chart) : x;
  }
  chart.y = function (_) {
    return arguments.length ? (y = _, chart) : y;
  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  }
  chart.gap = function (_) {
    return arguments.length ? (gap = _, chart) : gap;
  }
  chart.canvas = function (_) {
    return arguments.length ? (canvas = _, chart) : canvas;
  }
  chart.bg = function (_) {
    return arguments.length ? (bg = _, chart) : bg;
  }

  return chart
}
