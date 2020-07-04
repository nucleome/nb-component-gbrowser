  　
  import symbolFlag from "./symbol/flag"
  /*Brush Snow Triangle /\ */
  export default function() {
      var edge = 500 // 直角边　edge length. scale.range() = scale.range() = [0,edge]
      var x0, y0, x1, y1, xf, yf, width, height
      var xi = 0,
          yi = 0
      var x = 0,
          y = 0; //x,y is the coord system start point?
      var theta = 0
      var status = {}
      var scale = d3.scaleLinear().range([0, 500]).domain([0, 500])
      var yscale = d3.scaleLinear().range([0, 500]).domain([500, 0]) //domain reverse.

      var G
      var listeners = d3.dispatch(brush, "start", "brush", "end", "click", "contextmenu", "activate", "deactivate", "brush.local")
      var flag = function(selection) {
          selection.each(function(d) {
              d3.select(this)
                  .attr("transform", function(d) {
                      return "translate(" + d.x + "," + d.y + ")"
                  })
              var path = d3.select(this).selectAll(".flag")
                  .data([d])
              path.enter().append("path").classed("flag", true).classed("selection", true)
                  .merge(path)
                  .attr("d", d3.symbol().type(symbolFlag).size(d.size))
                  .style("fill", "black")
                  .style("opacity", 0.2)
              /*
              .on("click",function(){
                listeners.call("click",this,status)
              })
              */
          })
      }
      var brush = function(selection) {
          G = selection.append("g").attr("transform", "translate(" + x + "," + y + ") rotate(" + theta / Math.PI * 180 + ")")
          var tri = G.append("path")
              .classed("brushContainer", true)
              .attr("d", d3.symbol().type(symbolFlag).size(edge))
              .style("fill", "white")
              .style("opacity", 0.0) //for debug

          tri.call(
              d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          )
          var g = G.append("g")
          var rect = g.append("rect").classed("brush", true).classed("selection", true).attr("opacity", 0.2)
          rect.call(d3.drag().on("drag", move).on("start", start)
              .on("end", end))
          rect.on("click", function(e) {
              listeners.call("click", this, status)
          })
          rect.on("contextmenu", function(e) {
              d3.event.preventDefault();
              listeners.call("contextmenu", this, status)
          })
          listeners.on("deactivate", function(d) {
              rect.attr("opacity", 0.0)
          })
          listeners.on("activate", function(d) {
              rect.attr("opacity", 0.2)
          })
          var fix = function(x, y) {
              if (x + y + width + height > edge) {
                  x = edge - width - height - y
              }
              var newx = Math.max(0, Math.min(edge - width - height, x))
              var newy = Math.max(0, Math.min(edge - height - width, y))
              return [newx, newy]
          }

          function invert(d) {
              var lx1 = scale.invert(d[0][0])
              var lx2 = scale.invert(d[1][0])
              var ly1 = yscale.invert(d[0][1])
              var ly2 = yscale.invert(d[1][1])
              return [
                  [Math.min(lx1, lx2), Math.min(ly1, ly2)],
                  [Math.max(lx1, lx2), Math.max(ly1, ly2)]
              ]
          }

          function start(d) {
              rect.attr("opacity", 0.2)
              d3.select(this).attr("stroke", "blue").attr("stroke-width", 2)
              xf = d3.event.x
              yf = d3.event.y
              listeners.call("start", this, [xf, yf]);
          }


          function move(d) {
              //TODO Here 
              // Init offset first 
              xi = d3.event.x + xi - xf
              yi = d3.event.y + yi - yf
              var r = fix(xi, yi)
              //
              xi = r[0]
              yi = r[1]
              g.attr("transform", "translate(" + r[0] + "," + r[1] + ")")
              listeners.call("brush", this, invert([
                  [r[0], r[1]],
                  [r[0] + width, r[1] + height]
              ]));
          }

          function end(d) {
              d3.select(this).attr("stroke-width", 0)
              listeners.call("end", this, [xi, yi]);
          }

          function rotate(d, theta) {
              return [Math.cos(theta) * d[0] + Math.sin(theta) * d[1], -Math.sin(theta) * d[0] + Math.cos(theta) * d[1]]
          }


          function dragstarted(d) {
              if (d3.event.defaultPrevented) return;
              x0 = d3.event.x
              y0 = d3.event.y
              listeners.call("start", this, [x0, y0]);
          }

          function dragged(d) {
              if (d3.event.defaultPrevented) return;
              x1 = Math.max(0, d3.event.x)
              y1 = Math.max(0, d3.event.y)
              if (x1 + y1 >= edge) {
                  x1 = Math.max(0, edge - y1)
                  y1 = Math.max(0, edge - x1)
              }
              if (x1 + y0 > edge) {
                  x1 = Math.max(0, edge - y0)
              }
              if (y1 + x0 > edge) {
                  y1 = Math.max(0, edge - x0)
              }
              width = Math.abs(x1 - x0)
              height = Math.abs(y1 - y0)
              g.attr("transform", "translate(" + Math.min(x0, x1) + "," + Math.min(y0, y1) + ")")
              rect.attr("height", height).attr("width", width)
              xi = Math.min(x0,x1)
              yi = Math.min(y0,y1)
              listeners.call("brush", this, invert([
                  [Math.min(x0, x1), Math.min(y0, y1)],
                  [Math.min(x0, x1) + width, Math.min(y0, y1) + height]
              ]));
          }

          function dragended(d) {
              if (d3.event.defaultPrevented) return;
              listeners.call("end", this, invert([
                  [Math.min(x0, x1), Math.min(y0, y1)],
                  [Math.min(x0, x1) + width, Math.min(y0, y1) + height]
              ]));
          }
      }
      var highlight = function(d) {
          var data
          if (typeof d[0] == "number") {
              data = [{
                      "x": scale(d[0]),
                      "y": yscale(d[1]),
                      "size": scale(d[1]) - scale(d[0])
                  },
                  //{"x":scale(d[0][1]),"y":yscale(d[1][1]),"size":scale(d[1][1])-scale(d[0][1])}
              ]
          } else {
              data = [{
                      "x": scale(d[0][0]),
                      "y": yscale(d[1][0]),
                      "size": scale(d[1][0]) - scale(d[0][0])
                  },
                  {
                      "x": scale(d[0][1]),
                      "y": yscale(d[1][1]),
                      "size": scale(d[1][1]) - scale(d[0][1])
                  }
              ]
          }
          var b = G.selectAll(".hLite").data(data)
          //b.exit().remove()
          b.enter().append("g").classed("hLite", true).classed("selection", true)
              .merge(b)
              .call(flag)
              .on("click", function() {
                  listeners.call("click", this, status)
              })
              .on("contextmenu", function() {
                  d3.event.preventDefault();
                  listeners.call("contextmenu", this, status)
              })
      }

      listeners.on("deactivate.local", function(d) {
          G.selectAll(".hLite").remove()
      })
      listeners.on("brush.local", function(d) {
          status = d
          highlight(d)
      })
      brush.theta = function(_) {
          return arguments.length ? (theta = _, brush) : theta;
      }
      brush.on = function() {
          var value = listeners.on.apply(listeners, arguments);
          return value === listeners ? brush : value;
      };
      brush.x = function(_) {
          return arguments.length ? (x = _, brush) : x;
      }
      brush.y = function(_) {
          return arguments.length ? (y = _, brush) : y;
      }
      brush.domain = function(_) {
          return arguments.length ? (scale.domain(_), yscale.domain([_[1], _[0]]), brush) : scale.domain();
      }
      brush.activate = function(_) {
          listeners.call("activate", this, _)
      }
      brush.deactivate = function(d) {
          listeners.call("deactivate", this, d)
          /** TO FIX THIS **/

      }
      brush.process = function(code, data) {
          if (code == "brush") {
              highlight(data)
          }
      }
      brush.scale = function(_) {
          return arguments.length ? (scale = _, edge = scale.range()[1] - scale.range()[0], yscale.domain([scale.domain()[1], scale.domain()[0]]).range(scale.range()), brush) : scale;
      }

      brush.edge = function(_) {
          return arguments.length ? (edge = _, scale.range([0, edge]), yscale.range([0, edge]), brush) : edge;
      }
      return brush
  }
