import Plotly from "plotly.js-dist"
import * as d3 from "d3"
var nice = function(a) {
    var l = a[1] - a[0];
    return [a[0] - 0.1 * l, a[1] + 0.1 * l]
}
export default function() {
    var inputs = [{
        "id": "x",
        "format": "bigwig",
    }, {
        "id": "y",
        "format": "bigwig",
    }]
    var width = 250;
    var height = 500;
    var padding = 20;
    var emit = function(d) {
        console.log(d) //TODO
    }
    var chart = function(selection) {
        var data = selection.datum();

        var width = selection.node().getBoundingClientRect().width
        var height = width
        selection.html("")
        var canvas = selection
        var vx = []
        var vy = []
        var color = d3.scaleOrdinal(d3.schemeCategory10)
        for (var i = 0; i < data.x.o.data.data.length; i++) {
            data.x.o.data.data[i].forEach(function(d) {
                vx.push(d.Sum / d.Valid)
            })

        }
        for (var i = 0; i < data.y.o.data.data.length; i++) {
            data.y.o.data.data[i].forEach(function(d) {
                vy.push(d.Sum / d.Valid)
            })
        }
        var trace1 = {
            x: vx,
            y: vy,
            type: 'histogram2d'
        };
        var d = [trace1];
        var layout = {
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 60,
            },
            title: data.x.d.id + " vs " + data.y.d.id,
            font: {
                family: "Roboto Mono, Courier New, monospace",
                size: 10,
                color: "#7f7f7f"
            }

        };
        Plotly.newPlot(canvas.node(), d, layout);
        //TODO Add HighLight and Select.


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
    return chart
}
