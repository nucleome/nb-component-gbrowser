import isInt from "./isInt"
import parseInts from "./parseInts"
import isRgb from "./isRgb"

export default function(_) {
    var t
    if (typeof _ == "string") {
        t = _.split("\t")
    } else {
        t = _
    }
    if (t.length < 3) {
        return null
    }
    var a = {
        "chr": t[0],
        "start": parseInt(t[1]),
        "end": parseInt(t[2])
    }
    if (t.length == 4) {
        a["name"] = t[3]
        a["score"] = 0.0
        a["strand"] = "."
    }
    if (t.length == 5) {
        a["name"] = t[3]
        a["score"] = parseFloat(t[4])
        a["strand"] = "."
    }
    if (t.length >= 6) {
        a["name"] = t[3]
        a["score"] = parseFloat(t[4])
        a["strand"] = t[5]
    }
    if (t.length >= 9) {
        if (isInt(t[6])) {
            a["thickStart"] = parseInt(t[6])
        }
        if (isInt(t[7])) {
            a["thickEnd"] = parseInt(t[7])
        }
        if (isRgb(t[8])) {
            a["itemRgb"] = t[8]
        }
    }
    if (t.length >= 12) {
        a["blockCount"] = parseInt(t[9])
        a["blockSizes"] = parseInts(t[10])
        a["blockStarts"] = parseInts(t[11])
    }

    return a
}
