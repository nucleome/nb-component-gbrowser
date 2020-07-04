import vars from "./vars"

import smartFillText from "./smartFillText"

import strToColor from "../../../tools/strToColor"

import font from "../../../shape/font"
var _font = font()

export default function(d, stateMap, labelCanvas, labelDiv, fontstyle, height) {
    var labelWidth = vars.labelWidth;
    var label = d.id
    var ctx = labelCanvas.node().getContext("2d")
    ctx.fillStyle = "#F7F7F7"
    ctx.fillRect(0, 0, labelWidth, height)
    if (stateMap[d.id] && stateMap[d.id]["mode"] && stateMap[d.id]["mode"] == "dense") {
        ctx.fillStyle = stateMap[d.id]["color"] || strToColor(d.id)
    } else {
        ctx.fillStyle = "#000"
    }
    if (stateMap[d.id] && ("alias" in stateMap[d.id]) && stateMap[d.id]["alias"].length > 0) {
        label = stateMap[d.id]["alias"]
    }
    var l = label.length;
    ctx.font = fontstyle;
    var offset = labelWidth - _font.width * l - _font.height
    if (offset > 0) {
        ctx.fillText(label, offset, _font.height) //TODO
    } else {
        offset = smartFillText(ctx, label, _font.height)
    }
    ctx.fillStyle = "#c19185" //TODO
    ctx.fillRect(labelWidth - 5, 0, 1, height)
    ctx.fillStyle = "#000"
    if (offset < 0) {
        labelDiv.selectAll("svg").remove();
        var svg = labelDiv.append("svg").attr("width", labelWidth).attr("height", height)
        svg.append("rect").attr("width", labelWidth).attr("height", 10).attr("opacity", 0).append("title").text(label)
    }
}
