import coords from "../data/coords"
import font from "../shape/font"

import bgPlot from "../data/bgPlot"
var _font = font()
function measureScale(l) {
    var s = Math.pow(10, 12);
    for (var i = 0; i < 12; i++) {
        if ((s * 5) / l < 1 / 2) {
            return s * 5;
        }
        if ((s * 2) / l < 1 / 2) {
            return s * 2;
        }
        if (s / l < 1 / 2) {
            return s;
        }
        s = s / 10;
    }
    return s;
}
export default function() {
    var coord
    var width
    var height = 30
    var gap = 10
    var svg
    var canvas
    var render
    var selectedAxis = -1
    var inCtrl = false //TODO
    var wasCtrl = false //TODO
    var inBrush = false
    var color = ["#333", "#555"]
    var parse = d3.format(".1s");
    var parse2 = d3.format(",");
    var dispatch
    var regions
    var navBtns = []
    var axisToggle = false;
    var bg = false;
    var unSelectAxis = function() {
        selectedAxis = -1
        axisToggle = false
        navBtns.forEach(function(btn) {
            btn.classed("btn-default", true)
                .classed("btn-success", false)
        })
        svg.selectAll(".dh").remove()
    }
    var _addBrush = function(svg) {
        //var svg = render.svg();
        var extent, r;
        var brush = d3.brushX() //.extent([0,0],[ coord.range(0)[1],_barHeight]); //
            .on("start", function() {
                inBrush = true
                unSelectAxis()
                dispatch.call("brush", this, [])
                svg.selectAll(".selection").style("display", "block")
                svg.selectAll(".resp").style("display", "none")
            })
            .on("brush", function() {
                extent = d3.event.selection;
                r = coord.invert(extent)
                dispatch.call("brush", this, r)
            })
            .on("end", function() {
                inBrush = false;
            })
        var brushArea = svg.append("g")
            .classed("scopebrush", true)
            brushArea.call(brush)
            .selectAll(".selection")
            .on("contextmenu", function(d) {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                dispatch.call("update", this, r)
            })
        svg.on("contextmenu", function(e) {
            if (brushArea.attr("width") > 0) {
                return
            }
            d3.event.preventDefault();
            if (axisToggle) {
                unSelectAxis()
            } else {
                axisToggle = true;
                var mousePosition = d3.mouse(svg.node())
                var i = coord.invertHost([mousePosition[0], mousePosition[0] + 1])
                var r0 = []
                i.forEach(function(i0) {
                    r0.push(regions[i0])
                    selectedAxis = i0
                })
                renderDh(r0, i)
                navBtns.forEach(function(btn) {
                    btn.classed("btn-default", false)
                        .classed("btn-success", true)
                })
            }
        })
        //console.log(mousePosition, r,selectedAxis)
        var　 renderDh = function(r, i) {
            svg.selectAll(".dh").remove()
            var arr = [];
            r.forEach(function(d) {
                arr.push({
                    "i": i[0],
                    "region": d,
                    "render": coord(d)[0]
                })
            })
            var axis = svg.selectAll(".dh").data(arr)
                .enter()
                .append("rect")
                .classed("dh", true)
                .attr("x", function(d) {
                    return d.render.x
                })
                .attr("y", 0)
                .attr("height", 30)
                .attr("width", function(d) {
                    return d.render.l
                })
                .attr("fill", "#000")
                .attr("opacity", 0.1)
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
                d3.select(this).attr("x", function(d) {
                    return d.render.x
                })
                var scale = d3.scaleLinear().domain([d.region.start, d.region.end]).range([d.render.x, d.render.x + d.render.l])
                //console.log(scale.invert(d.x), scale.invert(d.x + d.render.l))
                regions[d.i].start = Math.round(scale.invert(d.x))
                regions[d.i].end = Math.round(scale.invert(d.x + d.render.l))
                dispatch.call("move", this, regions)
            }
            axis.call(
                d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            )
        }


        if (selectedAxis >= 0) {
            axisToggle = true
            navBtns.forEach(function(btn) {
                btn.classed("btn-default", false)
                    .classed("btn-success", true)
            })
            renderDh([regions[selectedAxis]], [selectedAxis])
        } else {

        }

    }

    var chart = function(el) {
        var d = el.datum() //regions;
        //svg = el.selectAll("svg").remove();
        regions = d;
        coord = coords().width(width).gap(gap).regions(d).init();
        el.selectAll("canvas").remove()
        el.selectAll("svg").remove()
        canvas = el.append("canvas").attr("width", width).attr("height", height)
        svg = el.append("svg").attr("width", width).attr("height", height)
        var ctx = canvas.node().getContext("2d")
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, width, height)
        if (bg) {
            bgPlot(canvas.node())
        }
        ctx.font = _font.font
        var w = width - gap;
        var l = 0;
        d.forEach(function(d, i) {
            l += d.end - d.start
        })
        var s = measureScale(l)
        var sRatio = s / l;
        var scaleWidth = sRatio * w;
        var scaleOffset = (w - scaleWidth) / 2
        ctx.fillStyle = "#000000"
        ctx.fillRect(scaleOffset, 0, scaleWidth, 1)
        ctx.fillRect(scaleOffset, 0, 1, 5)
        ctx.fillRect(scaleOffset + scaleWidth, 0, 1, 5)
        ctx.fillText(parse(s), scaleOffset + scaleWidth + 10, 10)
        ctx.font = _font.font
        d.forEach(function(d, i) {
            var x = coord(d)
            ctx.fillStyle = color[i]
            x.forEach(function(x) {
                ctx.fillRect(x.x, 12, x.l, 1)
                ctx.fillText(d.chr, x.x, 10)
            })
        })
        /* TODO IMPROVE SCALE TICKS GAP
         * IMPROVE CHROMOSOME REGION
         */
        var tickGap = s / 2
        if (sRatio < 1 / 3) {
            tickGap = s
        }
        d.forEach(function(d, i) {
            var i0 = Math.floor(d.start / tickGap) + 1;
            var k0 = Math.floor(d.end / tickGap);
            for (var i1 = i0; i1 < k0; i1++) {
                var l = i1 * tickGap ;
                var e = {
                    "chr": d.chr,
                    "start": l,
                    "end": l + 1
                }
                coord(e).forEach(function(d) {
                    ctx.fillStyle = "#000000"
                    ctx.fillRect(d.x, 12, 1, 5)
                    ctx.fillStyle = "#303030"
                    ctx.fillText(parse2(l), d.x + 3, 22) //TODO
                })
            }
        })
        _addBrush(svg, selectedAxis);
    }
    chart.brush = function(d) { //TODO
        //console.log("TODO brush scale track", d)
        unSelectAxis()
        if (!inBrush && svg) {
            var fill = "#000"
            if (d.length > 0 && (typeof d[0].color != "undefined")) {
                fill = d[0].color
            }
            if (typeof d.color != "undefined") {
                fill = d.color
            }
            var b = []
            d.forEach(function(d) {
                coord(d).forEach(function(d) {
                    b.push(d)
                })
            })
            svg.selectAll(".selection").style("display", "none")
            var k = svg.selectAll(".resp").data(b)
            k.exit().remove()
            k.enter().append("rect").classed("resp", true)
                .merge(k)
                .attr("x", function(d) {
                    return d.x
                })
                .attr("y", 0)
                .attr("height", height)
                .attr("width", function(d) {
                    return d.l
                })
                .attr("fill", function(d){
                    return d.color || fill
                })
                .attr("opacity", 0.2)
                .on("contextmenu", function() {
                    d3.event.preventDefault();
                    dispatch.call("update", this, d)
                })
        } else {

        }
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
    chart.dispatch = function(_) {
        return arguments.length ? (dispatch = _, chart) : dispatch;
    }
    chart.selectedAxis = function(_) {
        return arguments.length ? (selectedAxis = _, chart) : selectedAxis;
    }
    chart.navBtns = function(_) {
        return arguments.length ? (navBtns = _, chart) : navBtns;
    }
    chart.bg = function(_) {
        return arguments.length ? (bg = _, chart) : bg;
    }
    return chart

}
