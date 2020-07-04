import coords from "../data/coords"
import regionsSmartText from "../tools/regionsSmartText"
import fixRegions from "../tools/mergeRegions"
import font from "../shape/font"
import getBand from "../tools/getBand"
//import * as d3 from "d3"

var _font = font()
var colorBand = {
    "gneg": "#DDD",
    "gpos33": "#999",
    "gpos66": "#555",
    "gpos75": "#333",
    "gpos50": "#777",
    "gpos25": "#BBB",
    "gpos100": "#000",
    "gvar": "#000"
}
var colors = function(d) {
    return colorBand[d] || "#000"
}
export default function() {
    var coord
    var width
    var height = 100 
    //var height = 60
    var gap = 10
    var svg
    var canvas
    var color = ["#F00", "#A00"]
    var ccolor = "#333"
    var parse = d3.format(".1s");
    var parse2 = d3.format(",");
    var chrs;
    var genome = null
    var bands = null
    var dispatch
    var plotBrush
    var regionsToChrs = function(d) {
        var chrSet = {};
        var retv = [];
        d.forEach(function(d) {
            if (!d.chr) return
            if (!chrSet[d.chr]) {
                retv.push({
                    "chr": d.chr,
                    "start": 0,
                    "end": chrs(d.chr)
                })
                chrSet[d.chr] = true;
            }
        })
        return retv
    }
    var chart = function(el) {
        var data = el.datum() //regions;
        var chromos = regionsToChrs(data)
        var r;
        coord = coords().width(width).gap(gap).regions(chromos).init();
        el.selectAll("canvas").remove()
        canvas = el.append("canvas").attr("width", width).attr("height", height)
        el.selectAll("svg").remove()
        svg = el.append("svg").attr("width", width).attr("height", height)
        var brush = d3.brushX() //.extent([0,0],[ coord.range(0)[1],_barHeight]); //
            .extent([
                [0, 10],
                [width, 20]
            ])
            .on("start", function() {})
            .on("brush", function() {
                var extent = d3.event.selection;
                r = coord.invert(extent)
                dispatch.call("text", this, r)
            })
            .on("end", function() {})
        svg.append("g").call(brush)
            .selectAll(".selection")
            .on("contextmenu", function(d) {
                d3.event.preventDefault();
                dispatch.call("update", this, r)
            })
        var ctx = canvas.node().getContext("2d")
        ctx.fillStyle = "#F7F7F7"
        ctx.fillRect(0, 0, width, height - 5)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 10, width, height - 27)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, height - 5, width, 5)

        var plotChroms = function() {
            chromos.forEach(function(d, i) {
                var x = coord(d)
                x.forEach(function(d0) {
                    ctx.fillStyle = ccolor
                    ctx.fillRect(d0.x, 22, d0.l, 8)
                    ctx.fillStyle = "#FFF"
                    ctx.fillRect(d0.x + 1, 23, d0.l - 2, 8 - 2)
                })
                ctx.fillStyle = ccolor
            })
        }
        var plotChromsLabel = function() {
            ctx.font = _font.font
            ctx.fillStyle = "#000"
            chromos.forEach(function(d, i) {
                var x = coord(d)
                x.forEach(function(d0) {
                    ctx.fillText(d.chr, d0.x, 18)
                })

            })
        }
        var plotBands = function(results) {
            results.forEach(function(result, i) {
                var c = true
                result.forEach(function(d0) {
                    var b = coord(d0)
                    if (d0.value == "acen") {
                        if (c) {
                            c = false
                            ctx.fillStyle = "#900C3F"
                            ctx.moveTo(b[0].x, 22)
                            ctx.lineTo(b[0].x + b[0].l, 27);
                            ctx.lineTo(b[0].x, 32);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            c = true
                            ctx.fillStyle = "#900C3F"
                            ctx.moveTo(b[0].x, 27)
                            ctx.lineTo(b[0].x + b[0].l, 22);
                            ctx.lineTo(b[0].x + b[0].l, 32);
                            ctx.closePath();
                            ctx.fill()
                        }
                    } else {
                        ctx.fillStyle = colors(d0.value)
                        ctx.fillRect(b[0].x, 22, b[0].l, 10)
                    }
                    svg.append("rect")
                        .attr("x", b[0].x)
                        .attr("y", 22)
                        .attr("width", b[0].l)
                        .attr("height", 10)
                        .attr("fill", "#000")
                        .attr("opacity", 0.0)
                        .on("contextmenu", function(e) {
                            d3.event.preventDefault();
                            dispatch.call("update", this, [d0])
                        })
                        .append("svg:title")
                        .text(d0.id)

                })
            })

        }
        var dragged = function(d) {
            d.x += d3.event.dx
            //d.y += d3.event.dy

            d3.select(this).attr("transform", function(d) {
                return "translate(" + d.x + ",34)"
            })
            data[d.i] = coord.invert([d.x, d.x + d.l])[0]
            var newRegions = fixRegions(data)
            dispatch.call("text", this, newRegions)
        }
        var dragstarted = function(d) {

        }
        var dragended = function(d) {
            data[d.i] = coord.invert([d.x, d.x + d.l])[0]
            var newRegions = fixRegions(data)
            dispatch.call("update", this, newRegions)
        }

        var plotSelect = function() {
            data.forEach(function(d0, i) {
                var x = coord(d0)
                ctx.fillStyle = color[i]
                x.forEach(function(x) {
                    var l = x.l
                    if (l < 1) {
                        l = 1
                    }
                    ctx.fillRect(x.x, 34, l, 4)
                    var slt = svg.append("g").attr("transform", "translate(" + x.x + ",34)")

                    slt.append("rect")
                        .attr("height", 4)
                        .attr("width", l)
                        .attr("opacity", 0.2)
                        .classed("dh", true)
                    slt.datum({
                        "x": x.x,
                        "y": 34,
                        "i": i,
                        "l": x.l
                    })
                    slt.call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended))

                })
            })
            ctx.font = _font.font
            ctx.fillStyle = "#226A98" //TODO Category10 Color
            ctx.fillText(regionsSmartText(data), 0, 52)
        }
        plotBrush = function(d) {
            var t = [];
            d.forEach(function(d0) {
                var k = coord(d0)
                if (k.length > 0) {
                    var r = k[0]
                    r.color = d0.color || d.color || "#000"
                    t.push(r)
                }
            })
            var b = svg.selectAll(".b").data(t)
            b.exit().remove()
            b.enter().append("rect").classed("b", true)
                .merge(b)
                .attr("x", function(d) {
                    return d.x
                })
                .attr("y", 14)
                .attr("height", 5)
                .attr("width", function(d) {
                    return d.l
                })
                .attr("opacity", 0.5)
                .attr("fill", function(d) {
                    return d.color
                })
                .on("contextmenu", function() {
                    d3.event.preventDefault();
                    dispatch.call("update", this, d)
                })
        }
        var plot = function(results) {
            plotBands(results)
            plotChromsLabel();
            plotSelect()
        }
        var _plot = function() {
            plotChroms()
            plotChromsLabel()
            plotSelect()
        }
        var q = []

        if (bands !== null) {
            chromos.forEach(function(d, i) {
                q.push(bands[d.chr]["band"])
            })
            plot(q)
        } else {
            getBand(genome, function(d) {
                if (d == null || "404 page not found" in d) {
                    _plot()
                } else {
                    bands = d
                    chromos.forEach(function(d, i) {
                        q.push(bands[d.chr]["band"])
                    })
                    plot(q)

                }
            })
        }
        //q.awaitAll(plot)
        /*
        Promise.all(q).then(plot).catch(function() {
            _plot()
        })
        */
    }

    chart.width = function(_) {
        return arguments.length ? (width = _, chart) : width;
    }
    chart.height = function(_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.gap = function(_) {
        return arguments.length ? (gap = _, chart) : gap;
    }
    chart.chrs = function(_) {
        return arguments.length ? (chrs = _, chart) : chrs;
    }
    chart.genome = function(_) {
        if (!arguments.length) {
            return genome
        } else {
            if (genome == _) {
                return chart
            } else {
             genome = _;
             bands = null
             return chart
            }
        }
    }
    chart.dispatch = function(_) {
        return arguments.length ? (dispatch = _, chart) : dispatch;
    }
    chart.brush = function(d) {
        try {
            plotBrush(d)
        } catch(e) {
            console.log("chromosome not inited yet")
        }   
    }
    return chart

}
