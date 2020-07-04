import datgui from "../../../datgui"
export default function() {
    var callback
    var chart = function(el) {
        var d = el.datum()
        el.selectAll(".nb-bw-cfg").remove();//TODO
        var cfg = el.append("div").classed("nb-bw-cfg",true)
        var autoscaleSet = function(v) {
            var a = v || null
            var b = "#44ABDA"
            if (a) {
                b = "#D7D7D7"
            }
            cfg.selectAll(".datgui").each(function(d) {
                d3.select(d.inputs["max"].domElement).select("input").attr("disabled", a).style("color", b)
                d3.select(d.inputs["min"].domElement).select("input").attr("disabled", a).style("color", b)
            })

        }
        var datIO = datgui().closable(false).callback(function(k, v) {
            if (k == "autoscale") {
                autoscaleSet(v)
            }
        });
        //TODO: ADD LAST TIME SETTING instead
        var _state = d || {}
       
        if (!("color" in _state)) {
            _state.color = "#336289"
        }
        if (!("height"in _state)) {
            _state.height = 40
        }
        if (!("mode" in _state)) {
            _state.mode = "full"
        }

        if (!("autoscale" in _state)) {
            _state.autoscale = true
        }
        if (!("max" in _state)) {
            _state.max = 10.01
        }
        if (!("min" in _state)) {
            _state.min = -10.01
        }
        var _autoscale = true
        var opts = {
            "color": _state.color,
            "height": {
                type: "range",
                min: 40,
                max: 100,
                step: 10
            },
            "mode": ["full", "dense"],
            "autoscale": _state.autoscale,
            "max": _state.max,
            "min": _state.min,
        }
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
        cfg.append("input")
            .attr("type", "button")
            .classed("submit", true)
            .attr("value", "submit")
            .on("click", function(d0) {
                callback(_state)
            })
        cfg.append("input")
            .attr("type", "button")
            .classed("reset", true)
            .attr("value", "default")
            .on("click", function() {
                callback("reset")
            })
        cfg.append("input")
            .attr("type", "button")
            .classed("cancel", true)
            .attr("value", "cancel")
            .on("click", function() {
                callback(null)
            })

    }
    chart.callback = function(_) {
        return arguments.length ? (callback = _, chart) : callback;
    }
    return chart
}
