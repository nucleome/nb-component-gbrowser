export default function () {
        //var dispatcher = d3.dispatch(chart,"")
        var scale = d3.scaleLinear().domain([0, 1000]).range([0, 500])
        var el, rect;
        var x = 0,
            y = 0;
        var height = 50;
        var chart = function (selection) {
            var tickCount = 5
            var tickFormat = d3.formatPrefix(".2",1e6);
            var axisX = d3.axisBottom(scale).ticks(tickCount).tickFormat(tickFormat)
            el = selection.append("g")
                .attr("transform", "translate(" + x + "," + y + ")")
            el.call(axisX)
        }
        var response = function (d) {
            if (!arguments.length) {
                el.selectAll("rect").remove();

            } else {

                if (d.constructor !== Array) {
                    d = [d]
                }
                var rects = el.selectAll("rect").data(d)
                rects.enter()
                    .append("rect")
                    .attr("height", height)
                    .attr("fill", "black")
                    .attr("opacity", 0.2)
                    .merge(rects)
                    .attr("x", function (e) {
                        var x0 = scale(e.start) || scale(e[0]) || 0
                        var x1 = scale(e.end) || scale(e[1]) || 0
                        return Math.min(x0, x1)
                    })
                    .attr("width", function (e) {
                        var x0 = scale(e.start) || scale(e[0]) || 0
                        var x1 = scale(e.end) || scale(e[1]) || 0
                        return Math.abs(x0 - x1)
                    })
                rects.exit().remove()
            }
        }
        chart.response = function (e) {
            response(e)
        }
        chart.scale = function (_) {
            return arguments.length ? (scale = _, chart) : scale;
        }
        chart.x = function (_) {
            return arguments.length ? (x = _, chart) : x;
        }
        chart.y = function (_) {
            return arguments.length ? (y = _, chart) : y;
        }
        return chart
    }
