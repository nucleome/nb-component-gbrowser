import {
    totalLength,
    overlap
} from "./funcs"
import font from "../shape/font"
import complementaryColor from "../tools/complementaryColor"

import bgPlot from "./bgPlot"
import * as d3 from "d3"
import sandInits from "../sandInits"
import sandHeaders from "../sandHeaders"

var _font = font()
export default function() {
    var color = "#333333"
    var id = "default"
    var pos = 0 //for response rect TODO remove this limitation (change to id or get the response var)
    var height
    var width
    var regions
    var x
    var y
    var URI = ""
    var barHeight = 50
    var plotMode = "full"
    var canvas
    var panel //canvas parent for add svg;
    var binsize
    var scale
    var respSvg
    var bg = false
    var gap = 0 //TODO for gap axis
    var mode = 1 // "max" or "mean" { 0: mix (max,min,mean) , 1: mean, 2: max/min } Not Working for current version
    var autoscale = true
    var vmax = 10.0 //TODO
    var vmin = -10.0 //TODO
    var longLabel = ""
    var highlight = "#777"
    var currentResults
    var callback = function(d) {
        console.log("callback", d)
    }

    var renderLongLabel = function(ctx) {
        var l = longLabel.length
        var x = width / 2 - _font.width * l / 2
        ctx.font = _font.font
        ctx.fillStyle = "#000"
        ctx.fillText(longLabel, x, _font.height) //TODO
    }
    var getValue = function(r) {
        var v
        if (r.Valid) {
            v = r.Sum / r.Valid
        } else {
            v = r.Value || 0.0
        }
        return v
    }
    var _renderRegion = function(ctx, xoffset, yoffset, region, xscale, yscale, color, positive) {
        var area = d3.area()
            .x(function(d) {
                return xoffset + xscale(d.x)
            })
            .y1(function(d) {
                return yoffset + (barHeight - yscale(d.y))
            })
            .y0(yoffset + (barHeight - yscale(0)))
            .context(ctx)
        var values = [{
            "x": xscale.domain()[0],
            "y": 0
        }]
        ctx.fillStyle = color
        ctx.globalAlpha = 0.5
        var domain = xscale.domain();
        var lastPos = domain[0];
        var r = xscale.range();
        for (var i = 0; i < region.length; i++) {
            var v = getValue(region[i])
            //= (region[i].Sum / region[i].Valid) || region[i].Value //if d.Sum == 0
            if (v <= 0 && positive) {
                continue
            }
            if (isNaN(region[i].From) || isNaN(region[i].To)) {
                continue; //add handle large width bug
            }
            var lastX = xscale(lastPos)
            var x1 = xscale(region[i].From)
            var x2 = xscale(region[i].To)
            if ((x1 - lastX) > 2) {
                values.push({
                    "x": lastPos,
                    "y": 0
                })
                values.push({
                    "x": region[i].From,
                    "y": 0
                })
            }

            if ((x2 - x1) < 2) {
                values.push({
                    "x": (region[i].From + region[i].To) / 2,
                    "y": v || 0
                })
            } else {
                values.push({
                    "x": region[i].From,
                    "y": v || 0
                })
                values.push({
                    "x": region[i].To,
                    "y": v || 0
                })
            }
            lastPos = region[i].To;
        }
        if ((xscale.domain()[1] - lastX) > 2) {
            values.push({
                "x": lastPos,
                "y": 0
            })
        }
        values.push({
            "x": xscale.domain()[1],
            "y": 0
        })
        ctx.translate(x, y)
        ctx.beginPath();
        area(values)
        ctx.closePath();
        ctx.fill();
        ctx.translate(-x, -y)

    }
    //TODO: Response to Set Different YScale
    //      Intuitive to Control
    //      Group Set Scale
    var renderRegion = function(ctx, xoffset, yoffset, region, xscale, yscale, color) {
        _renderRegion(ctx, xoffset, yoffset, region, xscale, yscale, color, false)
        _renderRegion(ctx, xoffset, yoffset, region, xscale, yscale, color, true)
    }

    //TODO : Fix yscale is negative 
    var renderRegionDense = function(ctx, xoffset, yoffset, region, xscale, yscale, color) {
        //TODO
        var ymax = yscale.domain()[1]
        var ymin = yscale.domain()[0]
        var amax = Math.max(Math.abs(ymax), Math.abs(ymin))
        ctx.fillStyle = color
        if (ymin < 0) {
            var negativeColor = complementaryColor(color)
            region.forEach(function(r) {
                var value = getValue(r) || 0.0
                var x0 = xoffset + xscale(r.From)
                var x1 = xoffset + xscale(r.To)
                //ctx.globalAlpha = yscale(value) / barHeight
                if (value < 0) {
                    ctx.fillStyle = negativeColor
                } else {
                    ctx.fillStyle = color
                }

                ctx.globalAlpha = Math.abs(value) / amax
                ctx.fillRect(x0, 1, x1 - x0, 10)
            })

        } else {
            region.forEach(function(r) {
                var value = getValue(r) || 0.0
                var x0 = xoffset + xscale(r.From)
                var x1 = xoffset + xscale(r.To)
                var yv = yscale(value)
                if (yv < 0) {
                    yv = 0
                }
                ctx.globalAlpha = yv / barHeight
                ctx.fillRect(x0, 1, x1 - x0, 10)
            })
        }
    }


    var xscales, xoffsets, widths;



    var response = function(e) {
        var rdata = []
        regions.forEach(function(r, i) {
            e.forEach(function(d, j) {
                if (overlap(r, d)) {
                    var x = xscales[i](d.start) + xoffsets[i]
                    var l = xscales[i](d.end) + xoffsets[i] - x
                    rdata.push({
                        "x": x,
                        "l": l,
                        "color": d.color || null,
                    })
                }
            })
        })
        var r1 = respSvg.selectAll(".resp").data(rdata)
        var _height = barHeight + _font.height
        if (plotMode == "dense") {
            _height = 12 //TODO
        }
        r1.exit().remove()
        r1.enter()
            .append("rect")
            .classed("resp", true)
            .merge(r1)
            .attr("x", function(d) {
                //console.log("rx", d.x)
                return d.x
            })
            .attr("y", 0)
            .attr("height", _height)
            .attr("width", function(d) {
                return d.l
            })
            .attr("fill", function(d) {
                return d.color || highlight //TODO d.color
            })
            .attr("opacity", 0.2)


    }

    /* set max min 
     * call renderLongLabel
     * call renderRegion
     * replot function
     * */
    var plot = function(results) {
        var min = Infinity;
        var max = -Infinity;
        xscales = []
        xoffsets = []
        widths = []
        var yoffset = 0
        var offset = 0
        var totalLen = totalLength(regions)
        var effectWidth = width - (regions.length - 1) * gap
        regions.forEach(function(d) {
            var w = (+(d.end) - (+d.start)) * effectWidth / totalLen
            var scale = d3.scaleLinear().domain([+(d.start), +(d.end)]).range([0, w])
            xscales.push(scale)
            xoffsets.push(offset)
            offset += w + gap
            widths.push(w)
        })
        /* Get YScale  Max and Min */
        results.forEach(function(arr) {
            if (mode == 0 || mode == 2) {
                arr.forEach(function(d) {
                    var v = d.Max || d.Value
                    var vmin = d.Min || d.Value
                    if (v > max) {
                        max = v
                    }
                    if (vmin < min) {
                        min = vmin
                    }
                })
            } else {
                arr.forEach(function(d) {
                    var v = (d.Sum / d.Valid) || d.Value || 0.0
                    if (v > max) {
                        max = v
                    }
                    if (v < min) {
                        min = v
                    }
                })
            }

        })
        min = Math.min(0, min)
        max = Math.max(max, 0)
        if (autoscale == false) {
            min = vmin
            max = vmax
        }
        /* 
         * add customized max min 
         *
         *
         * */
        var yscale = d3.scaleLinear().domain([min, max]).range([0, barHeight]) //TODO?
        scale = yscale;
        var axisScale = d3.scaleLinear().domain([min, max]).range([barHeight, 0])
        //var colorScale = d3.scaleOrdinal(d3.schemeCategory10); // TODO here.
        var background = "#FFF"
        var ctx = canvas.node().getContext("2d");
        //switch modes here
        if (plotMode == "full") {
            ctx.fillStyle = background
            ctx.fillRect(x, y, width, barHeight)
            if (bg) {
                bgPlot(canvas.node())
            }
            renderLongLabel(ctx)
            results.forEach(function(region, i) {
                renderRegion(ctx, xoffsets[i], yoffset + _font.height, region, xscales[i], yscale, color)
            })
        } else if (plotMode == "dense") {
            ctx.fillStyle = background
            ctx.fillRect(x, y, width, 25)
            if (bg) {
                bgPlot(canvas.node())
            }
            results.forEach(function(region, i) {
                renderRegionDense(ctx, xoffsets[i], yoffset + _font.height, region, xscales[i], yscale, color)
            })
        }
        callback({
            "data": results,
            "min": min,
            "max": max
        })
    }
    var rawdata = false;

    /* get data and then call render */
    var getData = function(callback) {
        var q = []
        if (binsize != -1) {
            rawdata = false;
            if (binsize == undefined) {
                binsize = 1
            }
            regions.forEach(function(d) {
                q.push(
                    d3.json(URI + "/" + id + "/getbin/" + d.chr + ":" + d.start + "-" + d.end + "/" + binsize, sandInits)
                )
            })
        } else {
            rawdata = true;
            regions.forEach(function(d) {
                q.push(
                    d3.json(URI + "/" + id + "/get/" + d.chr + ":" + d.start + "-" + d.end, sandInits)
                )
            })
        }
        //TODO Remain Current Results
        Promise.all(q).then(function(r) {
            currentResults = r
            callback(r)
        })
    }

    /* entry point for render */
    var render = function() {
        var length = totalLength(regions)
        var url = URI + "/" + id + "/binsize/" + length + "/" + width
        d3.json(url, {
            credentials: 'include',
            headers: sandHeaders //TODO: global variable sandHeaders 
        }).then(function(d) {
            binsize = d;
            //console.log("binsize x1",d , length/width)
            getData(plot);
        }).catch(function(e) {
            console.log("catch bw", e)
        })
    }
    var chart = function(selection) { //selection is canvas;
        canvas = selection;
        panel.selectAll(".resp" + "_" + pos).remove(); //TODO
        respSvg = panel.append("svg")
            .classed("resp_" + pos, true)
            .style("postion", "absolute")
            .style("top", y)
            .style("left", x)
            .style("z-index", 2)
            .attr("width", width)
        if (plotMode == "full") {
            respSvg.attr("height", barHeight + _font.height)
        } else {
            respSvg.attr("height", 10) //TODO
        }
        render();
    }
    var modes = ["mix", "mean", "max"]
    chart.mode = function(_) {
        if (!arguments.length) {
            return modes[mode]
        } else {
            mode = 0
            if (_ == "max" || _ == 2) {
                mode = 2
            }
            if (_ == "mean" || _ == 1) {
                mode = 1
            }
            return chart
        }
    }
    chart.callback = function(_) {
        return arguments.length ? (callback = _, chart) : callback;
    }
    chart.panel = function(_) {
        return arguments.length ? (panel = _, chart) : panel;
    }
    chart.x = function(_) {
        return arguments.length ? (x = _, chart) : x;
    }
    chart.y = function(_) {
        return arguments.length ? (y = _, chart) : y;
    }
    chart.regions = function(_) {
        return arguments.length ? (regions = _, chart) : regions;
    }
    chart.width = function(_) {
        return arguments.length ? (width = _, chart) : width;
    }
    chart.height = function(_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.URI = function(_) {
        return arguments.length ? (URI = _, chart) : URI;
    }
    chart.barHeight = function(_) {
        return arguments.length ? (barHeight = _, chart) : barHeight;
    }
    chart.response = function(e) {
        response(e)
    }
    chart.highlight = function(_) {
        return arguments.length ? (highlight = _, chart) : highlight;
    }
    chart.id = function(_) {
        return arguments.length ? (id = _, chart) : id;
    }
    chart.pos = function(_) {
        return arguments.length ? (pos = _, chart) : pos;
    }
    chart.scale = function(_) {
        return arguments.length ? (scale = _, chart) : scale;
    }
    chart.gap = function(_) {
        return arguments.length ? (gap = _, chart) : gap;
    }
    chart.color = function(_) {
        return arguments.length ? (color = _, chart) : color;
    }
    chart.svg = function(_) {
        return arguments.length ? (respSvg = _, chart) : respSvg;
    }
    chart.longLabel = function(_) {
        return arguments.length ? (longLabel = _, chart) : longLabel;
    }
    chart.plotMode = function(_) {
        return arguments.length ? (plotMode = _, chart) : plotMode;
    }
    chart.vmax = function(_) {
        return arguments.length ? (vmax = _, chart) : vmax;
    }
    chart.vmin = function(_) {
        return arguments.length ? (vmin = _, chart) : vmin;
    }
    chart.autoscale = function(_) {
        return arguments.length ? (autoscale = _, chart) : autoscale;
    }
    chart.bg = function(_) {
        return arguments.length ? (bg = _, chart) : bg;
    }
    return chart
}
