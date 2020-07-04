import {format} from "d3-format"
var niceFormat = format(",")
export default function(d) {
    return d.chr + ":" + niceFormat(d.start+1) + "-" + niceFormat(d.end)
}
