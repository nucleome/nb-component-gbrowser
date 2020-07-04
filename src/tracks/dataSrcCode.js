export default function(d) {
    var r = d.prefix + "|" + d.format + "|" + d.id + "|" + (d.server || "")
    if (d.omero) {
        r += "|" + d.omero
    } 
    return r
}
