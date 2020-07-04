/* HiC format norms and units */
export default function(){
  return {
    norms :[
        "NONE",
        "VC",
        "VC_SQRT",
        "KR",
        "GW_KR",
        "INTER_KR",
        "GW_VC",
        "INTER_VC",
        "LOADED"
    ],
    units: ["BP", "FRAG"]
  }
}
/*
var default_range = function (length) {
    return Math.round(length * 2 / 10) + "-" + Math.round(length * 3 / 10)
}
*/
export function totalLength(regions) {
    var l = 0;
    regions.forEach(function (r, i) {
        l += (+r.end) - (+r.start)
    })
    return l
}
export function regionString(o) {
    return o.chr + ":" + o.start + "-" + o.end
}
