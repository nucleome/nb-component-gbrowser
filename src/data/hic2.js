/*triangle hic */

import {
    default as constant
} from "./hicvar"
import {
    totalLength,
    regionString

} from "./funcs"
import font from "../shape/font"

import bgPlot from "./bgPlot"

import {
    renderTriangle,
    renderMatrix
} from "./hicUtils"

const units = constant().units
const norms = constant().norms
var _font = font()
export default {
    Get: function(URI, callback) {
        var ready = function(results) {
            //if (error) throw error;
            var config = {}
            config.URI = URI
            config.norms = results[0]
            config.units = results[1]
            config.chrs = results[2]
            config.chr2idx = {}
            config.chrs.forEach(function(d, i) {
                config.chr2idx[d.Name] = i
            })
            config.bpres = results[3]
            callback(config)
        }
        var p = ["norms", "units", "list", "bpres"]
        var q = []
        p.forEach(function(d) {
            q.push(
                //initData API
                d3.json(URI + "/" + d, sandInits)
            )
        })
    },
    chart: function() { //cfg chart
        var data
        var form
        var unitInput, normInput, oeInput, color1Input, color2Input
        var chart = function(selection) {
            selection.selectAll("*").remove();
            form = selection.append("div").classed("form-group", true)
            form.append("label").text("Normalized Method")
            normInput = form.append("select").classed("form-control", true)
            normInput.selectAll("option")
                .data(data.norms)
                .enter()
                .append("option")
                .attr("value", function(d, i) {
                    return d
                })
                .text(function(d, i) {
                    return norms[d]
                })
            form.append("label").text("Units")
            unitInput = form.append("select").classed("form-control", true)
            unitInput.selectAll("option")
                .data(data.units)
                .enter()
                .append("option")
                .attr("value", function(d, i) {
                    return d
                })
                .text(function(d, i) {
                    return units[d]
                })
            oeInput = form.append("checkbox")
            if (data.units.length == 1) {
                unitInput.property("disabled", true)
            }
            var colorInputDiv = form.append("div")
            colorInputDiv.append("label").text("Min")
            color1Input = colorInputDiv.append("input").attr("type", "color")
                .attr("value", "#ffffff")
            colorInputDiv.append("label").text("Max")
            color2Input = colorInputDiv.append("input").attr("type", "color")
                .attr("value", "#FF0000")

        }
        chart.state = function(_) {
            if (!arguments.length) {
                return {
                    "unit": unitInput.node().value,
                    "norm": normInput.node().value,
                    "oe": oeInput.node().value,
                    "color1": color1Input.node().value,
                    "color2": color2Input.node().value
                }
            } else {
                unitInput.node().value = _.unit || 0;
                normInput.node().value = _.norm || 0;
                oeInput.node().value = _.oe || false;
                color1Input.node().value = _.color1 || "#3F4498";
                color2Input.node().value = _.color2 || "#F00";
            }
        }
        chart.data = function(_) {
            return arguments.length ? (data = _, chart) : data;
        }
        return chart
    },
    /* HiC Canvas Render, Parameters Regions URI and Width Height, xoffset , yoffset */
    canvas: function() {
        /*parameters for canvas */
        var height;
        var width;
        var xoffset;
        var yoffset;
        var rotate = 0;
        var URI;
        var bg = false;

        /*parameters for hic data */
        var longLabel = ""
        var regions;
        var scales = [null, null]
        var bpres;
        var norm;
        var unit;
        var oe = false;

        /*auto load data */
        var resIdx;
        var min;
        var max;
        var mats;
        var cellSize;
        var offsets;
        var canvas;
        var svg;
        var panel;
        var minRes;
        var id = "hic";
        var gap = 20 / Math.SQRT2
        var emit = function(d) {
            console.log("emit")
        }


        var generateQueryUrl = function(d) {
            var cmd = "get2dnorm"
            if (oe) {
                cmd = "get2doe"
            }
            var a = regions[d[0]]
            var b = regions[d[1]]
            var url = "/" + cmd + "/" + regionString(a) + "/" + regionString(b) + "/" + resIdx + "/" + norm + "/" + unit + "/text"
            return url
        }
        /*TODO TO Triangle  x, y change? which should be region 1. after 3/4 rotate*/
        var color1
        var color2
        var color3 //for inter chromosome
        var color4 //for inter chromosome
        var background = "#FFF"
        var lineColor = "#FF0"
        var domain = undefined;
        var render = function(_) {
            var ctx = canvas.node().getContext("2d");
            ctx.fillStyle = background
            ctx.fillRect(0, 0, width, height)
            if (bg) {
                bgPlot(canvas.node())
            }
            ctx.fillStyle = "#111"
            ctx.font = _font.font
            ctx.fillText(longLabel, 10, 10) //TODO
            ctx.save()
            ctx.translate(xoffset, yoffset)
            //ctx.rotate(rotate)
            //ctx.fillRect(0, 0, width, height)
            var color
            var grdStart = 70
            var grdWidth = Math.round(width / 6)
            var grd = ctx.createLinearGradient(grdStart, 0, grdStart + grdWidth, 0)


            if (oe) { //add background color if many zeros.

                var pcolor = d3.scaleLinear().domain([0, Math.log(max)]).range(["#ffffff", color2])
                var ncolor = d3.scaleLinear().domain([0, Math.log(max)]).range(["#ffffff", color1])
                var color0 = color1
                if (domain) {
                    pcolor.domain([0, Math.log(domain[1])])
                    ncolor.domain([0, Math.log(domain[1])])
                    if (domain[0] >= 1) {
                        color0 = "#ffffff"
                        ncolor = function(_) {
                            return "#ffffff"
                        }
                        ncolor.range = function() {}
                        pcolor.domain([Math.log(domain[0]), Math.log(domain[1])])
                    }
                }
                color = function(d) {
                    if (d == 0) {
                        return color0 //color0
                    }
                    if (d < 1) {
                        return ncolor(-Math.log(d))
                    } else {
                        return pcolor(Math.log(d))
                    }
                }
                color.range = function(d) {
                    if (arguments.length == 0) {
                        var p = pcolor.range();
                        var n = ncolor.range();
                        return [n[1], n[0], p[1]]
                    } else {
                        pcolor.range(d)
                        ncolor.range(d)
                        return color

                    }
                }
            } else {

                if (domain) { //Try This Change Later.
                    var pcolor = d3.scaleLog().domain([domain[0] + 1.0, domain[1] + 1.0]).range(["#ffffff", color2]) //TODO set scale.
                } else {
                    var pcolor = d3.scaleLog().domain([min + 1.0, max + 1.0]).range(["#ffffff", color2]) //TODO set scale.
                }
                color = function(d) {
                    return pcolor(d + 1.0)
                }
                color.range = function(d) {
                    if (arguments.length == 0) {
                        return pcolor.range()
                    } else {
                        pcolor.range(d)
                        return color
                    }
                }
            }



            var colorScale = function(d) {
                if (isNaN(d)) {
                    return "#FFF" //color(0)
                } else {
                    return color(d)
                }
            }
            colorScale.range = function(d) {
                if (arguments.length == 0) {
                    return color.range()
                } else {
                    color.range(d)
                    return colorScale
                }
            }
            //ADD Render Color Bar HERE


            var l = regions.length;

            var k = 0;
            //renderAxis(ctx)

            var se = [];
            regions.forEach(function(d, i) {
                se.push(correctedPosition(d.start, d.end, resIdx))
            })
            var binsize = bpres[resIdx]

            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    var x = offsets[i];
                    var y = offsets[j];
                    if (i == j) {
                        renderTriangle(ctx, x, 0, mats[k], cellSize / Math.SQRT2, colorScale, regions[i], se[i], binsize)
                    } else {
                        renderMatrix(ctx, y / Math.SQRT2, x / Math.SQRT2, mats[k], cellSize / Math.SQRT2, colorScale, regions[i], se[i], regions[j], se[j], binsize)
                    }
                    k += 1;
                }
            }
            ctx.restore()

            ctx.fillStyle = "#555"
            ctx.fillText(norms[norm], 20, 30)
            if (oe) {
                ctx.fillText("OE", 20, 45)
            }
            ctx.fillText(d3.format(".2s")(bpres[resIdx]), 20, 60)

            /*GRD */

            //TODO GRD TEXT
            ctx.fillStyle = "#000"
            var _max = max
            var _min = 0
            if (typeof domain !== "undefined") {
                _max = domain[1] || max
                _min = domain[0] || _min
            }
            if (oe) {
                var _max1 = Math.round(Math.log2(_max) * 100) / 100
                var _min1 = -_max1
                if (_min >= 1) {
                    grd.addColorStop(0, "#ffffff")
                    grd.addColorStop(1, color2)
                    _min1 = Math.round(Math.log2(_min) * 100) / 100
                    ctx.fillText(_min1, grdStart, 55)
                    var s = _max1 + ""
                    ctx.fillText(_max1, grdStart + grdWidth - _font.width * s.length, 55)
                } else {
                    grd.addColorStop(0, color1)
                    grd.addColorStop(0.5, "#ffffff")
                    grd.addColorStop(1, color2)
                    ctx.fillText(_min1, grdStart, 55)
                    var s = _max1 + ""
                    ctx.fillText(_max1, grdStart + grdWidth - _font.width * s.length, 55)
                }
                ctx.fillText("log2 scale", grdStart, 30)

            } else {
                grd.addColorStop(0, "#ffffff")
                grd.addColorStop(1, color2)
                ctx.fillText("log10 scale", grdStart, 30)
                var _max2 = Math.round(Math.log10(_max) * 100) / 100
                var _min2 = _min
                if (_min >= 1) {
                    var _min2 = Math.round(Math.log10(_min) * 100) / 100
                }
                ctx.fillText(_min2, grdStart, 55)
                var s = _max2 + ""
                ctx.fillText(_max2, grdStart + grdWidth - _font.width * s.length, 55)
            }
            ctx.fillStyle = grd;
            ctx.fillRect(grdStart, 35, grdWidth, 10)

            if (!arguments.length) {
                callback({
                    "resolution": bpres[resIdx],
                    "max": max,
                    "min": min
                }) //callback to send parameters

            } else {
                if (typeof _ === 'function') {
                    _();
                }
            }

        }



        var callback = function(d) {
            //console.log(d)
        }

        var df = 0;

        var dataReady = function(results) {
            //console.log(results)
            //TODO callback(results)
            min = Infinity
            max = -Infinity
            mats = []
            results.forEach(function(text, i) {
                // TODO text == "key not found"
                var data = d3.tsvParseRows(text).map(function(row) {
                    return row.map(function(value) {
                        var v = +value
                        if (min > v) {
                            min = v
                        }
                        if (max < v) {
                            max = v
                        }
                        return v;
                    });
                });
                //console.log(data);
                mats.push(data)

            })
            if (min == Infinity) {
                //  TODO ADD
                df += 1
                loadData(df)
            } else {
                render();
                df = 0;
            }
            //console.log("min,max", min, max)
            //TODO Call Render Function;
        }


        var regionsToResIdx = function(regions, width, height, minRes) {
            var w = Math.min(width, height)
            var eW = w - gap * (regions.length - 1)
            var l = totalLength(regions)
            var pixel = l / eW;
            var pixel2 = pixel * Math.SQRT2;
            var resIdx = bpres.length - 1
            for (var i = 0; i < bpres.length; i++) {
                if (bpres[i] < pixel2) {
                    resIdx = i - 2;
                    break;
                }
                if (minRes && bpres[i] == minRes) {
                    resIdx = i;
                    break;
                }
                if (minRes && bpres[i] < minRes) {
                    resIdx = i - 1;
                    break;
                }
            }
            // correct one step for oe
            if (l / bpres[resIdx] > 4000) { //for blockMatrix limition
                resIdx -= 1
            }
            if (resIdx < 0) {
                resIdx = 0
            }
            return resIdx
        }
        var setCellSize = function(resIdx, width, height, regions){
            var w = Math.min(width, height)
            var eW = w - gap * (regions.length - 1)
            var l = totalLength(regions)
            cellSize = eW / (l / bpres[resIdx])
            //  console.log(w, l, bpres[resIdx], cellSize)
            offsets = []
            var offset = 0.0;
            regions.forEach(function(d, i) {
                offsets.push(offset)
                offset += cellSize * ((+d.end - d.start) / bpres[resIdx]) + gap
            })

        }
        var correctedPosition = function(start, end, resIdx) {
            var binsize = bpres[resIdx];
            return [Math.floor(start / binsize) * binsize, (Math.floor((end - 1) / binsize) + 1) * binsize]
        }
        var loadData = function(o) {
            var l = regions.length
            var pairs = []
            for (var i = 0; i < l; i++) {
                for (var j = i; j < l; j++) {
                    pairs.push([i, j])
                }
            }
            resIdx = regionsToResIdx(regions, width, height, minRes) // TODO with width and length parameters
            if (arguments.length > 0) {
                resIdx -= o
            }
            setCellSize(resIdx, width, height, regions)
            //console.log("smart resIdx", resIdx)
            //d3.select("#bpRes").text(bpres[resIdx]) //TODO
            if (resIdx < 0) {
                df = 0
                return
            }
            var q = []
            // /get2dnorm/{chr}:{start}-{end}/{chr2}:{start2}-{end2}/{resIdx}/{norm}/{unit}/{format}
            pairs.forEach(function(d, i) {
                //getData API
                var url = generateQueryUrl(d)
                q.push(
                    d3.text(URI + url, sandInits)
                )
            })
            //TODO FIX NaN 
            Promise.all(q).then(dataReady);
        }
        var chart = function(selection) { //selection is canvas itself;
            canvas = selection;
            //panel = d3.select("#main") //TODO
            //cleanBrush();
            //add loading... here
            //render done.
            loadData();
        }
        chart.render = render; //TODO change name later.
        /*
        chart.loadData = function(callback) {
          loadData()
          return chart;
        }
        */
        chart.panel = function(_) {
            return arguments.length ? (panel = _, chart) : panel;
        }
        chart.svg = function(_) {
            return arguments.length ? (svg = _, chart) : svg;
        }
        chart.domain = function(_) {
            return arguments.length ? (domain = _, chart) : domain;
        }

        chart.height = function(_) {
            return arguments.length ? (height = _, chart) : height;
        }
        chart.width = function(_) {
            return arguments.length ? (width = _, chart) : width;
        }
        chart.xoffset = function(_) {
            return arguments.length ? (xoffset = _, chart) : xoffset;
        }
        chart.yoffset = function(_) {
            return arguments.length ? (yoffset = _, chart) : yoffset;
        }
        chart.regions = function(_) {
            return arguments.length ? (regions = _, chart) : regions;
        }
        chart.norm = function(_) {
            return arguments.length ? (norm = _, chart) : norm;
        }
        chart.unit = function(_) {
            return arguments.length ? (unit = _, chart) : unit;
        }
        chart.bpres = function(_) {
            return arguments.length ? (bpres = _, chart) : bpres;
        }
        chart.oe = function(_) {
            return arguments.length ? (oe = _, chart) : oe;
        }
        chart.URI = function(_) {
            return arguments.length ? (URI = _, chart) : URI;
        }
        chart.color1 = function(_) {
            return arguments.length ? (color1 = _, chart) : color1;
        }
        chart.color2 = function(_) {
            return arguments.length ? (color2 = _, chart) : color2;
        }
        chart.background = function(_) {
            return arguments.length ? (background = _, chart) : background;
        }
        chart.emit = function(_) {
            return arguments.length ? (emit = _, chart) : emit;
        }
        chart.callback = function(_) {
            return arguments.length ? (callback = _, chart) : callback;
        }
        chart.rotate = function(_) {
            return arguments.length ? (rotate = _, chart) : rotate;
        }
        chart.gap = function(_) {
            return arguments.length ? (gap = _, chart) : gap;
        }
        chart.id = function(_) {
            return arguments.length ? (id = _, chart) : id;
        }
        chart.minRes = function(_) {
            return arguments.length ? (minRes = _, chart) : minRes;
        }
        chart.longLabel = function(_) {
            return arguments.length ? (longLabel = _, chart) : longLabel;
        }
        chart.bg = function(_) {
            return arguments.length ? (bg = _, chart) : bg;
        }
        return chart;
    }

}
