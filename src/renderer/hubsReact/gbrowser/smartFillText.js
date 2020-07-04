import font from "../../../shape/font"
import vars from "./vars"
var _font = font()
export default function(ctx, id, height) {
    var ids = id.split("_")
    var l = id.length - ids.length + 1
    var offset = vars.labelWidth - _font.width * l - _font.height
    var retv = offset
    var c = ["#555", "#000"]
    ids.forEach(function(d, i) {
        ctx.fillStyle = c[i % 2]
        ctx.fillText(d, offset, height)
        offset += d.length * _font.width
    })
    return retv
}
