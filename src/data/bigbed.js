import {
    totalLength,
    overlap
} from "./funcs"
import trackManager from "./trackManager"
import shapeGene from "../shape/gene"
import getCDS from "../tools/bed12cds"

import symbolArrow from "../symbol/arrow"
import symbolRarrow from "../symbol/rarrow"
import symbolForward from "../symbol/forward"
import symbolBackward from "../symbol/backward"
import strToColor from "../tools/strToColor"
import parseBed from "../tools/parseBed"

import fixRegions from "../tools/fixRegions"

import font from "../shape/font"

import bgPlot from "./bgPlot"
import * as d3 from "d3"

import sandInits from "../sandInits"
var _font = font()
var labelColor = "#555"


function parseItemRgb(s) {
    if (s == undefined) {
        return undefined
    }
    if (s == "0" || s == "0,0,0") {
        return undefined
    } else {
        return "rgb(" + s + ")"
    }
}

export default {
    Get: function(URI, callback) {
        var config = {}
        var ready = function(results) {
            config.URI = URI
            config.trackIds = results[0]
            callback(config)
        }
        d3.json(URI + "/list", sandInits).then(ready)
    },
    canvas: function() {
        var id = "gene"
        var pos = 0 //for response rect TODO remove this limitation (change to id or get the response var)
        var height = 12
        var width
        var gap = 3
        var x = 0
        var y = 10
        var bg = false
        var coord
        var regions
        var el
        var trackM
        var ctx
        var canvasHeight;
        var URI = ""
        var color
        var mode = "full"
        var callback = function() {};
        var hFirstNames = {};
        var dispatch
        var forward = d3.symbol().type(symbolForward).size(6)
        var backward = d3.symbol().type(symbolBackward).size(6)
        var longLabel = ""
        var renderLongLabel = function(ctx) {
            var l = longLabel.length
            var x = width / 2 - _font.width * l / 2
            ctx.font = _font.font
            ctx.fillStyle = "#000"
            ctx.fillText(longLabel, x, _font.height) //TODO
        }

        var _render_ = function(results) {
            ctx.fillStyle = "grey"
            var bed2track = [];
            var beds = [];
            var maxTrack = 0;
            var num = 0;
            results.forEach(function(d, rI) {
                var lines = d.split("\n")
                lines.forEach(function(d) {
                    var t = d.split("\t")
                    var a = parseBed(t)
                    if (a == null) return
                    beds.push(a)
                    if (a.name && a.name.length > 1) {
                        trackM.labelSize(a.name.length * _font.width + 25)
                    } else {
                        trackM.labelSize(0)
                    }
                    var yi = trackM.AssignTrack(a)
                    bed2track.push(yi)
                    if (maxTrack < yi.i) maxTrack = yi.i;
                })
                if (mode == "full") {
                    canvasHeight = (maxTrack + 1 + 1) * (height + gap)
                    el.attr("height", canvasHeight)
                    ctx = el.node().getContext('2d')
                    var svg = d3.select(el.node().parentNode).selectAll("svg")
                    ctx.fillStyle = "#FFF"
                    ctx.fillRect(0, 0, width, canvasHeight)
                    if (bg) {
                        bgPlot(el.node())

                    }
                    renderLongLabel(ctx)

                    d3.select(el.node().parentNode.parentNode).style("height", canvasHeight + "px")
                    d3.select(el.node().parentNode).selectAll("svg").attr("height", canvasHeight)
                    svg.selectAll(".tmap").remove();
                    var g = svg.append("g").classed("tmap", true)
                    beds.forEach(function(a, i) {
                        var lcolor
                        if ((color == "#ffffff" || color == "#FFFFFF") && a.name) {
                            lcolor = strToColor(a.name)
                        } else {
                            lcolor = color
                        }
                        var itemColor = parseItemRgb(a.itemRgb) || lcolor
                        var xs = coord(a)
                        var yi = bed2track[i]
                        xs.forEach(function(o, i) {
                            var _width = o.l > 1 ? o.l : 1;
                            ctx.translate(x + o.x, y + yi.i * (height + gap))
                            var g0 = g.append("g")
                            g0.append("title").text(a.name)
                            g0.append("rect")
                                .attr("x", x + o.x)
                                .attr("y", y + yi.i * (height + gap) - 5)
                                .attr("height", 10)
                                .attr("width", _width)
                                .attr("opacity", 0.0)
                                .attr("title", a.name)
                                .on("click", function() {
                                    console.log(a.name)
                                    var b = []
                                    beds.forEach(function(d){
                                        if (d.name == a.name) {
                                            b.push(d)
                                        }
                                    })
                                    dispatch.call("brush",this,fixRegions(b))
                                })
                            if (o.f) {
                                ctx.fillStyle = itemColor
                                if (a.blockSizes) {
                                    if (hFirstNames[yi.i] || hFirstNames[yi.i] == "" || rI != 0) {
                                        shapeGene().width(_width).label(!yi.c).y(height / 2).color(itemColor).context(ctx)(a)
                                    } else {
                                        if (o.x < _font.width * a.name.length + 25) {
                                            hFirstNames[yi.i] = a.name;
                                            shapeGene().width(_width).label(false).y(height / 2).color(itemColor).context(ctx)(a)
                                        } else {
                                            hFirstNames[yi.i] = "";
                                            shapeGene().width(_width).label(!yi.c).y(height / 2).color(itemColor).context(ctx)(a)
                                        }
                                    }
                                } else {
                                    ctx.fillRect(0, -3, _width, 6)
                                    if (a.name && a.name.length > 1) {
                                        ctx.fillStyle = labelColor
                                        ctx.font = _font.font
                                        if (hFirstNames[yi.i] || hFirstNames[yi.i] == "" || rI != 0) {
                                            ctx.fillText(a.name, -_font.width * a.name.length - _font.gap, 3)
                                        } else {
                                            //hFirstNames[yi.i] = a.name;
                                            if (o.x < _font.width * a.name.length + 25) {
                                                hFirstNames[yi.i] = a.name;
                                            } else {
                                                hFirstNames[yi.i] = ""
                                                ctx.fillText(a.name, -_font.width * a.name.length - _font.gap, 3)
                                            }
                                        }
                                    }
                                }


                            } else { //a.partial
                                if (a.blockSizes) {
                                    ctx.fillStyle = itemColor
                                    ctx.fillRect(0, 0, o.l, 1)
                                    for (var i = 0; i < a.blockCount; i++) {
                                        var e = coord({
                                            "chr": a.chr,
                                            "start": a.start + a.blockStarts[i],
                                            "end": a.start + a.blockStarts[i] + a.blockSizes[i]
                                        })
                                        e.forEach(function(d) {
                                            if (d.f) {
                                                ctx.fillStyle = itemColor //TODO
                                                ctx.fillRect(d.x - o.x, -3, d.l > 1 ? d.l : 1, 6)
                                            } else {
                                                ctx.fillStyle = itemColor
                                                ctx.fillRect(d.x - o.x, -3, d.l > 1 ? d.l : 1, 6) //TODO
                                                //overflow mark TODO

                                            }
                                        })
                                    }
                                    var cds = getCDS(a)
                                    if (cds) {
                                        for (var i = 0; i < cds.blockCount; i++) {
                                            var e = coord({
                                                "chr": cds.chr,
                                                "start": cds.start + cds.blockStarts[i],
                                                "end": cds.start + cds.blockStarts[i] + cds.blockSizes[i]
                                            })
                                            e.forEach(function(d) {
                                                if (d.f) {
                                                    ctx.fillStyle = itemColor //TODO
                                                    ctx.fillRect(d.x - o.x, -5, d.l > 1 ? d.l : 1, 2)
                                                    ctx.fillRect(d.x - o.x, 3, d.l > 1 ? d.l : 1, 2)
                                                } else {
                                                    ctx.fillStyle = itemColor
                                                    ctx.fillRect(d.x - o.x, -5, d.l > 1 ? d.l : 1, 2) //TODO
                                                    ctx.fillRect(d.x - o.x, 3, d.l > 1 ? d.l : 1, 2) //TODO

                                                }
                                            })
                                        }
                                    }
                                    //add handle introns.
                                    var arrows = {
                                        "+": d3.symbol().type(symbolArrow).size(3).context(ctx),
                                        "-": d3.symbol().type(symbolRarrow).size(3).context(ctx)
                                    }

                                    var arrow = arrows[a.strand]
                                    if (arrow) {
                                        for (var i = 0; i < a.blockCount - 1; i++) {
                                            var e = coord({
                                                "chr": a.chr,
                                                "start": a.start + a.blockStarts[i] + a.blockSizes[i],
                                                "end": a.start + a.blockStarts[i + 1]
                                            })
                                            e.forEach(function(d) {
                                                var _s = d.x - o.x
                                                var _e = d.x - o.x + d.l
                                                var _y = 0
                                                ctx.strokeStyle = "#333333"
                                                ctx.beginPath();
                                                for (var j = 10; j < d.l - 10; j += 10) {
                                                    var x = _s + j
                                                    ctx.translate(x, _y)
                                                    ctx.beginPath()
                                                    arrow()
                                                    ctx.stroke()
                                                    ctx.translate(-x, _y)
                                                }

                                            })
                                        }
                                    }
                                    if (a.name && a.name.length > 1) {
                                        ctx.fillStyle = labelColor
                                        ctx.font = _font.font
                                        if (hFirstNames[yi.i] || hFirstNames[yi.i] == "" || rI != 0) {
                                            ctx.fillText(a.name, -_font.width * a.name.length - _font.gap, 3)
                                        } else {
                                            if (o.x < _font.width * a.name.length + 25) {
                                                hFirstNames[yi.i] = a.name;
                                            } else {
                                                hFirstNames[yi.i] = ""
                                                ctx.fillText(a.name, -_font.width * a.name.length - _font.gap, 3)
                                            }
                                        }
                                    }
                                } else {
                                    ctx.fillStyle = itemColor
                                    ctx.fillRect(0, -3, _width, 6)

                                    ctx.fillStyle = color
                                    if (a.name && a.name.length > 1) {
                                        ctx.fillStyle = labelColor
                                        ctx.font = _font.font
                                        //ctx.fillText(a.name, -4*a.name.length -10, -2-height)
                                        if (hFirstNames[yi.i] || hFirstNames[yi.i] == "" || rI != 0) {
                                            ctx.fillText(a.name, -_font.width * a.name.length - _font.gap, 3)
                                        } else {
                                            //hFirstNames[yi.i] = a.name;
                                            if (o.x < _font.width * a.name.length + 25) {
                                                hFirstNames[yi.i] = a.name;
                                            } else {
                                                ctx.fillText(a.name, -_font.width * a.name.length - _font.gap, 3)
                                            }
                                        }
                                    }
                                }
                                /*add backward and forward */
                                if (o.o_s) {
                                    ctx.fillStyle = "red"
                                    //ctx.fillRect(0, -3, d.l > 1 ? 2 : 1, 6)
                                    //ctx.translate(0, 0)
                                    //ctx.beginPath()
                                    backward.context(ctx)()
                                    //ctx.fill()
                                    //ctx.translate(-x, _y)
                                }
                                if (o.o_e) {
                                    ctx.fillStyle = "red"
                                    //ctx.fillRect(o.l - 3, -3, d.l > 2 ? 3 : 1, 6)
                                    ctx.translate(o.l - 6, 0)
                                    //ctx.beginPath()
                                    forward.context(ctx)()
                                    //ctx.fill()
                                    ctx.translate(-o.l + 6, 0)
                                }
                            }
                            ctx.translate(-x - o.x, -y - yi.i * (height + gap))
                        })
                    })
                } else if (mode == "dense") { //TODO overlap caculation.
                    canvasHeight = height + gap
                    el.attr("height", canvasHeight)
                    ctx = el.node().getContext('2d')
                    var lcolor = color
                    if (lcolor == "#FFFFFF" || lcolor == "#ffffff") {
                        lcolor = "#00f"
                    }
                    ctx.fillStyle = "#FFF"
                    ctx.fillRect(0, 0, width, canvasHeight)
                    if (bg) {
                        bgPlot(el.node())

                    }
                    d3.select(el.node().parentNode.parentNode).style("height", canvasHeight + "px")
                    d3.select(el.node().parentNode).selectAll("svg").attr("height", canvasHeight)
                    var overlapHeights = Array.apply(null, Array(width)).map(Number.prototype.valueOf, 0);
                    beds.forEach(function(a, i) {
                        var xs = coord(a);
                        xs.forEach(function(o, i) {
                            var _width = o.l > 1 ? o.l : 1;
                            for (var j = Math.round(o.x); j < Math.round(o.x + _width); j++) {
                                overlapHeights[j] += 1;
                            }
                        })
                    })
                    var overlapMax = 1;
                    overlapHeights.forEach(function(d) {
                        if (overlapMax < d) {
                            overlapMax = d
                        }
                    })
                    beds.forEach(function(a, i) {
                        var itemColor = parseItemRgb(a.itemRgb) || lcolor
                        var xs = coord(a)
                        xs.forEach(function(o, i) {
                            var _width = o.l > 1 ? o.l : 1;
                            ctx.fillStyle = itemColor
                            ctx.globalAlpha = 1.0 / overlapMax
                            ctx.translate(x + o.x, 20)
                            ctx.fillRect(0, -height, _width, (height - 4))
                            ctx.translate(-x - o.x, -20)
                        })
                    })
                }
            })
            callback({
                "firstNames": hFirstNames,
                "beds": beds
            });
        }
        var render = function() {
            /* NOT JSON BUT BED */
            var q = []
            regions.forEach(function(d) {
                //getData API
                q.push(d3.text(URI + "/" + id + "/get/" + d.chr + ":" + d.start + "-" + d.end, sandInits))
            })
            Promise.all(q).then(_render_)
        }
        var svg;
        var chart = function(selection) {
            trackM = trackManager().coord(coord)
            el = selection //canvas?
            el.selectAll(".respSvg").remove();
            svg = d3.select(el.node().parentNode).append("svg").classed("respSvg", true).attr("width", width).attr("height", 130) //TODO FIX 130 height;
            ctx = el.node().getContext("2d")
            color = color || strToColor(id)
            render();
        }
        chart.svg = function(_) {
            return arguments.length ? (svg = _, chart) : svg;
        }
        chart.x = function(_) {
            return arguments.length ? (x = _, chart) : x;
        }
        chart.y = function(_) {
            return arguments.length ? (y = _, chart) : y;
        }
        chart.height = function(_) {
            return arguments.length ? (height = _, chart) : height;
        }
        chart.URI = function(_) {
            return arguments.length ? (URI = _, chart) : URI;
        }
        chart.coord = function(_) {
            return arguments.length ? (coord = _, chart) : coord;
        }
        chart.regions = function(_) {
            return arguments.length ? (regions = _, chart) : regions;
        }
        chart.id = function(_) {
            return arguments.length ? (id = _, chart) : id;
        }
        chart.width = function(_) {
            return arguments.length ? (width = _, chart) : width;
        }
        chart.canvasHeight = function(_) {
            return arguments.length ? (canvasHeight = _, chart) : canvasHeight;
        }
        chart.callback = function(_) {
            return arguments.length ? (callback = _, chart) : callback;
        }
        chart.color = function(_) {
            return arguments.length ? (color = _, chart) : color;
        }
        chart.mode = function(_) {
            return arguments.length ? (mode = _, chart) : mode;
        }
        chart.dispatch = function(_) {
            return arguments.length ? (dispatch = _, chart) : dispatch;
        }
        chart.longLabel = function(_) {
            return arguments.length ? (longLabel = _, chart) : longLabel;
        }
        chart.bg = function(_) {
            return arguments.length ? (bg = _, chart) : bg;
        }

        return chart
    }

}
