import mergeRegions from "./fixRegions"
export default function (regions, scaleFactor, chr2length) {
  var r = regions.map(function (d) {
    var l = d.end - d.start
    var start = d.start + l / scaleFactor * (scaleFactor-1)/2
    var end = d.end - l / scaleFactor  * (scaleFactor-1)/2
    return {
      "chr": d.chr,
      "start": Math.round(start),
      "end": Math.round(end)
    }
  })
  return mergeRegions(r)
}
