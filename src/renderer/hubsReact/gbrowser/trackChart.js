import renderLabel from "./renderLabel"

import smartFillText from "./smartFillText"
import vars from "./vars"
import font from "../../../shape/font"

import fixRegions from "../../../tools/fixRegions"
var labelWidth = vars.labelWidth
var _font = font()
var fontstyle = font().font
var labelColor = vars.labelColor
export default function() {
    var container
    var stateMap
    //TODO AliasMap or State With Alias
    var dispatch
    var popup
    var tracks
    var chrtrack
    var scaletrack
    var content
    var contentDiv

    var scope
    var scopeCfgs
    var scopeBuffers

    var managerChart
    var mask
    var modal

    var configCharts
    var chartsMap
    var code

    var tracksRender
    var regions
    var getGlobal

    var bg = false;

    var initMap

    var _dispatch
    var heights
    var state

    var _stacks
    var managerChart

    var chart = function(selection) { //selection is TR
        var groups = {};
        selection.each(function(d) {
            var tr = d3.select(this)
            tr.selectAll("*").remove(); //TODO.
            tr.attr("id", code(d))
            var label, view, viewDiv, canvas;
            var stateL = stateMap[d.id] || {};
            var _height = stateL["height"] || heights[d.format]
            if (stateL.mode && stateL.mode == "dense") {
                _height = 12;
            }
            var contextmenu = function() {
                d3.event.preventDefault();
                if (popup.main.style("display") != "none") {
                    popup.main.style("display", "none")
                } else {
                    var mousePosition = d3.mouse(content.node())
                    popup.main.style("left", (mousePosition[0] + 10) + "px")
                        .style("top", mousePosition[1] + "px")
                    if (container.height - mousePosition[1] < 168) {
                        popup.main.style("top", (mousePosition[1] - 168) + "px")
                    }
                    popup.main.style("display", "block")
                    popup.cfg.on("click", function() {
                        popup.main.style("display", "none");
                        mask.style("display", "block")
                        modal.style("display", "block")
                        //.style("text-align","center")
                        //modal.style("top", -$(contentDiv.node()).offset().top + 90)
                        //mask.style("top", -$(contentDiv.node()).offset().top + 55)
                        //modal call config chart.
                        modal.style("top",45 + "px")
                        mask.style("top",0 + "px")
                        if (d.format in configCharts) {
                            configCharts[d.format](d, viewDiv, canvas, chartsMap[d.id]) //modal call config chart. ( d, viewDiv and Canvas)
                        } else {
                            tracks[d.id].config();
                        }
                    })
                    if (d.format == "bigbed") {
                        popup.dense.style("display", null)
                        popup.full.style("display", null)
                        popup.highlight.style("display", null)
                        popup.dense.on("click", function() {
                            popup.main.style("display", "none");
                            tracks[d.id].mode("dense")
                        })
                        popup.full.on("click", function() {
                            popup.main.style("display", "none");
                            tracks[d.id].mode("full")
                        })
                        popup.highlight.on("click", function() {
                            if (d.id in scopeBuffers) {
                                var beds = fixRegions(scopeBuffers[d.id].o.data.beds)
                                dispatch.call("brush", this, beds)
                            }
                            popup.main.style("display", "none");
                        })
                    } else if (d.format == "bigwig") {
                        popup.dense.style("display", "none")
                        popup.full.style("display", "none")
                        popup.highlight.style("display", "none")
                    } else {
                        popup.dense.style("display", "none")
                        popup.full.style("display", "none")
                        popup.highlight.style("display", "none")
                    }
                    if (d.format == "binindex") {
                        //TODO
                    }

                    popup.hide.on("click", function() {
                        //TODO Here
                        popup.main.style("display", "none");
                        tr.remove();
                        managerChart.del(d) //TODO
                        var newTrackViews = []
                        var trackViews = getGlobal("trackViews")
                        trackViews.forEach(function(d0) {
                            var a = d.id || d;
                            var b = d0.id || d0;
                            if (a != b) {
                                newTrackViews.push(d0)
                            }
                        })
                        trackViews = newTrackViews;
                        state.trackViews = trackViews;
                        container.setState(state)
                        dispatch.call("updateTracks", this, trackViews)
                    })


                }
            }
            label = tr
                .append("td").classed("trackLabel", true)
                .style("width", labelWidth + "px")
                .style("height", _height + "px")
                .style("position", "relative")
                .on("contextmenu", contextmenu)
            var labelDiv = label.append("div").classed("labelDiv", true)
                .style("position", "absolute")
                .style("top", 0 + "px")
                .style("left", 0 + "px")
                .style("height", "100%")
                .style("width", labelWidth + "px")
                .style("padding-right", "0px")
            label.append("div").classed("m1", true)
                .style("position", "absolute")
                .style("top", 0 + "px")
                .style("left", 0 + "px")
                .style("height", "100%")
                .style("width", labelWidth + "px")
                .style("opacity", "0.2")
                .style("background-color", "green")
                .style("display", "none")
            var _over = function() {
                if (!getGlobal("inDragRow")) {
                    var p = tr.node().parentNode;
                    label.selectAll(".m1").style("display", null)
                    viewDiv.append("div").classed("m", true)
                        .style("height", "100%")
                        .style("width", "100%")
                        .style("opacity", "0.2")
                        .style("background-color", "green")
                }
            }
            var _end = function() {
                if (!getGlobal("inDragRow")) {
                    label.selectAll(".m1").style("display", "none");
                    viewDiv.selectAll(".m").remove();
                }

            }

            label.on("mouseover", function() {
                    _over();
                })
                .on("touchstart", function() {
                    _over();
                })
                .on("mouseout", function() {
                    _end();
                })
                .on("touchend", function() {
                    _end();
                })

            var labelCanvas = labelDiv.append("canvas").attr("width", labelWidth).attr("height", _height)
            renderLabel(d, stateMap, labelCanvas, labelDiv, fontstyle, _height)

            view = tr
                .append("td")
                .classed("trackView", true)
                .style("width", scope.edge)
                .style("height", _height + "px")
                .on("contextmenu", function() {
                    d3.event.preventDefault();
                })
            viewDiv = view
                .append("div")
                .classed("viewDiv", true)
                .style("position", "relative")
                .style("height", "100%")
                .style("width", "100%")
                .style("padding-right", "0px")
                .style("background-color", "#FFFFFF")
            canvas = viewDiv
                .append("canvas")
                .classed("canvas", true)
                .attr("width", scope.edge)
                .attr("height", _height)
            var ctx = canvas.node().getContext("2d")
            ctx.fillStyle = "#FFFFFF" //Backcground color

            ctx.fillRect(0, 0, scope.edge, _height)

            //SEPARATE TO GROUPS PROMISE 
            if (d.format in tracksRender) {
                tracks[d.id] = tracksRender[d.format]()
                    .regions(regions) //set regions in tracks TODO add zoomOutFactor
                    .canvas(canvas)
                    .modal(modal)
                    .mask(mask)
                    .scope(scope)
                    .dispatch(dispatch) //track chart are listening to dispatch
                    .width(scope.edge)
                    .init(initMap[d.id] || {})
                    .state(stateL)
                    .bg(bg)
                    .callback(function(_) {
                        //TODO ADD Multiple Codes
                        //Formalize Callback Codes
                        //Return Data to Scopes  
                        Object.keys(scopeCfgs).forEach(function(k) {
                            if (scopeCfgs[k] == d.id) {
                                dispatch.call("scope", this, {
                                    "d": d,
                                    "i": k,
                                    "o": _
                                })
                            }
                            scopeBuffers[d.id] = {
                                "d": d,
                                "o": _
                            }
                        })
                        if (_.code == "height") { //code for bigbed and bigwig dense
                            var h = _.data.canvasHeight || _.data
                            labelCanvas.attr("height", h + 2) // GOTO DOWN
                            label.style("height", h)
                            view.style("height", h)
                            renderLabel(d, stateMap, labelCanvas, labelDiv, fontstyle, h)
                        }
                        if (_.code == "state") { //hic callback??
                            stateL = _.data;
                            stateMap[d.id] = stateL
                            state.stateMap = stateMap
                            container.setState(state)
                            if ("alias" in stateMap[d.id] && stateMap[d.id]["alias"].length > 0) {
                                renderLabel(d, stateMap, labelCanvas, labelDiv, fontstyle, 20) //TODO remove 20
                            }
                        }
                        if (_.code == "scale") { //code for bigwig.
                            //TODO Add Axis
                            var h = labelCanvas.attr("height") - 2 //GOTO UP
                            var w = labelCanvas.attr("width")

                            var c = labelCanvas.node().getContext("2d")
                            c.fillStyle = "#F7F7F7"
                            //TODO LabelColor?
                            c.fillRect(0, 0, w - 6, h + _font.height)

                            c.fillStyle = "#000"
                            c.fillRect(w - 15, 0 + _font.height, 5, 1)
                            c.fillRect(w - 15, h - 1, 5, 1) //TODO

                            var f = d3.format(".2f")
                            if (Math.abs(_.data.max) < 0.009 && Math.abs(_.data.min) < 0.009) {
                                f = d3.format(".2s")
                            }
                            var s1 = f(_.data.max)
                            var s2 = f(_.data.min)
                            var l1 = s1.length
                            var l2 = s2.length
                            c.font = fontstyle
                            c.fillText(s1, labelWidth - l1 * 6 - 15, 8 + _font.height)
                            c.fillText(s2, labelWidth - l2 * 6 - 15, h - 10 + _font.height)
                            c.fillStyle = "#000"
                            var _label = d.id
                            if (stateMap[d.id] && ("alias" in stateMap[d.id]) && stateMap[d.id]["alias"].length > 0) {
                                _label = stateMap[d.id]["alias"]
                            }
                            smartFillText(c, _label + "  ", (h - 10) / 2 + 3 + _font.height) //TODO
                        }

                        if (_.code == "labels") {

                        }
                        if (d.format == "bigbed" || d.format == "bigbedLarge") {
                            var ctx = labelCanvas.node().getContext("2d")
                            ctx.fillStyle = labelColor
                            ctx.font = _font.font //TODO
                            var height = 12 + 3;
                            Object.keys(_.data.labels).forEach(function(k) {
                                var v = _.data.labels[k];
                                ctx.fillText(v, labelWidth - _font.width * v.length - 20, 23 + k * height);
                            })
                        }
                        _stacks -= 1
                        if (_stacks == 0) {
                            setTimeout(function() {
                                _dispatch.call("done", this, _stacks)
                            }, 200);
                        }
                        if (d.group) { //TODO
                            labelCanvas.node().getContext("2d").fillText("G " + d.group, 10, 10)
                        }

                    })
                //SEPARATE TO PROMISE HERE 
                viewDiv.datum(d).call(tracks[d.id])
            }

        })
        var _brush = function(e) {
            Object.keys(tracks).forEach(function(k) {
                if (k != getGlobal("noResp")) {
                    var b = tracks[k]
                    b.brush(e)
                }
            })
        }
        dispatch.on("brush", _brush)
        _dispatch.on("brush.localPanelTracks", _brush)
        _dispatch.on("brush.axis", function(d) {
            chrtrack.brush(d)
            scaletrack.brush(d)
        })


    }
    chart.bg = function(_) {
        return arguments.length ? (bg = _, chart) : bg;
    }
    chart.stateMap = function(_) {
        return arguments.length ? (stateMap = _, chart) : stateMap;
    }
    chart.dispatch = function(_) {
        return arguments.length ? (dispatch = _, chart) : dispatch;
    }
    chart.popup = function(_) {
        return arguments.length ? (popup = _, chart) : popup;
    }
    chart.tracks = function(_) {
        return arguments.length ? (tracks = _, chart) : tracks;
    }
    chart.chrtrack = function(_) {
        return arguments.length ? (chrtrack = _, chart) : chrtrack;
    }
    chart.scaletrack = function(_) {
        return arguments.length ? (scaletrack = _, chart) : scaletrack;
    }
    chart.container = function(_) {
        return arguments.length ? (container = _, chart) : container;
    }
    chart.scope = function(_) {
        return arguments.length ? (scope = _, chart) : scope;
    }
    chart.scopeBuffers = function(_) {
        return arguments.length ? (scopeBuffers = _, chart) : scopeBuffers;
    }
    chart.scopeCfgs = function(_) {
        return arguments.length ? (scopeCfgs = _, chart) : scopeCfgs;
    }
    chart.configCharts = function(_) {
        return arguments.length ? (configCharts = _, chart) : configCharts;
    }
    chart.chartsMap = function(_) {
        return arguments.length ? (chartsMap = _, chart) : chartsMap;
    }
    chart.mask = function(_) {
        return arguments.length ? (mask = _, chart) : mask;
    }
    chart.modal = function(_) {
        return arguments.length ? (modal = _, chart) : modal;
    }
    chart.managerChart = function(_) {
        return arguments.length ? (managerChart = _, chart) : managerChart;
    }
    chart.code = function(_) {
        return arguments.length ? (code = _, chart) : code;
    }

    chart.tracksRender = function(_) {
        return arguments.length ? (tracksRender = _, chart) : tracksRender;
    }
    chart.regions = function(_) {
        return arguments.length ? (regions = _, chart) : regions;
    }
    chart.initMap = function(_) {
        return arguments.length ? (initMap = _, chart) : initMap;
    }
    chart.heights = function(_) {
        return arguments.length ? (heights = _, chart) : heights;
    }
    chart._dispatch = function(_) {
        return arguments.length ? (_dispatch = _, chart) : _dispatch;
    }
    chart.content = function(_) {
        return arguments.length ? (content = _, chart) : content;
    }
    chart.contentDiv = function(_) {
        return arguments.length ? (contentDiv = _, chart) : contentDiv;
    }
    chart.state = function(_) {
        return arguments.length ? (state = _, chart) : state;
    }
    chart.getGlobal = function(_) {
        return arguments.length ? (getGlobal = _, chart) : getGlobal;
    }
    chart._stacks = function(_) {
        return arguments.length ? (_stacks = _, chart) : _stacks;
    }
    chart.managerChart = function(_) {
        return arguments.length ? (managerChart = _, chart) : managerChart;
    }
    return chart
}
