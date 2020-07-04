import regionNiceText from "./regionNiceText"

export default function(regions) {
    if (typeof regions == "undefined") {
        return ""
    }
    var r = []
    regions.forEach(function(d) {
        r.push(regionNiceText(d))
    })
    return r.join("; ")
}
