import Plotly from "plotly.js-dist"
import * as d3 from "d3"

function overlap(a, b) {
    if (a.To > b.From && b.To > a.From) return true;
    return false;
}

function less(a, b) {
    if (a.To < b.From) return true;
    return false;
}
//TODO Improve Pairs  ...
function iter(x, y) {
    var i = 0;
    var j = 0;
    var pairs = [];
    while (i < x.length || j < y.length) {
        if (i == x.length) {
            pairs.push({
                "y": y[j]
            })
            j += 1;
        } else if (j == y.length) {
            pairs.push({
                "x": x[i]
            })
            i += 1;
        } else if (overlap(x[i], y[j])) {
            pairs.push({
                "x": x[i],
                "y": y[j]
            })
            i += 1;
            j += 1;
        } else if (less(x[i], y[j])) {
            pairs.push({
                "x": x[i]
            })
            i += 1;
        } else {
            pairs.push({
                "y": y[j]
            })
            j += 1;
        }
    }
    return pairs;
}
var nice = function(a) {
    var l = a[1] - a[0];
    return [a[0] - 0.1 * l, a[1] + 0.1 * l]
}
//TODO Change to Chart JS
export default function() {
    var inputs = [{
        "id": "x",
        "format": "bigwig"
    }, {
        "id": "y",
        "format": "bigwig"
    }]
    var width = 250;
    var height = 250;
    var padding = 20;
    var dispatch = d3.dispatch("highlight")
    var emit = function(d) {
        console.log(d)
    }
    var dot = 4
    var chart = function(selection) {
        var data = selection.datum();
        var width = selection.node().getBoundingClientRect().width
        var height = width
        selection.html("")
        var canvas = selection //TODO logscale selection.

        var color = d3.scaleOrdinal(d3.schemeCategory10)
        var N
        if (typeof data == "undefined") {
            return
        }
        if (data.x.o.data.data) {
            N = data.x.o.data.data.length
        } else {
            return
        }
        var iarr = Array.apply(null, {
            length: N
        }).map(Function.call, Number);
        var both = []
        iarr.forEach(function(i) { //regions.
            var d = iter(data.x.o.data.data[i], data.y.o.data.data[i])
            var _both = d.filter(function(d) {
                d.i = i //d.i is region number;
                return d.x != undefined && d.y != undefined
            })
            _both.forEach(function(d) {
                both.push(d)
            })
        })
        var vx = both.map(function(d) {
            return d.x.Sum / d.x.Valid
        })
        var vy = both.map(function(d) {
            return d.y.Sum / d.y.Valid
        })
        var trace1 = {
            x: vx,
            y: vy,
            mode: 'markers',
            marker: {
                size: dot,
                line: {
                    color: color(1), //TODO
                    width: 0.5
                },
                opacity: 0.7
            },
            type: 'scatter'
        };
        var d = [trace1];
        var layout = {
            margin: {
                l: 35,
                r: 15,
                b: 35,
                t: 45
            },
            dragmode: "lasso",
            title: data.x.d.id + " vs " + data.y.d.id,
            xaxis: {
                title: data.x.d.id,
                showticklabels: true,
                ticks: "inside",
                autotick: true,
            },
            yaxis: {
                title: data.y.d.id,
                showticklabels: true,
                ticks: "inside",
                autotick: true,
            },
            font: {
                family: "Roboto Mono, Courier New, monospace",
                size: 10,
                color: "#7f7f7f"
            }
        };
        Plotly.newPlot(canvas.node(), d, layout);
        //TODO Add HighLight appe
        var color1Light = "#80B1D3" //TODO
        var color1 = "#FB8062"
        var size1Light = 3
        var size1 = 6
        dispatch.on("highlight", function(d) {
            var N = both.length
            var colors = new Array(N)
            var sizes = new Array(N)
            for (var i = 0; i < N; i++) {
                colors[i] = color1Light;
                sizes[i] = size1Light;
                var sign = false;
                d.forEach(function(d) {
                    if (d.chrIdx == both[i].i) {
                        if (both[i].x.To > d.start && both[i].x.From < d.end) {
                            sign = true
                        } else if (both[i].y.To > d.start && both[i].y.From < d.end) {
                            sign = true
                        }
                    }
                })
                if (sign) {
                    colors[i] = color1
                    sizes[i] = size1
                }
            }
            
            var updateStyle1 = {
                "marker.size":[sizes],
                "marker.color":[colors]
            }
            Plotly.restyle(canvas.node(),  updateStyle1, [0]);

        })
        canvas.node().on("plotly_selected", function(eventData) {
            var r = new Array(eventData.points.length)
            eventData.points.forEach(function(pt, i) {
                var d = both[pt.pointNumber]
                r[i] = [d.i, Math.min(d.x.From, d.y.From), Math.max(d.x.To, d.y.To)]
            });
            //TODO Fast Process
            emit({
                "type": "scatter",
                "code": "brush",
                "data": r
            })
        })
    }
    chart.highlight = function(d) {
        dispatch.call("highlight", this, d) //highlight regions.
    }
    chart.inputs = function() {
        return inputs;
    }
    chart.width = function(_) {
        return arguments.length ? (width = _, chart) : width;
    }
    chart.height = function(_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.emit = function(_) {
        return arguments.length ? (emit = _, chart) : emit;
    }
    chart.respond = function(d) {
        if (d.code == "brush") {
            chart.highlight(d.data)
        }
    }

    chart.dot = function(_) {
        return arguments.length ? (dot = _, chart) : dot;
    }
    return chart
}
