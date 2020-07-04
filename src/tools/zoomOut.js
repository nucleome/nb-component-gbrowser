import mergeRegions from "./mergeRegions"
export default function (regions, scaleFactor, chr2length) {
  var r = regions.map(function (d) {
    var length = chr2length[d.chr]
    var l = d.end - d.start
    var start = Math.round(d.start - (scaleFactor-1)/2 * l)
    if (start < 0) {
      start = 0
    }
    var end = Math.round(d.end + (scaleFactor-1)/2 * l)
    if (end > length) {
      end = length 
    }
    return {"chr":d.chr,"start":start,"end":end}
  })
  return mergeRegions(r)
}
