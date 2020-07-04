import H from "../data/hic2"
import toolsTrimChrPrefix from "../tools/trimChrPrefix"
import {
    default as constant
} from "../data/hicvar"
import datgui from "../datgui"
import scaleScope from "../scaleScope"
//
//import scaleScope from "../data/coords.js"
import symbolTriangle from "../symbol/triangle"

import toolsAddChrPrefix from "../tools/addChrPrefix"

import brush from "../scopebrush"
import font from "../shape/font"
import * as d3 from "d3"
var _font = font()
const norms = constant().norms
const units = constant().units
const hicColor1 = "#3F4498"
const hicColor2 = "#FF0000"
var respOpacity = 0.18
var autoFormat = d3.format(".0s");

export default function () {
    var regions
    var canvas

    var modal
    var mask
    var dispatch
    var _dispatch = d3.dispatch("domain", "monitor")

    var render
    var init
    var scope
    var state
    var width
    var svg
    var loadDiv
    var scale
    var isCtrl = false;
    var inBrush = false;
    var brushRegion
    var highlight = "#000"
    var bg = false;
    var datum = {}

    var callback = function (_) {
        console.log(_)
    }

    var chart = function (selection) {
        selection
            .on("mouseover", function () {
                isCtrl = true;
            })
            .on("mouseout", function () {
                isCtrl = false;
            })

        var d = selection.datum()
        datum = d
        //TODO _domain_ and _previousRes_ to state
        if (scope.edge <= 0) {
            return
        }

        /* Loading Div For Hic Track */
        d3.select(canvas.node().parentNode).selectAll(".loader").remove()
        loadDiv = d3.select(canvas.node().parentNode)
            .append("div")
            .classed("loader", true)
            .style("position", "absolute") //TODO FOR Width Mask
            .style("left", 3 * width / 8)
            .style("top", width / 8)
            .style("width", width / 4)
            .style("height", width / 4)
        //.style("border","16px")

        var hicCb = function (d) {
            loadDiv.style("display", "none")
            if (state._previousRes_ && (state._previousRes_ == d.resolution)) {
                if (typeof state._domain_ !== "undefined") {
                    render.domain(state._domain_)
                    render.render(function () {});
                }

            } else {
                state._previousRes_ = d.resolution
                state._domain_ = undefined
            }
            _dispatch.call("monitor", this, d)

            // TODO : add this to monitor too or add this to render?
            callback({
                code: "done"
            })
            //color 1 and color 2 and value here.
        }
        var server = d.server || state.server || scope.server || ""
        var ctx = canvas.node().getContext("2d")
        ctx.fillStyle = "#29468e"
        ctx.fillText("LOADING...", 20, 10)
        render = H.canvas() //just for canvas view.
            .URI(server + "/" + d.prefix + ".hic/" + d.id)
            .norm(state.norm || 0)
            .unit(state.unit || 0)
            .oe(state.oe || false)
            .bpres(init.bpres)
            .xoffset(0)
            .yoffset(scope.edge * 0.5)
            .width(scope.edge)
            .height(scope.edge)
            .regions(toolsTrimChrPrefix(regions))
            .panel(selection)
            .gap(10)
            .bg(bg)
            .color1(state.color1 || hicColor1) //TODO: color1 as negative value
            .color2(state.color2 || hicColor2)
            .minRes(state.min_bp || undefined)
            .id(d.id)
            .longLabel(d.longLabel || d.id)
            .callback(hicCb)

        selection.selectAll("svg").remove();
        svg = selection.append("svg")
        svg.attr("width", scope.edge > 0 ? scope.edge : 0)
            .attr("height", scope.edge > 0 ? scope.edge / 2 : 0)

        if (d.metaLink) {
            svg.selectAll(".metalink").remove()
            svg.append("g")
                .classed("metalink", true)
                .attr("transform", "translate(10,0)")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", 10)
                .attr("width", (d.longLabel.length || d.id.length) * _font.width)
                .attr("opacity", 0.0)
                .on("click", function () {
                    window.open(d.metaLink)
                })
                .on("mouseover", function () {
                    d3.select(this).attr("opacity", 0.1)
                })
                .on("mouseout", function () {
                    d3.select(this).attr("opacity", 0.0)
                })
        }

        var div1 = selection.append("div").style("position", "absolute").style("top", 10)
            .style("left", 3 * width / 4)
            .style("width", width / 4)
            .style("height", width / 4)
            .style("font-size", "10px")


        scale = scaleScope()
            .domain(regions)
            .range([0, scope.edge])
        var scopebrush = brush().width(scope.edge)
            .on("start", function () {
                inBrush = true
                svg.selectAll(".resp").style("display", "none")
                svg.selectAll(".resp2").style("display", "none")
                svg.selectAll(".selection").style("display", "")
            })
            .on("brush", function (d0) {
                brushRegion = toolsAddChrPrefix(d0)
                dispatch.call("brush", this, brushRegion)
            })
            .on("contextmenu", function (d0) {
                dispatch.call("update", this, toolsAddChrPrefix(d0))
            })
            .on("end", function (d0) {
                inBrush = false
            }).regions(regions)
        svg.append("g")
            .classed("scopebrush", true)
            .call(scopebrush)
        // Detect Previous Domain Here? render.domain()??
        canvas.call(render)

        var toLog = function(d, p) {
            return Math.log(d+p)
        }
        var toExp = function(d,p) {
            return Math.exp(d) - p
        }
        _dispatch.on("monitor", function (d) {
            div1.html("")
            if (!state.oe) {
                var k0 = div1.append("div")
                    .style("padding-right", "20px")
                var k1 = k0.append("div")
                var k2 = k0.append("div").style("padding-top", "5px")
                var minI = k2.append("input").attr("type", "text").style("width", "50px").style("text-align", "right")
                k2.append("span").text(" - ")
                var maxI = k2.append("input").attr("type", "text").style("width", "50px")

                var max = Math.log(d.max)
                var min
                var v = d.max > 30000 ? 30000 : max
                min = 0
                minI.node().value = Math.exp(min) -1 
                maxI.node().value = v - 1
                //TODO oe slider :TODO
                /* IMPROVE SLIDER TO LOG SCALE*/
                // Add Call Back Ctrl Slidera
                var values = [toLog(min,1),toLog(max,1)]
                if (state._domain_) {
                    values = [toLog(state._domain_[0],1),toLog(state._domain_[1],1)]
                    minI.node().value = state._domain_[0]
                    maxI.node().value = state._domain_[1]
                }

                $(k1.node()).slider({
                    range: true,
                    min: toLog(min,1),
                    max: toLog(max,1),
                    values: values,
                    step: 0.01,
                    slide: function (event, ui) {
                        minI.node().value = toExp(ui.values[0],1),
                        maxI.node().value = toExp(ui.values[1],1),
                        _dispatch.call("domain", this, [toExp(ui.values[0],1), toExp(ui.values[1],1)])
                    }
                });
                minI.on("keydown", function () {
                    minI.style("background-color", "lightyellow")
                    if (event.key == "Enter") {
                        minI.style("background-color", "white")
                        var _min = parseFloat(minI.node().value)
                        var _max = parseFloat(maxI.node().value)
                        $(k1.node()).slider("values", [toLog(_min,1), toLog(_max,1)])
                        _dispatch.call("domain", this, [_min, _max])
                    }
                })
                maxI.on("keydown", function () {
                    maxI.style("background-color", "lightyellow")
                    if (event.key == "Enter") {
                        var _min = parseFloat(minI.node().value)
                        var _max = parseFloat(maxI.node().value)
                        maxI.style("background-color", "white")
                        $(k1.node()).slider("values", [toLog(_min,1), toLog(_max,1)])
                        _dispatch.call("domain", this, [_min,_max])
                    }
                })

            } else { //state.oe
                var k0 = div1.append("div")
                    .style("padding-right", "20px")
                var k1 = k0.append("div")
                var k2 = k0.append("div").style("padding-top", "5px")
                var minI = k2.append("input").attr("type", "text").style("width", "50px").style("text-align", "right")
                k2.append("span").text(" - ")
                var maxI = k2.append("input").attr("type", "text").style("width", "50px")

                var max = Math.log(d.max)
                var min = - max
                var v = d.max
               //TODO oe slider :TODO
                /* IMPROVE SLIDER TO LOG SCALE*/
                //var values = [min,v]
                if (state._domain_) {
                    minI.node().value = Math.round(state._domain_[0]*100)/100
                    maxI.node().value = Math.round(state._domain_[1]*100)/100
                } else {
                    minI.node().value = Math.round(Math.exp(min)*100)/100
                    maxI.node().value = Math.round(Math.exp(max)*100)/100
                } 
                
               

                $(k1.node()).slider({
                    range: true,
                    min: min,
                    max: max,
                    values: [Math.log(minI.node().value), Math.log(maxI.node().value)],
                    step: 0.01,
                    slide: function (event, ui) {
                        minI.node().value = Math.round(Math.exp(ui.values[0])*100)/100,
                        maxI.node().value = Math.round(Math.exp(ui.values[1])*100)/100,
                        _dispatch.call("domain", this, [Math.exp(ui.values[0]), Math.exp(ui.values[1])])
                    }
                });
                minI.on("keydown", function () {
                    minI.style("background-color", "lightyellow")
                    if (event.key == "Enter") {
                        var _min = parseFloat(minI.node().value)
                        var _max = parseFloat(maxI.node().value)
                        minI.style("background-color", "white")
                        $(k1.node()).slider("values", [toLog(_min,0),toLog(_max,0)])
                        _dispatch.call("domain", this, [_min,_max])
                    }
                })
                maxI.on("keydown", function () {
                    maxI.style("background-color", "lightyellow")
                    if (event.key == "Enter") {
                        maxI.style("background-color", "white")
                        var _min = parseFloat(minI.node().value)
                        var _max = parseFloat(maxI.node().value)
                        $(k1.node()).slider("values", [toLog(_min,0),toLog(_max,0)])
                        _dispatch.call("domain", this, [_min,_max])
                    }
                })


            }

        })

        _dispatch.on("domain", function (d) {
            state._domain_ = d // undefined it if resolution or config changed.
            render.domain(d); //local render.
            render.render(function () {});
        })

    }
    chart.config = function () {
        modal.selectAll("div").remove();
        var cfg = modal.append("div")
   
        var datIO = datgui().closable(false);
        var _state = JSON.parse(JSON.stringify(state))
        //console.log(d3.select(this).datum())
        var opts = {
            "alias" : _state["alias"] || "",
            "color2": _state["color2"] || hicColor2,
            "color1": _state["color1"] || hicColor1
        }
        /*
        opts["unit"] = {}
        init.units.forEach(function (d) {
          var k = units[d]
          opts["unit"][k] = d
        })
        */
        opts["norm"] = {}
        if ("norms" in init && init.norms !== null) {
            init.norms.forEach(function (d) {
            //opts.norms.push({norms[d]:d})
                var k = norms[d]
                opts["norm"][k] = d
            })
        } else {
            opts["norm"]["NONE"] = 0
        }
        opts["oe"] = _state.oe || false
        opts["min_bp"] = {}
        init.bpres.forEach(function (d) {
            opts["min_bp"][d] = d
        })
       cfg.selectAll(".title").remove();
       cfg.append("div").classed("title",true).text(datum.longLabel || datum.id)
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
        cfg.selectAll(".submit").remove();
        cfg.append("input")
            .attr("type", "button")
            .classed("submit", true)
            .attr("value", "submit")
            .on("click", function (d0) {
                state = JSON.parse(JSON.stringify(_state))
                state._domain_ = undefined
                render
                    .norm(state.norm)
                    //.unit(state.unit)
                    .unit(0)
                    .oe(state.oe)
                    .color1(state.color1)
                    .color2(state.color2)
                    .minRes(state.min_bp)
                render.domain(undefined)
                loadDiv.style("display", null)
                canvas.call(render)
                //TODO Update Response BigWig
                mask.style("display", "none")
                modal.style("display", "none");
                callback({
                    "code": "state",
                    "data": state
                })
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
    chart.brush = function (d) {
        //var svg = hicResp[k]

        if (!svg || !scale) {
            return
        }
        if (inBrush) {
            return;
        }
        /* Test This */
        if (isCtrl) {
            return 
        }
        //var fill = d.color || d[0].color || highlight
        var fill = highlight
        if (d.length > 0 && (typeof d[0].color != "undefined")) {
            fill = d[0].color
        }
        if (typeof d.color != "undefined") {
            fill = d.color
        }
        brushRegion = d
        var data = []
        var rectData = []
        d.forEach(function (d) {
            var v = scale(d)
            if (v.length > 0) {
                data.push(v)
            }
        })
        svg.selectAll(".selection").style("display", "none"); //TODO ???
        svg.selectAll(".resp").style("display", "")
        svg.selectAll(".resp2").style("display", "")
        //assume data is sorted. 
        //TODO for more than two regions respond
        // * START 
        var r2 = svg.selectAll(".resp2")
            .data([0])
        r2 = r2.enter()
            .append("g")
            //TODO
            .classed("resp2", true)
            //.classed("resp",true)
            .attr("transform", function (d) {
                return "translate(" + (scope.edge / 2) + ",0) rotate(45)"
            })
            .merge(r2)
            .on("contextmenu", function () {
                d3.event.preventDefault();
                dispatch.call("update", this, brushRegion)
            })
        var _d = []
        r2.selectAll("rect").remove()
        if (data.length > 1) {
            for (var i = 0; i < data.length; i++) {
                for (var j = i + 1; j < data.length; j++) {
                    var rx = data[i][0][0] / Math.SQRT2
                    var rWidth = data[i][0][1] / Math.SQRT2 - rx
                    var ry = data[j][0][1] / Math.SQRT2
                    var rHeight = ry - data[j][0][0] / Math.SQRT2
                    ry = scope.edge / Math.SQRT2 - ry
                    var _d0 = {
                        "x": rx,
                        "y": ry,
                        "width": rWidth,
                        "height": rHeight
                    }
                    if ( typeof data[i][0].color !== "undefined" && typeof data[j][0].color !== "undefined") {
                        _d0.color = "black" //TODO Calc Merge Color
                    }

                    _d.push(_d0)
                }
            }
            var p2 = r2.selectAll("rect")
                .data(_d)
            p2.enter()
                .append("rect")
                .merge(p2)
                .attr("x", function (d) {
                    return d.x
                })
                .attr("y", function (d) {
                    return d.y
                })
                .attr("width", function (d) {
                    return d.width
                })
                .attr("height", function (d) {
                    return d.height
                })
                .attr("opacity", respOpacity)
                .attr("fill",function(d){
                    return d.color || fill
                    //return "blue"//testColor 
                }) //fill function.
            p2.exit().remove()
        }


        /* END OF HIC CROSS HIGHLITE */

        var r = svg.selectAll(".resp")
            .data(data)
        r.exit().remove();
        r = r.enter()
            .append("g")
            .classed("resp", true)
            .merge(r)
            .attr("transform", function (d) {
                return "translate(" + (d[0][0]) + "," + scope.edge / 2 + ")"
            })
            .on("contextmenu", function () {
                d3.event.preventDefault();
                dispatch.call("update", this, brushRegion)
            })


        var p = r.selectAll("path").data(function (d) {
            return [d[0]]
        })
        p = p.enter()
            .append("path")
            .merge(p)
            .attr("d",
                d3.symbol().type(symbolTriangle).size(function (d) {
                    return d[1] - d[0]
                })
            )
            .attr("fill", function(d){
                return d.color || fill
            })
            .attr("opacity", respOpacity)
            .on("contextmenu", function () {
                d3.event.preventDefault();
                dispatch.call("update", this, brushRegion)
            })
    }


    chart.state = function (_) {
        return arguments.length ? (state = _, chart) : state;
    }
    chart.modal = function (_) {
        return arguments.length ? (modal = _, chart) : modal;
    }
    chart.mask = function (_) {
        return arguments.length ? (mask = _, chart) : mask;
    }
    chart.width = function (_) {
        return arguments.length ? (width = _, chart) : width;
    }

    chart.render = function (_) {
        return arguments.length ? (render = _, chart) : render;
    }
    chart.canvas = function (_) {
        return arguments.length ? (canvas = _, chart) : canvas;
    }
    chart.regions = function (_) {
        return arguments.length ? (regions = _, chart) : regions;
    }
    chart.callback = function (_) {
        return arguments.length ? (callback = _, chart) : callback;
    }

    chart.scope = function (_) {
        return arguments.length ? (scope = _, chart) : scope;
    }
    chart.init = function (_) {
        return arguments.length ? (init = _, chart) : init;
    }
    chart.dispatch = function (_) {
        return arguments.length ? (dispatch = _, chart) : dispatch;
    }

    chart.bg = function (_) {
        return arguments.length ? (bg = _, chart) : bg;
    }
    return chart

}
