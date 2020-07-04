import React from "react"
import ReactDOM from "react-dom"
import AppBar from "./appBar"
//import * as d3 from "d3"


import chrTrack from "../../tracks/chr"


import tracksRender from "../../tracks/renders"

import regionsText from "../../tools/regionsText"
import toolsFixRegions from "../../tools/mergeRegions"
import canvasTabPrint from "../../tools/promiseTablePrint.js"

import getChromSize from "../../tools/getChromSize"
import trackAgent from "../../tools/trackAgent"
import zoomOut from "../../tools/zoomOut"
import zoomIn from "../../tools/zoomIn"

import scaleTrack from "../../tracks/scale"
import addBtnTo from "../../tools/addBtnTo"

import font from "../../shape/font"



import decode from "../../tracks/decode"
import code from "../../tracks/dataSrcCode"

import {
    isRow,
    renderHubIcon,
    checkBool
} from "./hubsUtils"


import topChart from "./gbrowser/gbTopChart"
import renderServerTable from "./gbrowser/renderServerTable"
import loadTabServer from "./gbrowser/loadTabServer"

import renderScope from "./gbrowser/renderScope"
import lociInput from "./gbrowser/loci"
import trackChart from "./gbrowser/trackChart"
import bwCfgChart from "./gbrowser/bwCfgChart"

import initPopup from "./gbrowser/initPopup"

import renderConfigTop from "./gbrowser/renderConfigTop";
import initDefaultRegions from "./gbrowser/initDefaultRegions"
import initCfgTracks from "./gbrowser/initCfgTracks"

import renderNaviBtns from "./gbrowser/renderNaviBtns"
//import 'jquery-ui-bundle';
// require('imports-loader?window.jQuery=jquery!../../../node_modules/tablednd/dist/jquery.tablednd.min.js');
//import $ from "jquery"
//import addPluginTableDnD from "../../tools/addPluginTableDnD.js"
//console.log("$",$)
//addPluginTableDnD($)

const labelWidth = 140 //smart label width???
var currentRegionColor = "#2c7c26"
var rightPadding = 60 //50 -20


const _minWidth = 540
var _font = font()

export default function(layout, container, state, app) {
    var trackdbs = []
    var _stacks = -1;
    var inDragRow = false;
    var _dispatch = d3.dispatch("done", "brush")
    var inCtrl = false;
    var regions = state.regions || app.regions
    var current = state.current
    if (regions && !current) {
        current = JSON.parse(JSON.stringify(regions))
    }
    var genome = state.genome || app.genome || "hg38"
    //TODO Check if HG38 Not Exists
    state.genome = genome
    state.unlink = state.unlink || false
    var bg = true;
    if ("bg" in state) {
        bg = state.bg
    }
    var brushRegions = state.brushRegions || []

    //replace inCtrl with isSender
    d3.select(container.getElement()[0])
        .on("mouseover", function() {
            inCtrl = true;
        })
        .on("mouseout", function() {
            inCtrl = false;
        })
        .on("touchstart", function() {
            inCtrl = true;
        })
        .on("touchmove", function() {
            inCtrl = true;
        })
        .on("touchend", function() {
            setTimeout(function() {
                inCtrl = false;
            }, 1000)
        })
    /* GLOBAL VARIABLES */
    var dispatch = d3.dispatch("resize", "update", "brush", "replot", "print", "move", "scope", "scopeChange", "text",
        "updateTracks", "scaleChange", "setGenome", "setGenomes")


    var tracks = [];
    var trackViews = container.getState().trackViews || []; //Add New With TrackViews API?
    var trackAlls = [];
    var chrs;
    var chrToLength = {}; //TODO with Genome Version
    /* END OF GLOBAL VARIABLES*/

    /* GLOBAL DIVS */
    var c = d3.select(container.getElement()[0])
    var managerChart;
    var agent

    /* where is content div */
    var contentDiv = c.append("div").classed("content", true)
        .style("position", "relative")
        .on("click", function() {
            pop.main.style("display", "none")
        });
    var contentWarn = contentDiv.append("div").style("display", "none")
    var content = contentDiv.append("div") //.style("overflow-y","scroll")

    //TODO Mask to Material UI
    var mask = contentDiv.append("div")
        .style("position", "absolute")
        .style("top", 0 + "px")
        .style("left", 0 + "px")
        .style("width", container.width + "px")
        .style("height", container.height + "px")
        .style("background-color", "black")
        .style("opacity", 0.5)
        .style("z-index", 98)
        .style("display", "none")
    var modal = contentDiv.append("div")
        .classed("mod", true)
        .style("position", "absolute")
        .style("top", "10px")
        .style("left", "80px")
        .style("width", (container.width - 160) + "px")
        //.style("height", container.height + "px")
        .style("background-color", "#F0F0F0")
        .style("display", "none")
        .style("z-index", 99)
        .style("text-align", "center")

    /* POPUP SECTION TODO:clean namespace */
    var pop = initPopup(contentDiv)

    /* END OF POPUP SECTION */

    /* END OF GLOBAL DIVS */

    /* TRACKS MANAGEMENT */
    var inited = false


    content.style("padding-left", "0px").style("text-align", "middle")

    //TODO init GBrowser Content Ctrl
    var c2 = content.append("div").style("position", "relative")
    var appBarReady = function() {
        /* Chr Length */
        var getChrLength = function(chr) {
            if (chr in chrToLength) {
                return chrToLength[chr]
            }
            return false
        }
        var initChrToLength = function(c) {
            chrs = c
            chrToLength = {}
            chrs.forEach(function(d) {
                var id = "chr" + d.Name.replace("Chr", "").replace("chr", "") // some hic files are not prefix with chr
                chrToLength[id] = d.Length
            })
            app.genome = genome;
        }

        var genomeChange = false
        dispatch.on("updateTracks.trackViews", function(d) {
            trackViews = d
        })

        /*  Section: Config Top */
        var _mcb = function() {
            managerChart.callback()(managerChart.idsInOrder())
        }
        var _refresh = function() {
            loadTabServer(tabServer, agent, state, cfg)
        }
        var retv = renderConfigTop(state, _mcb, _refresh, c, dispatch)
        var cfg = retv.cfg
        //var genomeInput = retv.genomeInput
        var tabServer = retv.tabServer
        var hot = retv.hot
        /*
        if (genome != genomeInput.attr("value")) {
            genome = genomeInput.attr("value")
            state.genome = genome
            app.genome = genome
        }
        */
        /******************* End of Config Top Section ****************************/


        var gbctrldiv = c2.select("div").select("div")
        //TODO
        var regionInput = gbctrldiv.select("#regionsInput")
            .style("font-size", "14px")
            //.style("font-weight", "normal")
            .style("padding-left","2px")

        dispatch.on("text", function(d) {
            regionInput.node().value = regionsText(d)
        })
        /* Navigation Bar Section*/
        var _renderInput;
        var _loadGeneLoci;
        var _cb = function(d) {
            _renderInput = d._renderInput;
            _loadGeneLoci = d._loadGeneLoci;
        }
        lociInput(regionInput, state, getChrLength, dispatch, _cb)
        dispatch.on("move", function(d) {
            d.forEach(function(d) {
                var l = getChrLength(d.chr)
                if (d.end > l) {
                    d.end = l
                }
                if (d.start < 0) {
                    d.start = 0
                }
            })
            dispatch.call("update", this, toolsFixRegions(d))
        })

        var btnGroup = gbctrldiv.select("#grpNav")
        var btnGroup2 = gbctrldiv.append("div").style("float", "right").style("padding-right", "2px").style("padding-top", "2px")
        var btnGroup1 = gbctrldiv.append("div").style("float", "right").style("padding-top", "3px")
        gbctrldiv.select("#btnPlay")
            .on("click", function() {
                _renderInput()
            })

        gbctrldiv.select("#btnRefresh")
            .on("click", function() {
                dispatch.call("update", this, regions)
            })

        var getSelectAxis = function() {
            var i = scaletrack.selectedAxis()
            var arr
            var N = regions.length
            if (i >= 0) {
                arr = [i]
            } else {
                arr = Array.apply(null, {
                    length: N
                }).map(Number.call, Number)
            }
            return arr
        }
        var navBtns = renderNaviBtns(gbctrldiv, getSelectAxis, btnGroup, {
            regions: regions
        }, dispatch, getChrLength)

        var btnUnlink = gbctrldiv.select("#btnUnlink")
            .on("click", function() {
                state.unlink = !state.unlink
                if (!state.unlink) {
                    regions = JSON.parse(JSON.stringify(app.regions))
                    state.regions = regions
                    render();
                } else {
                    scaleFactor = 1
                    state.scaleFactor = 1
                }
            })
        //TODO Dispatch
        var btnLinkedUpdate = gbctrldiv.select("#btnUnlinkPlay")
            .attr("title", "linked panels zoom to current brush regions")
            .on("click", function() {
                var d = brushRegions;
                d.forEach(function(d) {
                    d.genome = state.genome || "unknown"
                })
                layout.eventHub.emit("update", d)
                layout.eventHub.emit("updateApp", {
                    "regions": d
                })
                layout.eventHub.emit("sendMessage", {
                    code: "update",
                    data: JSON.stringify(d)
                })
                layout.eventHub.emit("sendMessage", {
                    code: "updateApp",
                    data: JSON.stringify({
                        "regions": d
                    })
                })
            })


        /* Studio Bar ; Interactive Analysis Bar */
        gbctrldiv.select("#btnCamera")
            .on("click", function() {
                dispatch.call("print", this, regions)
            })
        var btnStudio = gbctrldiv.select("#btnPrint")
            .attr("title", "export svg")
        btnStudio
            .on("click", function() {
                var heights = []
                gbtable.selectAll("tr").each(function(d) {
                    var h0 = d3.select(this).node().getBoundingClientRect().height
                    heights.push(h0)
                })
                var c = {
                    state: container.getState(),
                    width: container.width,
                    heights: heights,
                }
                localStorage.setItem("_hubs_", JSON.stringify(c))
                window.open("/static/studio/gbrowse.html", "_blank")
            })
        var btnScope = gbctrldiv.select("#btnChart")
            .attr("title", "chart (scatter plot)")
        /* Config Menu Bar */
        //var btnCfg = 
        //addBtnTo(btnGroupB, "cog")
        gbctrldiv.select("#btnConfig")
            .attr("title", "add or remove tracks")
            .on("click", function() {
                //TODO This Problem for Single App
                //
                //$(container.tab.header.element[0].children[1].firstChild).click() 
                //var container = stack.getActiveContentItem().container;
                var toggled = !state.configView
                //var _state = container.getState()
                state.configView = toggled
                //container.extendState({
                //    "configView": toggled
                //});
                container.setState(state)
                if (toggled) {
                    container.getElement().closest(".lm_item").addClass("s_cfg").removeClass("s_content")
                } else {
                    container.getElement().closest(".lm_item").addClass("s_content").removeClass("s_cfg")
                }
            })

        /* Multiple Config Section */
        var selected
        var bwChart = bwCfgChart().callback(function(d0) {
            mask.style("display", "none")
            modal.style("display", "none")
            var m = $(selected.node()).val()
            var c = {}
            if (typeof m == "null" || m.length == 0) {
                m = trackViews.map(function(d) {
                    return d.id
                })
            }
            m.forEach(function(d) {
                c[d] = true
            })
            if (d0 == "reset") {
                trackViews.forEach(function(d) {
                    if (d.id in stateMap) {
                        delete stateMap[d.id]
                    }
                })
                state.stateMap = stateMap
                render()
            } else if (d0 !== null) {
                state.batchBigwigConfig = JSON.parse(JSON.stringify(d0))
                trackViews.forEach(function(d) {
                    if (d.format == "bigwig" && c[d.id]) { //TODO Add Select 
                        if (d.id in stateMap) {
                            var alias = stateMap[d.id]["alias"] || "";
                            var _a = JSON.parse(JSON.stringify(d0))
                            _a["alias"] = alias
                            stateMap[d.id] = _a
                        } else {
                            stateMap[d.id] = JSON.parse(JSON.stringify(d0))
                        }
                    }
                })
                state.stateMap = stateMap
                render()
            }
        })
        //var btnBatchCog = 
        //addBtnTo(btnGroupB, "th-list")
        gbctrldiv.select("#btnBatchConfig")
            .attr("title", "batch config current tracks")
            .on("click", function() {
                mask.style("display", null)
                modal.style("display", null)
                modal.selectAll("*").remove()
                modal.append("div").text("Only Support BigWig")
                    .on("click", function() {
                        mask.style("display", "none")
                        modal.style("display", "none")
                    })
                var divForm = modal.append("div").append("form")
                selected = divForm.append("select").property("multiple", true).style("width", "80%").style("height", "300px")
                selected.selectAll("option").data(trackViews.filter(function(d) {
                        return d.format == "bigwig"
                    }))
                    .enter()
                    .append("option")
                    .attr("value", function(d) {
                        return d.id
                    })
                    .text(function(d) {
                        return d.id
                    })

                var cdiv = modal.append("div").datum(state.batchBigwigConfig || {})
                cdiv.call(bwChart)
            })
        /* End OF Mutliple Config Section */

        var btnFold = gbctrldiv.select("#btnDense")
            .attr("title", "compact view")
        var btnUnfold = gbctrldiv.select("#btnFull")
            .attr("title", "full view")
        var btnBg = gbctrldiv.select("#btnBg")
            .attr("title", "clear ruler background")

        if (bg) {
            btnBg.classed("btn-success", false)
            btnBg.classed("btn-default", true)
        }
        btnBg.on("click", function() {
            bg = !bg;
            if (bg) {
                btnBg.classed("btn-success", false)
                btnBg.classed("btn-default", true)
            } else {
                btnBg.classed("btn-success", true)
                btnBg.classed("btn-default", false)
            }
            state.bg = bg;
            container.setState(state)
            render();
        })
        btnFold.on("click", function() {
            trackViews.forEach(function(d) {
                if (d.format == "bigwig" || d.format == "bigbed") {
                    if (stateMap[d.id]) {
                        stateMap[d.id].mode = "dense"
                    } else {
                        stateMap[d.id] = {
                            "mode": "dense"
                        }
                    }
                }
            })
            state.stateMap = stateMap
            container.setState(state)
            render()
        })
        btnUnfold.on("click", function() {
            trackViews.forEach(function(d) {
                if (d.format == "bigwig" || d.format == "bigbed") {
                    if (stateMap[d.id]) {
                        stateMap[d.id].mode = "full"
                    } else {
                        stateMap[d.id] = {
                            "mode": "full"
                        }
                    }
                }
            })
            state.stateMap = stateMap
            container.setState(state)
            render()
        })
        /* Scale Factor Section */
        var scaleFactor = state.scaleFactor || 1
        var scaleFactorDiv = btnGroup2.append("span")
        //var //scaleFactorIndicator = btnGroup1.append("span").style("padding", "2px").attr("title", "zoom out factor") //TODO prettify
        //scaleFactorIndicator.text(scaleFactor)
        var scaleFactorSlider = gbctrldiv.select("#sliderZoom")
        var TOSCALE = false
        var _scaleChange = function(newValue) {
            if (scaleFactor != newValue) {
                scaleFactor = newValue
                state.scaleFactor = scaleFactor
                regions = zoomOut(JSON.parse(JSON.stringify(app.regions)), scaleFactor, chrToLength)
                state.regions = regions
                container.setState(state)
                regionInput.node().value = regionsText(current)
                if (scaleFactor > 1) {
                    regionInput.style("background-color", "#E9F1E9")
                } else {
                    regionInput.style("background-color", "#FFFFFF")
                }
                render()
            }
        }
        dispatch.on("scaleChange.main",
            function(d) {
                var newValue = Math.pow(2, d)
                //scaleFactorIndicator.text(newValue)
                if (TOSCALE !== false) clearTimeout(TOSCALE)
                TOSCALE = setTimeout(_scaleChange, 500, newValue)

            })
        scaleFactorSlider.style("display", checkBool(!state.unlink))
        var scopeCfgs = {}

        var scope = {
            "edge": container.width - (labelWidth + 20), //label width
        };
        if ("server" in app) {
            scope["server"] = app.server
        }
        var _plot = function() {

            heights["hic"] = scope.edge / 2;
            scaletrack.width(scope.edge); //TODO re-render
            content.selectAll(".trackView").style("width", scope.edge + "px")
            content.selectAll(".trackView").selectAll("canvas").attr("width", scope.edge + "px")
            content.selectAll(".trackView").selectAll("svg").attr("width", scope.edge + "px")
            modal.style("width", scope.edge + "px")
            mask.style("width", container.width - 2 + "px")
                .style("height", container.height - 5 + "px")
            if (inited) {
                render();
            }
        }

        /* Scope Section */
        var noResp = "";
        var getGlobal = function(d) {
            if (d == "inDragRow") {
                return inDragRow
            }
            if (d == "noResp") {
                return noResp
            }
            if (d == "regions") {
                return regions
            }
            if (d == "trackViews") {
                return trackViews
            }
            return null
        }
        var scopeBuffers = {}
        var scopeDiv = renderScope(container, content, contentDiv, btnScope, dispatch, trackViews, scope, scopeCfgs, scopeBuffers, _plot, getGlobal, btnStudio)
        //var WidthValue = 800 //TODO

        /** GBrowser Table Section **/
        //var gbdiv = 
        //content.append("div")
        var gbgapdiv = content.append("div").style("height", "5px")
        var gbtopdiv = content.append("div").classed("gbtop", true)
            .style("background-color", "#F7F7F7")
        var gbtop = gbtopdiv.append("table")
        //var gbheader = 
        gbtop.append("thead")
        var gbtbodyTop = gbtop.append("tbody") //For Scale and Chromosome;
            .style("overflow", "auto")
        var gbbody = content.append("div").classed("gbbody", true)
            .style("background-color", "#F7F7F7")
            .style("height", (container.height - 120) + "px") //label width
            .style("overflow-y", "auto")
        var gbtable = gbbody.append("table").classed("gbtable", true).style("table-layout", "")
        var gbtbody = gbtable.append("tbody")
        var heights = {
            "hic": container.width / 2,
            "bigwig": 45,
            "bigbed": 30,
            "bigbedLarge": 30,
            "binindex": 100,
            "tabix": 100,
        }
        //var q = [];
        var stateMap = container.getState().stateMap || {}
        var initMap = {}
        //var trackMap = {}
        var chartsMap = {}
        //var bwResp = {}; //??
        //var hicResp = {}; //??
        var respond = true;
        var stacks = []
        //var agent
        var _hicConfigReady = function(results) {
            var i = 0;
            //inited = false
            stacks.forEach(function(d) {
                if (d.track.format == "hic") {
                    var config = {}
                    config.norms = results[i + 0]
                    config.bpres = results[i + 1]
                    initMap[d.track.id] = config;
                }
                i += d.num;
            })
            //inited = true

        }

        var _trackViewHicConfigReady = function(results) {
            var i = 0;
            inited = false
            initStacks.forEach(function(d) {
                if (d.track.format == "hic") {
                    var config = {}
                    config.norms = results[i + 0]
                    config.bpres = results[i + 1]
                    initMap[d.track.id] = config;
                }
                i += d.num;
            })
            _ready()
        }

        var _ready = function() {
            app.genome = genome //TODO
            getChromSize(genome, function(c) {
                //Check Error
                if (c !== null) {
                    initChrToLength(c)
                    regions = initDefaultRegions(chrToLength, app, state, genomeChange)
                    lociInput(regionInput, state, getChrLength, dispatch, _cb)
                    dispatch.call("update", this, regions) //To Navigation Bar
                    inited = true
                    render()
                    /*
                        function(){
                            console.log("callback in loadAllHic")
                            setTimeout(_loadAllHicConfig,2000)
                        }
                    */
                }
                setTimeout(_loadAllHicConfig, 3000)
            })

        }
        var opened = false

        /* TODO add servers */
        var _loadAllHicConfig
        var initStacks
        var init = function(callback) {
            var q = []
            stacks = []
            initStacks = []
            var q0 = []
            trackViews.forEach(function(d, i) {
                var server = d.server || state.server || scope.server || app.server || ""
                if (d.format == "hic") {
                    var URI = server + "/" + d.prefix + ".hic/" + d.id
                    d.server = server
                    //var p = ["norms", "units", "list", "bpres"]
                    var p = ["norms", "bpres"]
                    p.forEach(function(d) {
                        q0.push(
                            d3.json(URI + "/" + d, sandInits)
                        )
                    })
                    initStacks.push({
                        "track": d,
                        "num": 2
                    })
                }
            })
            Promise.all(q0).then(_trackViewHicConfigReady)
            _loadAllHicConfig = function() {
                console.log("Loading all HiC paras")
                trackAlls.forEach(function(d, i) {
                    var server = d.server || state.server || scope.server || app.server || ""
                    if (d.format == "hic") {
                        var URI = server + "/" + d.prefix + ".hic/" + d.id
                        d.server = server
                        var p = ["norms", "bpres"]
                        p.forEach(function(d) {
                            q.push(
                                d3.json(URI + "/" + d, sandInits)
                            )
                        })
                        stacks.push({
                            "track": d,
                            "num": 2
                        })
                    }
                })

                Promise.all(q).then(_hicConfigReady)
            }
        }
        /* init table */
        var initRender = function() {
            gbtbody.selectAll("tr").remove();
        }

        var configCharts = {

        };


        var scaletrack = scaleTrack().width(scope.edge).dispatch(dispatch).navBtns(navBtns)
        var chrtrack = chrTrack().dispatch(dispatch)
        //var handleColor = "#EEE"
        /* TODO MODULIZE track chart*/
        dispatch.on("print", function() {
            canvasTabPrint(contentDiv)
        })

        var topchart = topChart()
        var trackchart = trackChart()
            .popup(pop)
            .mask(mask)
            .modal(modal)
            .dispatch(dispatch)
            .container(container)
            .stateMap(stateMap)
            .tracks(tracks)
            .chrtrack(chrtrack)
            .scaletrack(scaletrack)
            .scope(scope)
            .scopeCfgs(scopeCfgs)
            .scopeBuffers(scopeBuffers)
            .configCharts(configCharts)
            .chartsMap(chartsMap)
            .code(code)
            .tracksRender(tracksRender)
            .initMap(initMap)
            .heights(heights)
            ._dispatch(_dispatch)
            .content(content)
            .contentDiv(contentDiv)
            .state(state)
            .getGlobal(getGlobal)


        var render = function(callback) {
            if (scope.edge < _minWidth - 200) {
                return
            }
            _stacks = trackViews.length
            chrtrack.chrs(getChrLength)
                .genome(genome)
                .width(scope.edge)
            topchart.chrtrack(chrtrack)
                .scaletrack(scaletrack.bg(bg))
                .regions(regions) //add zoomOutFactor
                .dispatch(dispatch)
            //TOPCHART WITH _DISPATCH DONE

            gbtbodyTop.call(topchart)
            var tracksTr = gbtbody.selectAll('tr').data(trackViews)
            tracksTr.enter()
                .append("tr")
                .merge(tracksTr)
                .call(trackchart.regions(regions).bg(bg)._stacks(_stacks))
            tracksTr.exit()
                .remove()
            //TODO : Table Dnd 
            $(gbtable.node()).tableDnD({
                onDragStart: function() {
                    inDragRow = true;
                },
                onDragStop: function() {
                    inDragRow = false;
                    c.selectAll(".m").remove();
                    c.selectAll(".m1").style("display", "none");
                },
                onDrop: function(table, row) {
                    console.log("drag drop", table, row)
                    if (pop.main.style("display") != "none") {
                        pop.main.style("display", "none")
                    }
                    var rows = table.tBodies[0].rows;
                    trackViews = []
                    var debugStr = "Row dropped was " + row.id + ". New order: ";
                    console.log(debugStr)
                    var newOrder = {}
                    for (var i = 0; i < rows.length; i++) {
                        debugStr += rows[i].id + " ";
                        newOrder[rows[i].id] = i;
                        var v = agent.getValue(rows[i].id)
                        var k = decode(rows[i].id)
                        if ("group" in k) {
                            v.group = k.group
                        }
                        trackViews.push(v)
                    }
                    state.trackViews = trackViews;
                    managerChart.sort(newOrder)
                    container.setState(state)
                    c.selectAll(".m").remove();
                    c.selectAll(".m1").style("display", "none");
                    inDragRow = false;
                },
                dragHandle: ".trackLabel"
            })
            if (typeof callback == "function") {
                callback()
            }

        }
        //TODO MAKE DONE IN CHROMOSOME TRACKS TOO
        _dispatch.on("done", function() {
            if (state.unlink || state.scaleFactor > 1) {
                if (current) {
                    var k = JSON.parse(JSON.stringify(current))
                    k.color = currentRegionColor
                    _dispatch.call("brush", this, k)
                } else {}
            } else {
                if (brushRegions.length > 0) {
                    _dispatch.call("brush", this, brushRegions)
                }
            }
            opened = true
        })
        /* Updata tracks sources and remove not working tracks from track view
         */
        var textRender = function(el) {
            el.selectAll(".textdiv").remove()
            var t = el.append("svg").classed("textdiv", true).attr("width", container.width).attr("height", container.height - 100)
            var maxRows = Math.floor((container.height - 100) / 25)
            renderHubIcon(trackViews, maxRows, t)
        }
        var initTracks = function() {
            var sign = false;
            if (trackViews.length == 0) {
                sign = true;
            }
            trackAlls = [] //reset trackAlls
            tracks.forEach(function(d, i) {
                d.forEach(function(d, j) {
                    if (sign && j < 1 && i < 1) { //top one track as default
                        var newd = {
                            "server": trackdbs[i].server,
                            "prefix": trackdbs[i].prefix,
                            "format": d.format || trackdbs[i].format,
                            "id": d.id || d
                        }
                        if (typeof d === "object") {
                            Object.keys(d).forEach(function(k) {
                                newd[k] = d[k]
                            })
                        }
                        trackViews.push(newd)
                    }

                    var newd0 = {
                        "server": trackdbs[i].server,
                        "prefix": trackdbs[i].prefix,
                        "format": d.format || trackdbs[i].format,
                        "id": d.id || d
                    }
                    if (typeof d === "object") {
                        Object.keys(d).forEach(function(k) {
                            newd0[k] = d[k]
                        })
                    }
                    trackAlls.push(newd0)

                })
                state.trackViews = trackViews;
                container.setState(state)
            })
            dispatch.call("updateTracks", this, trackViews)
            trackchart.tracks([]) //TO TEST
            var r = initCfgTracks(c, cfg, agent, trackchart, trackViews, state, dispatch, container, _loadGeneLoci, render, genome, regions, genomeChange)
            managerChart = r.managerChart
            init()
        }

        var server = state.server || scope.server || app.server || ""
        /* Copy Agent Servers ??? */
        var genomes = []
        dispatch.on("setGenomes.panel", function(d) {
            genomes = d
            var sign = false;
            genomes.forEach(function(d) {
                if (genome == d) {
                    sign = true
                }
            })
            if (!sign) {
                genome = d[0]
                dispatch.call("setGenome", this, genome)
            }

        })
        agent = trackAgent().callback(function(_) {
            //TODO: Handle Callback Error
            tracks = agent.results();
            trackdbs = agent.trackdbs();
            renderServerTable(agent.activeServers(), agent, dispatch, state, container, tabServer, hot, function() {
                loadTabServer(tabServer, agent, state, cfg)
            }, genome)
            //check genome if not exists then init trackas
            var dGenome = null
            var sign = false
            for (var i = 0; i < genomes.length; i++) {
                if (genomes[i].value == genome) {
                    sign = true
                }
                if (i == 0) {
                    dGenome = genomes[i].value
                }
            }
            if (!sign && dGenome && dGenome !== null) { //lost old genome when update data
                genome = dGenome
                state.genome = genome
                dispatch.call("setGenome", this, genome)
            } else {
                initTracks();
                container.setState(state)
            }
            /* TODO IMPROVE: render tracks results 
             * Get Summary for current database and show it in correct place 
             *
             * */
            var _r = {}
            var _w = {}
            tracks.forEach(function(ts) {
                ts.forEach(function(d) {
                    if (d.format in _r) {
                        _r[d.format] += 1
                    } else {
                        _r[d.format] = 1
                    }
                    if ("longLabel" in d) {
                        d.longLabel.replace(/[\(\)]/g, "").split(" ").forEach(function(w) {
                            if (w in _w) {
                                _w[w] += 1
                            } else {
                                _w[w] = 1
                            }
                        })
                    } else {
                        d.id.replace(/[\(\)]/g, "").split(" ").forEach(function(w) {
                            if (w in _w) {
                                _w[w] += 1
                            } else {
                                _w[w] = 1
                            }
                        })
                    }

                })
            })
            console.log(_r, _w) //TODO Render _r remove common props. 
        })
        if (app.servers) {
            agent.servers(app.servers)
        } else {
            agent.server(server)
        }
        agent.genome(genome || state.genome || "hg38") // TODO

        if (typeof tabServer !== "undefined" && tabServer.filter(isRow).length > 0) {
            loadTabServer(tabServer, agent, state, cfg)
        } else {
            agent("all")
        }
        dispatch.on("setGenome.panel", function(d) {
            if (state.genome == d) {
                return //TODO
            }
            agent.genome(d)
            agent.reset()
            state.genome = d
            app.genome = d
            genome = d
            regions = undefined
            state.regions = undefined
            app.regions = undefined
            genomeChange = true
            cfg.html("<h3>loading...</h3>")
            trackViews = [] //reset trackViews to get default Views
            agent("all")
            _loadGeneLoci();
        })
        var TORESIZE = false
        container.on("resize", function(e) {
            if (TORESIZE !== false) clearTimeout(TORESIZE)
            TORESIZE = setTimeout(_resize, 500, e)
        })
        var _preResize = function(e) {
            if (container.width == 0) {
                return;
            }
            if (container.width < _minWidth) {
                content.style("display", "none")
                contentWarn.selectAll("*").remove();
                var div = contentWarn.append("div").style("padding-left", "10px")
                div.append("span").classed("glyphicon", true).classed("glyphicon-resize-horizontal", true)
                div.append("h3").text("current width : " + container.width + " px")
                div.append("h3").text("minimum width : " + _minWidth + " px")
                div.append("h3").text("Please make this panel wider to see data...")
                textRender(contentWarn)
                contentWarn.style("display", "block")
                respond = false
                return
            } else {
                respond = true
                contentWarn.style("display", "none")
                content.style("display", "block")
            }
            //TODO Fix MenuBar size now
            if (container.width > 643) {
                gbbody.style("height", (container.height - 160) + "px")
            } else {
                gbbody.style("height", (container.height - 160) + "px")

            }

            if (container.width > 865) {
                scopeDiv.style("left", null)
                if (scopeDiv.on()) {
                    var scopeWidth = scopeDiv.node().getBoundingClientRect().width
                    var _w = container.width - rightPadding - labelWidth - Math.round(scopeWidth)
                    if (scope.edge == _w) {
                        return
                    }
                    scope.edge = _w;
                } else {
                    if (scope.edge == container.width - rightPadding - labelWidth) {
                        return
                    }
                    scope.edge = container.width - rightPadding - labelWidth
                }
                if (scope.edge < 0) {
                    scope.edge = 0;
                }
                btnScope.style("display", null)
            } else {
                if (scopeDiv.on()) {
                    btnScope.on("click")()
                }
                btnScope.style("display", "none")
                if (scope.edge == container.width - rightPadding - labelWidth) {
                    return
                }
                scope.edge = container.width - rightPadding - labelWidth
            }
        }
        var _resize = function(e) {
            _preResize(e)
            dispatch.call("resize", this, scope.edge)
            _plot()

        }

        dispatch.on("update.local", function(d) {
            state.regions = d;
            //TODO: check brushRegions is first inited
            if (opened) {
                state.brushRegions = [];
                brushRegions = []
            }
            regions = d
            container.setState(state);
            if (inCtrl) {
                if (scaleFactor > 1) {
                    current = zoomIn(JSON.parse(JSON.stringify(d)), scaleFactor)
                    state.current = current
                } else if (!state.unlink) {
                    current = JSON.parse(JSON.stringify(d))
                    state.current = current
                }
            }
            scopeDiv.recount();
            if (!container.isHidden && typeof respond !== "undefined") {
                render(d)
            }
        })
        dispatch.on("update.global", function(d0) {
            var d = JSON.parse(JSON.stringify(d0)) //localize regions
            if (inCtrl && !state.unlink) {
                d.forEach(function(d) {
                    d.genome = state.genome || "unknown"
                })
                if (scaleFactor > 1) {
                    d = zoomIn(d, scaleFactor)
                }
                layout.eventHub.emit("update", d)
                layout.eventHub.emit("updateApp", {
                    "regions": d
                })
                layout.eventHub.emit("sendMessage", {
                    code: "update",
                    data: JSON.stringify(d)
                })
                //update app.regions in other window
                layout.eventHub.emit("sendMessage", {
                    code: "updateApp",
                    data: JSON.stringify({
                        "regions": d
                    })
                })

            }
            //add new api
            regionInput.node().value = regionsText(d)
            if (scaleFactor == 1) {
                regionInput.style("background-color", "#FFFFFF")
            } else {
                regionInput.style("background-color", "#E9F1E9")
            }
        })
        //TODO REMOVE inCtrl HERE
        //middleware for dispatch call "brush" and call "update" in tracks
        dispatch.on("brush.local", function(d) {
            if (inCtrl) {
                brushRegions = d
                state.brushRegions = d
            }
        })
        dispatch.on("brush.global", function(d) {
            if (inCtrl && !state.unlink) {
                d.forEach(function(d) {
                    d.genome = state.genome || "unknown"
                })
                layout.eventHub.emit("brush", d)
                layout.eventHub.emit("sendMessage", {
                    code: "brush",
                    data: JSON.stringify(d)
                })
            }
            //add new api
            if (d.length > 0) {
                regionInput.node().value = regionsText(d)
                regionInput.style("background-color", "#FFFFE0")
            } else {
                regionInput.node().value = regionsText(regions)
                regionInput.style("background-color", "#FFFFFF")
            }
        })




        layout.eventHub.on("brush", function(d) {
            layout.eventHub.emit("message", {

            })
        })
        //TODO REMOVE INCTRL HERE
        layout.eventHub.on("update", function(d) {
            //TODO scaleFactor
            if (!inCtrl && !state.unlink) {
                if ((d[0].genome && d[0].genome == state.genome) || (!d[0].genome && (d[0].chr && getChrLength(d[0].chr)))) {
                    current = JSON.parse(JSON.stringify(d))
                    state.current = current
                    if (scaleFactor > 1) {
                        state.regions = zoomOut(d, scaleFactor, chrToLength)
                    } else {
                        state.regions = JSON.parse(JSON.stringify(d));
                    }
                    if (opened) {
                        state.brushRegions = [];
                        brushRegions = []
                    }
                    scopeDiv.recount();
                    container.setState(state);
                    regions = state.regions
                    if (!container.isHidden) {
                        dispatch.call("update", this, regions)
                        //render(state.regions)
                    }
                    regionInput.node().value = regionsText(d)
                    if (scaleFactor == 1) {
                        regionInput.style("background-color", "#FFFFFF")
                    } else {
                        regionInput.style("background-color", "#E9F1E9")
                    }
                } else {
                    console.log("Warning: not the same genome version, TODO: LiftOver ")
                }
            } else if (!inCtrl && state.unlink) {
                if ((d[0].genome && d[0].genome == state.genome) || (!d[0].genome && (d[0].chr && getChrLength(d[0].chr)))) {
                    if (!container.isHidden) {
                        var k = JSON.parse(JSON.stringify(d))
                        k.color = currentRegionColor
                        dispatch.call("brush", this, k)
                        current = k
                        state.current = k

                    }
                } else {
                    console.log("Warning: not the same genome version, TODO: LiftOver ")
                }
            }

        })
        layout.eventHub.on("brush", function(d) {
            if (!inCtrl && !state.unlink) {
                noResp = ""
                if (d.length == 0) {
                    dispatch.call("brush", this, d)
                    state.brushRegions = d
                } else if (("genome" in d[0] && d[0].genome == state.genome) || !("genome" in d[0])) {
                    if (!container.isHidden && typeof respond !== "undefined") {
                        dispatch.call("brush", this, d)
                        state.brushRegions = d
                    }
                } else {
                    console.log("Warning: not the same genome version, TODO: LiftOver ")
                }
            }
        })
    }
    ReactDOM.render(<AppBar dispatch={dispatch} state={state} _width={container.width-200}/>, c2.node(), appBarReady)

}
