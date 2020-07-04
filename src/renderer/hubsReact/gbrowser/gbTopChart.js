import font from "../../../shape/font"
var handleColor = "#EEE"
const labelWidth = 140
var _font = font()

export default function() {
    var chrtrack
    var regions
    var dispatch
    var scaletrack
    var chart = function(selection) {
        var d = selection.datum();
        var genome = chrtrack.genome()
        var width = chrtrack.width()
        selection.selectAll("tr").remove();
        var trs = selection.selectAll("tr").data([{
            id: "chr"
        }, {
            id: "scale"
        }]).enter().append("tr")
        trs.each(function(d, i) {
            var tr = d3.select(this);
            var trHeight = d.id == "chr" ? 60 : 25
            var label = tr.append("td").classed("trackLabel", true)
                .style("width", labelWidth + "px")
                .style("position", "relative")

            var labelDiv = label.append("div").classed("labelDiv", true)
                .style("position", "absolute")
                .style("height", trHeight + "px")
                .style("width", labelWidth + "px")
                .style("left", "0px")
                .style("top", "0px")
                .style("background-color", "#FFFFFF")

            var labelCanvas = labelDiv.append("canvas").attr("width", labelWidth).attr("height", trHeight)
            var ctx = labelCanvas.node().getContext("2d")
            ctx.fillStyle = "#F7F7F7"
            ctx.fillRect(0, 0, labelWidth, trHeight)
            var l = d.id.length
            ctx.fillStyle = "#000"
            if (d.id == "scale") {
                ctx.font = _font.font;
                ctx.fillText(d.id, labelWidth - _font.width * l - 10, 10)
            }
            var view = tr.append("td")
                .classed("trackView", true)
                .style("width", width + "px")
                .style("height", trHeight + "px")
                .style("font-size", "10px")
                .style("position", "relative")
            var viewDiv = view.append("div").classed("viewDiv", true)
                .style("position", "absolute")
                .style("height", "100%")
                .style("width", "100%")
                .style("left", "0px")
                .style("top", "0px")
                .style("background-color", "#FFFFFF")
            if (d.id == "scale") {
                scaletrack.height(trHeight)
                viewDiv.datum(regions).call(scaletrack)
                dispatch.on("brush.axis", function(d) {
                    scaletrack.brush(d)
                })
            }
            if (d.id == "chr") {
                chrtrack.height(trHeight)
                viewDiv.datum(regions).call(chrtrack)
                ctx.fillStyle = "#777"
                ctx.fillText(genome, labelWidth - 6 * l - 60, 30)
                ctx.fillStyle = "#000"
                dispatch.on("brush.chr", function(d) {
                    chrtrack.brush(d)
                })
            }
            ctx.fillStyle = "#c19185" //TODO
            ctx.fillRect(labelWidth - 5, 0, 1, trHeight)
            ctx.fillStyle = "#000"
        })
    }
    chart.chrtrack = function(_) {
        return arguments.length ? (chrtrack = _, chart) : chrtrack;
    }
    chart.regions = function(_) {
        return arguments.length ? (regions = _, chart) : regions;
    }
    chart.dispatch = function(_) {
        return arguments.length ? (dispatch = _, chart) : dispatch;
    }
    chart.scaletrack = function(_) {
        return arguments.length ? (scaletrack = _, chart) : scaletrack;
    }
    return chart;
}
