import trackManager from "./trackManager"
import bgPlot from "./bgPlot"
/*
   binindex format
   render omero json or image thumbnail
 */

import * as d3 from "d3"

import sandInits from "../sandInits"
var colormap = {
  "image": "rgba(100,200,100,0.2)",
  "well": "rgba(200,200,100,0.2)",
  "project": "rgba(100,200,200,0.2)",
  "dataset": "rgba(200,100,200,0.2)",
  "screen": "rgba(100,100,200,0.2)"
}
export default function () {
  var coord
  var regions
  var omero
  var el
  var trackM
  var ctx
  var width
  var figWidth = 96 //TODO
  var figHeight = 96
  var height = 12
  var laneHeight = height + figHeight
  var gap = 3
  var canvasHeight;
  var color = "#444"
  var mode = "full"
  var id
  var y = 10
  var x = 0
  var callback
  var svg
  var localSvg //on Top??
  var imageHeight = 100
  var bg = false
  var URI //  URI = /<genome>/<dbname>  + /<trackid>
  var _render_ = function (results) {
    ctx.fillStyle = "grey"
    var bed2track = [];
    var beds = [];
    var maxTrack = -1;
    var num = 0;
    results.forEach(function (d) {
      var lines = d.split("\n")
      lines.forEach(function (d) {
        var t = d.split("\t")
        if (t.length < 3) return //empty line
        //TODO Parse More Infomation , type and idx
        var a = {
          "chr": t[0],
          "start": parseInt(t[1]),
          "end": parseInt(t[2]),
          "name": t[3],
          "type": t[4] || "unknown",
          "idx": t[5] || null,
          "color": t[6] || undefined,
        }
        if (a.color == 0) {
          a.color = undefined
        }
        beds.push(a)
      })
      beds.sort(function (a, b) {
        return a.start > b.start //TODO sort by coord
      })

      beds.forEach(function (a, i) {
        if (a.name && a.name.length > 1) {
          trackM.labelSize(a.name.length * 4 + 10)
        } else {
          trackM.labelSize(0)
        }
        var yi = trackM.AssignTrack(a)
        bed2track.push(yi)
        if (maxTrack < yi.i) maxTrack = yi.i;
      })
      if (mode == "full") {
        canvasHeight = 20 + (maxTrack + 1) * (laneHeight + gap)
        console.log("maxTrack", maxTrack, "canvasHeight", canvasHeight)
        el.attr("height", canvasHeight)
        ctx = el.node().getContext('2d')
        ctx.fillStyle = "#FFF"
        ctx.fillRect(0, 0, width, canvasHeight)
        if (bg) {
           bgPlot(el.node())
        }
        svg.attr("height", canvasHeight)
        localSvg.attr("height", canvasHeight)
        localSvg.selectAll(".imageRect").remove()
        d3.select(el.node().parentNode.parentNode).style("height", canvasHeight + "px")
        d3.select(el.node().parentNode).selectAll("svg").attr("height", canvasHeight)

        beds.forEach(function (a, i) {
          var xs = coord(a)
          var yi = bed2track[i]
          xs.forEach(function (o, i) {
            var _width = o.l > 1 ? o.l : 1;
            ctx.translate(x + o.x, y + yi.i * (laneHeight + gap))
            ctx.fillStyle = colormap[a.type]
            ctx.fillRect(0, 0, figWidth, figHeight)
            var rg = localSvg.append("g").attr("transform", "translate(" + (x + o.x) + "," + (y + yi.i * (laneHeight + gap)) + ")")
            .classed("imageRect", true)
            .style("z-index",100)
            var rect = rg.append("rect")
              .attr("x",-2)
              .attr("y",-2)
              .attr("width",figWidth + 4)
              .attr("height",figHeight + 4)
              .style("opacity",0.1)
              .style("stroke","#334499")
              .style("stroke-opacity",0.9)
              .style("stroke-width",0)
              .style("fill","#330011")
              .on("mouseover",function(){
                d3.select(this).style("stroke-width",5)
              })
              .on("mouseout",function(){
                d3.select(this).style("stroke-width",0)
              })
            if (a.type == "image") {
              var img = new Image();
              var x0 = x + o.x
              var y0 = y + yi.i * (laneHeight + gap)
              img.onload = function () {
                ctx.drawImage(img, x0, y0);
              }
              img.src = omero + "/webgateway/render_thumbnail/" + a.idx + "/"
              rect.on("click",function(){
                  window.open(omero+"/webclient/img_detail/" + a.idx + "/","_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1294,height=800")
                })
            } else if (a.type=="project") {
              rg.append("text").attr("x",10).attr("y",20).text(a.type)
              rg.append("text").attr("x",15).attr("y",35).text(a.idx)
              rect.on("click",function(){
                  window.open(omero+"/webgateway/proj/" + a.idx + "/detail","_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=608,height=500")
              })
            } else if (a.type=="well") {
              rg.append("text").attr("x",10).attr("y",20).text(a.type)
              rg.append("text").attr("x",15).attr("y",35).text(a.idx)
              rect.on("click",function(){
                  window.open(omero+"/webgateway/well/" + a.idx + "/children","_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=608,height=500")
              })
            } else if (a.type=="dataset") {
              rg.append("text").attr("x",10).attr("y",20).text(a.type)
              rg.append("text").attr("x",15).attr("y",35).text(a.idx)
              rect.on("click",function(){
                  window.open(omero+"/webgateway/dataset/" + a.idx + "/detail","_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=608,height=500")
              })
            } else if (a.type=="screen") {
              rg.append("text").attr("x",10).attr("y",20).text(a.type)
              rg.append("text").attr("x",15).attr("y",35).text(a.idx)
              rect.on("click",function(){
                  //TODO list screen detail
                  //window.open(omero+"/webgateway/screen/" + a.idx + "/detail","_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=608,height=500")
              })
            } else {
              rg.append("text").attr("x",10).attr("y",20).text(a.type)
              rg.append("text").attr("x",15).attr("y",35).text(a.idx)
            }
            ctx.fillStyle = a.color || color
            if (o.f) {
              ctx.fillRect(0, -height, _width, (height - 7))
              if (a.name && a.name.length > 1) {
                ctx.fillStyle = "black"
                ctx.font = "8px Arial"
                ctx.fillText(a.name, -4 * a.name.length - 10, -2 - (height - 7))
              }
            } else {
              ctx.fillRect(0, -height, _width, (height - 7))
              if (o.o_s) {
                ctx.fillStyle = "red"
                ctx.fillRect(0, -height, 2, (height - 7))
              }
              if (o.o_e) {
                ctx.fillStyle = "red"
                ctx.fillRect(o.l - 3, -height, 3, (height - 7))
              }
              ctx.fillStyle = color
              if (a.name && a.name.length > 1) {
                ctx.fillStyle = "black"
                ctx.font = "8px Arial"
                ctx.fillText(a.name, -4 * a.name.length - 10, -2 - (height - 7))
              }
            }
            ctx.translate(-x - o.x, -y - yi.i * (laneHeight + gap))
          })
        })
      }
    })
    callback()
  }
  var render = function () {
    var q = []
    regions.forEach(function (d) {
      q.push(
        d3.text(URI + "/" + id + "/get/" + d.chr + ":" + d.start + "-" + d.end,sandInits) 
        //d3.text(URI + "/" + id + "/get/" + d.chr + ":" + d.start + "-" + d.end) // cors * now 
      )
    })
    Promise.all(q).then(_render_)
  }
  var chart = function (selection) {
    trackM = trackManager().coord(coord).minSize(figWidth + 20)
    el = selection //canvas?
    el.selectAll(".respSvg").remove();
    svg = d3.select(el.node().parentNode).append("svg").classed("respSvg", true).attr("width", width).attr("height", 130) //TODO FIX 130 height;
    localSvg = d3.select(el.node().parentNode).append("svg").attr("width", width).attr("height", 130) //TODO FIX 130 height;
    ctx = el.node().getContext("2d")
    render();
  }
  chart.coord = function (_) {
    return arguments.length ? (coord = _, chart) : coord;
  }
  chart.regions = function (_) {
    return arguments.length ? (regions = _, chart) : regions;
  }
  chart.id = function (_) {
    return arguments.length ? (id = _, chart) : id;
  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  }
  chart.canvasHeight = function (_) {
    return arguments.length ? (canvasHeight = _, chart) : canvasHeight;
  }
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  }
  chart.color = function (_) {
    return arguments.length ? (color = _, chart) : color;
  }
  chart.mode = function (_) {
    return arguments.length ? (mode = _, chart) : mode;
  }
  chart.URI = function (_) {
    return arguments.length ? (URI = _, chart) : URI;
  }
  chart.x = function (_) {
    return arguments.length ? (x = _, chart) : x;
  }
  chart.y = function (_) {
    return arguments.length ? (y = _, chart) : y;
  }
  chart.svg = function (_) {
    return arguments.length ? (svg = _, chart) : svg;
  }
  chart.omero = function (_) {
    return arguments.length ? (omero = _, chart) : omero;
  }
  chart.bg=function(_) {return arguments.length ? (bg= _, chart) : bg; }

  return chart
}
