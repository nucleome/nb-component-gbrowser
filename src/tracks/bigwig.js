import toolsAddChrPrefix from "../tools/addChrPrefix"
import strToColor from "../tools/strToColor"
import datgui from "../datgui"
import bigwigCanvas from "../data/bigwig2"
import coords from "../data/coords"
import font from "../shape/font"
import addDragTitle from "../tools/addDragTitle";
import addDrag from "../tools/addDrag";
var _font = font()



export default function () {
    //var div
    var canvas
    var modal //shared modal .
    var mask //shared mask
    var dispatch
    var _dispatch = d3.dispatch("clearBrush")
    var render
    var state
    var regions
    var width
    var barHeight = 30;
    var _color = "#333"
    var svg
    var bg = false;

    var scope
    var init

    var coord
    var gap = 10

    var inCtrl = false;
    var wasCtrl = false;
    var inBrush = false;
    var d
    var loadDiv

    var highlight = "#000"


    var callback = function (state) {
        console.log(state)
    }
    var _addBrush = function () {
        svg = render.svg();
        var extent, r;
        var brush = d3.brushX() //.extent([0,0],[ coord.range(0)[1],_barHeight]); //
            .on("start", function () {
                svg.selectAll(".selection").style("display", "")
                svg.selectAll(".resp").style("display", "none")
                inBrush = true;
                dispatch.call("brush", this, [])
            })
            .on("brush", function () {
                inCtrl = true;
                extent = d3.event.selection;

                r = coord.invert(extent)
                dispatch.call("brush", this, r)
            })
            .on("end", function () {
                wasCtrl = true;
                inCtrl = false;
                inBrush = false;
                if (_checkBrush()) {
                    $(svg.node()).find(".tmap").prependTo(svg.node());
                } else {
                    $(svg.node()).find(".scopebrush").prependTo(svg.node());
                }
            })

        var brushArea = svg.append("g")
            .classed("scopebrush", true)
            .call(brush)
            .selectAll(".selection")
            .on("contextmenu", function (d) {
                d3.event.preventDefault();
                dispatch.call("update", this, r)
            })
        var _checkBrush = function () {
            var retv = false
            brushArea.each(function (d, i) {
                if (d3.select(this).attr("width") != null) {
                    retv = true
                }
            })
            return retv
        }
    }
    var chart = function (selection) { //selection and data ???
        //TODO REMOVE INCTRL?
        selection
            .on("mouseover", function () {
                inCtrl = true;
            })
            .on("mouseout", function () {
                inCtrl = false;
            })
            .on("touchstart", function () {
                inCtrl = true;
            })
            .on("touchend", function () {
                setTimeout(function () {
                    inCtrl = false;
                }, 1000)
            })
        d = selection.datum()
        var ctx = canvas.node().getContext("2d")
        var _top = 5
        var _r = 10
        if (state.mode == "dense") {
            _r = 2
            _top = 1
        }
        ctx.fillStyle = "#29468e"
        ctx.fillText("LOADING...", 20, 10)

        var server = d.server || state.server || scope.server || "";
        d3.select(canvas.node().parentNode).selectAll(".loader").remove()
        loadDiv = d3.select(canvas.node().parentNode)
            .append("div")
            .classed("loader", true)
            .style("position", "absolute") //TODO FOR Width Mask
            .style("left", (width / 2 - _top - _r)+"px")
            .style("top", _top + "px")
            .style("width", _r * 2 + "px")
            .style("height", _r * 2 + "px")
        var cb = function (d) {
            loadDiv.style("display", "none")
            if (state.mode == "dense") {
                //ADD MORE CALL BACK code and data
                d.canvasHeight = 12
                callback({
                    "code": "height",
                    "data": d
                })

            } else {
                callback({
                    "code": "scale",
                    "data": d
                })

            }
        }
        barHeight = state.height - 10 || barHeight
        var _mode = state.mode || "full"
        if (typeof state.autoscale == "undefined") {
            state.autoscale = true
        }
        if (typeof state.max == "undefined") {
            state.max = 10.0 //TODO
        }
        if (typeof state.min == "undefined") {
            state.min = -10.0 //TODO
        }
        render = bigwigCanvas()
            .URI(server + "/" + d.prefix + ".bigwig") //only support track format?
            .id(d.id)
            .longLabel(d.longLabel || d.id)
            .x(0)
            .y(0)
            .width(width)
            .plotMode(_mode)
            .barHeight(barHeight) //TODO
            .autoscale(state.autoscale)
            .vmax(state.max)
            .vmin(state.min)
            .gap(gap) //TODO REM
            .regions(regions)
            .panel(selection)
            .mode(1)
            .bg(bg)
            .color(state.color || strToColor(d.id))
            .callback(cb)


        coord = coords().width(width).gap(gap).regions(regions).init();
        if (state.mode == "dense") {
            canvas.attr("height", 12) //TODO
        }
        canvas.call(render)
        _addBrush()
        if (d.metaLink && state.mode != "dense") {
            var _name = d.longLabel || d.id;
            var _svg = render.svg();
            var l = _name.length
            var x = width / 2 - _font.width * l / 2

            var _rect = _svg.append("rect")
                .classed("titleRect",true)
                .attr("width", l * _font.width)
                .attr("height", _font.height)
                .attr("x", x)
                .attr("y", 0)
                .attr("fill", "#000")
                .attr("opacity", 0.0)
                .on("mouseover", function () {
                    d3.select(this).attr("opacity", 0.2)
                })
                .on("mouseout", function () {
                    d3.select(this).attr("opacity", 0.0)
                })
                .on("click", function () {
                    console.log("click",d)
                    window.open(d.metaLink, "_blank")
                })
                /* Drag To Other Panels */        
             //addDrag(_rect,d)  
        }
        if (barHeight != 30) {
            if (state.mode == "dense") {

            } else {
                callback({
                    "code": "height",
                    "data": state.height
                })
            }
        }
    }
    chart.brush = function (e) {
        //on brush call this;
        var fill = highlight
        if (e.length > 0 && (typeof e[0].color != "undefined")) {
            fill = e[0].color
        }
        if (typeof e.color != "undefined") {
            fill = e.color
        }
        //var fill = e.color || e[0].color || highlight
        if (!svg) {
            return
        }
        if (!inBrush) {
            svg.selectAll(".selection").style("display", "none"); //TODO ???
            svg.selectAll(".resp")
                .style("display", "")
                .on("contextmenu", function () {
                    d3.event.preventDefault();
                    dispatch.call("update", this, e)
                })
            render.highlight(fill) //TODO
            render.response(e)
        } else {
            svg.selectAll(".resp").remove();
        }
    }
    chart.config = function () {
        modal.selectAll("div").remove();
        var cfg = modal.append("div")
        var autoscaleSet = function (v) {
            var a = v || null
            var b = "#44ABDA"
            if (a) {
                b = "#D7D7D7"
            }
            cfg.selectAll(".datgui").each(function (d) {
                d3.select(d.inputs["max"].domElement).select("input").attr("disabled", a).style("color", b)
                d3.select(d.inputs["min"].domElement).select("input").attr("disabled", a).style("color", b)
            })

        }
        var datIO = datgui().closable(false).callback(function (k, v) {
            if (k == "autoscale") {
                autoscaleSet(v)
            }
        });
        var _state = JSON.parse(JSON.stringify(state))
        var _autoscale = true
        if (_state.autoscale == false) {
            _autoscale = false
        }
        var opts = {
            "alias": state["alias"] || "",
            "color": state["color"] || strToColor(d.id),
            "height": {
                type: "range",
                min: 40,
                max: 100,
                step: 10
            },
            "mode": ["full", "dense"],
            "autoscale": _autoscale,
            "max": 10.01,
            "min": -10.01,
        }
        _state.alias = _state.alias || ""
        _state.color = _state.color || strToColor(d.id)
        _state.height = _state.height || barHeight + 10
        _state.mode = _state.mode || "full"

        if (!("autoscale" in _state)) {
            _state.autoscale = true
        }
        if (_state.autoscale == false) {
            if (!("max" in _state)) {
                _state.max = 10.01
            }
            if (!("min" in _state)) {
                _state.min = -10.01
            }
        }
        cfg.selectAll(".title").remove();
        //cfg.append("div").classed("title",true).text(d.longLabel || d.id)
        addDragTitle(d, cfg)
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
        autoscaleSet(_state.autoscale)
        var _renderContent = function () {
            state = JSON.parse(JSON.stringify(_state))
            render.color(state.color)
            render.plotMode(state.mode)
            render.barHeight(state.height - 10)

            render.autoscale(state.autoscale)
            render.vmax(state.max)
            render.vmin(state.min)

            var _height = state.height
            if (state.mode == "dense") {
                canvas.attr("height", 25) //TODO
                _height = 25
            } else {
                canvas.attr("height", state.height)
            }
            canvas.call(render)
            _addBrush()
            mask.style("display", "none")
            modal.style("display", "none");
            callback({
                "code": "state",
                "data": state
            })
            callback({
                "code": "height",
                "data": _height,
            })
        }
        cfg.selectAll(".default").remove();
        cfg.append("input")
            .attr("type", "button")
            .classed("default", true)
            .attr("value", "default")
            .on("click", function (d0) {
                _state.color = strToColor(d.id)
                _renderContent()
            })
        cfg.selectAll(".submit").remove();
        cfg.append("input")
            .attr("type", "button")
            .classed("submit", true)
            .attr("value", "submit")
            .on("click", function (d0) {
                _renderContent()
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
    //chart.data = function(_) { return arguments.length ? (data= _, chart) : data; }
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
        return arguments.length ? (regions = toolsAddChrPrefix(_), chart) : regions;
    }
    chart.callback = function (_) {
        return arguments.length ? (callback = _, chart) : callback;
    } //callback to send state;
    chart.scope = function (_) {
        return arguments.length ? (scope = _, chart) : scope;
    }
    chart.init = function (_) {
        return arguments.length ? (init = _, chart) : init;
    }
    chart.dispatch = function (_) {
        return arguments.length ? (dispatch = _, chart) : dispatch;
    }
    chart.barHeight = function (_) {
        return arguments.length ? (barHeight = _, chart) : barHeight;
    }
    chart.highlight = function (_) {
        return arguments.length ? (highlight = _, chart) : highlight;
    }
    chart.bg = function (_) {
        return arguments.length ? (bg = _, chart) : bg;
    }

    return chart
}
