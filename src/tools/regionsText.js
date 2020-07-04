import regionText from "./regionText"

export default function(regions) {
    if (typeof regions == "undefined") {
        return ""
    }
    var r = []
    regions.forEach(function(d) {
        r.push(regionText(d))
    })
    return r.join(",")
}
