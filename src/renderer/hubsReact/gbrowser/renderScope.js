import trackScope from "../../../scope"

import isIn from "../../../tools/isIn"

import datgui from "../../../datgui"
import {
    overlap
} from "../../../data/funcs"
import toolsFixRegions from "../../../tools/fixRegions"
var rightPadding = 60 //50 -20
var labelWidth = 140

export default function(container, content, contentDiv, btnScope, dispatch, trackViews, scope, scopeCfgs, scopeBuffers, _plot, getGlobal, btnStudio) {
    //trackViews is Local
    var scopeDivOn = function() {
        scopeDiv.style("display", null)
        btnStudio.style("display", "none")
        scopeDivToggle = true
        scopeContentView.call(scopeRender)
    }
    var scopeDivOff = function() {
        scopeDiv.style("display", "none")
        btnStudio.style("display", null)
        scopeDivToggle = false
    }
    dispatch.on("resize.chart", function(d) {
        if (scopeDivToggle) {
            scopeContentView.call(scopeRender)
        }
    })
    var scopeOpacity = 1.0
    var scopeDiv = content.append("div").style("width", "30%")
        .style("height", "calc(100%-180px)")
        .style("position", "absolute")
        .style("display", "none")
        .style("background-color", "#F0F0F0") //.text("content")
        //.style("background-color", "white")
        .style("top", "55px")
        .style("right", "5px")
        .style("font-size", "12px")
        .style("font-family", "Roboto Arial")
        .classed("nb_card", true)
        .classed("nb_card1", true)

    var scopeBody = scopeDiv.append("div").classed("panel-body", true)
    var scopeContent = scopeBody.append("div").style("display", null)
    var scopeCfg = scopeContent.append("div") //remove scope config
    var scopeContentCtrl = scopeContent.append("div").style("padding-bottom", "15px")
    var scopeContentView = scopeContent.append("div")

    var scopeDataCount = 0;
    //var scopeBuffers = {}

    /* TODO Select Render */
    var scopeRenderIds = []
    Object.keys(trackScope).forEach(function(d) {
        scopeRenderIds.push(d)
    })
    scopeRenderIds.sort();

    var scopeRender;


    var datIORender = datgui()
        .closable(false)
        .width(180)
        .callback(function(k, v) {
            _s();
            scopeContentView.call(scopeRender)
        });
    var datIO = datgui()
        .closable(false)
        .width(180)
        .callback(function(k, v) {
            var a = scopeBuffers[v]
            a["i"] = k
            dispatch.call("scopeChange", this, a)
        })
    var scopeRenderOpts = {
        "chart": scopeRenderIds,
    }
    var scopeRenderState = {
        "chart": "scatter"
    }
    scopeCfg.selectAll(".dat1").remove();
    scopeCfg.selectAll(".dat1")
        .data([{
            "options": scopeRenderOpts,
            "config": scopeRenderState
        }])
        .enter()
        .append("div")
        .classed("dat1", true)
        .call(datIORender)

    //scopeCfg.selectAll(".submit").remove();
    /* _s : event emit when render change */
    //var scopeDataCount
    var scopeData
    var previousCfgs = {};
    var _s = function(d0) {
        var lastCfgs = JSON.parse(JSON.stringify(scopeCfgs))
        for (var k in lastCfgs) {
            previousCfgs[k] = lastCfgs[k]
        }
        var scopeOpts = {}
        scopeRender = trackScope[scopeRenderState.chart]();
        if (scopeRenderState.chart == "scatter" || scopeRenderState.chart == "scatterLogScale") {
            scopeRender.emit(function(d) {
                var regions = getGlobal("regions")
                if (d.code == "click") {
                    var r = {
                        "chr": regions[d.data[0]].chr,
                        "start": d.data[1],
                        "end": d.data[2]
                    }
                    dispatch.call("brush", this, [r])
                }
                if (d.code == "brush") {
                    var r = []
                    d.data.forEach(function(d) {
                        r.push({
                            "chr": regions[d[0]].chr,
                            "start": d[1],
                            "end": d[2]
                        })
                    })
                    //r = toolsFixRegions(r)
                    dispatch.call("brush",this,r)
                    layout.eventHub.emit("brush", r)
                    layout.eventHub.emit("sendMessage", {
                        code: "brush",
                        data: JSON.stringify(r)
                    })
                    //dispatch.call("brush", this, r)
                }
            });
        }
        dispatch.on("brush.scope", function(d) {
            if ("respond" in scopeRender) {
                d.forEach(function(d) {
                    getGlobal("regions").forEach(function(r, i) {
                        if (overlap(r, d)) {
                            d.chrIdx = i
                        }
                    })
                })
                scopeRender.respond({
                    "code": "brush",
                    "data": d
                }) //TODO
            }
        })
        var idList = function(ls, formats) {
            var l = [];
            ls.forEach(function(d) {
                formats.forEach(function(format) {
                    if (d.format == format) {
                        l.push(d.id)
                    }
                })

            })
            return l;
        }
        // TODO Select Other renders
        scopeData = {};
        dispatch.on("scope", function(d) {
            //TODO Render. d.d, d.i, d.o when change.
            scopeDataCount += 1;
            scopeData[d.i] = d
            if (scopeDataCount == scopeRender.inputs().length) {
                scopeContentView.datum(scopeData).call(scopeRender) //TODO
            }
        })
        dispatch.on("scopeChange", function(d) {
            scopeData[d.i] = d
            scopeContentView.datum(scopeData).call(scopeRender) //TODO
        })
        /*
        dispatch.on("updateTrackViews", function(d){

        })
        */
        dispatch.on("updateTracks", function(d) {
            trackViews = d
            scopeRender.inputs().forEach(function(d) {
                scopeOpts[d.id] = idList(trackViews, d.format.split(/[,; ]+/)) //TODO
                if (scopeOpts[d.id].length == 0) {
                    scopeOpts[d.id] = ["null"]
                }
                if (previousCfgs[d.id] && isIn(previousCfgs[d.id], scopeOpts[d.id])) {
                    scopeCfgs[d.id] = previousCfgs[d.id] //TODO
                    var a = JSON.parse(JSON.stringify(scopeBuffers[scopeCfgs[d.id]]))
                    a["i"] = d.id
                    dispatch.call("scope", this, a)
                } else if (scopeOpts[d.id][0] in scopeBuffers) {
                    scopeCfgs[d.id] = scopeOpts[d.id][0] //TODO
                    var a = JSON.parse(JSON.stringify(scopeBuffers[scopeOpts[d.id][0]]))
                    a["i"] = d.id
                    dispatch.call("scope", this, a)
                }
            })
            scopeContentCtrl.datum({
                "options": scopeOpts,
                "config": scopeCfgs
            }).call(datIO)
            //TODO render New Scope with Buffer and new Render.
        })
        if (trackViews.length > 0) {
            dispatch.call("updateTracks", this, trackViews)
        }
    }
    _s()
    var scopeDivToggle = false;
    btnScope.on("click", function() {
        if (scopeDivToggle == false) {
            scopeDivOn()
            var scopeWidth = scopeDiv.node().getBoundingClientRect().width
            var v = container.width - rightPadding - labelWidth - Math.round(scopeWidth)
            if (v != scope.edge) {
                scope.edge = v;
                _plot()
            }
        } else {
            scopeDivOff();
            scope.edge = container.width - rightPadding - labelWidth
            _plot()
        }
    })
    var scopeTop = 80;
    contentDiv.node().parentNode.onscroll = function() {
        scopeDiv.style("top", scopeTop - $(contentDiv.node()).offset().top + "px")
    }

    scopeDiv.recount = function() {
        scopeDataCount = 0;
    }
    scopeDiv.on = function() {
        return scopeDivToggle
    }
    return scopeDiv

}
