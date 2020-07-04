export default function(d) {
    var r = d.prefix + "|" + d.format + "|" + d.id + "|" + (d.server || "")
    if (d.omero) {
        r += "|" + d.omero
    } 
    if (d.group && !d.omero) {
        r += "||" + d.group
    }
    if (d.group && d.omero) {
        r += "|" + d.group
    } 
    return r
}
