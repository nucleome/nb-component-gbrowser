export default function(chrToLength, maxn){
  var a = Object.keys(chrToLength)
  var defaultRegions =[]
  a.sort(function (x, y) {
    return chrToLength[y] - chrToLength[x]
  })
  for (var i=0;i<Math.min(a.length,maxn);i++) {
    defaultRegions.push({
      chr: a[i],
      start: Math.round(chrToLength[a[i]] * 2 / 10),
      end: Math.round(chrToLength[a[i]] * 3 / 10)
    })
  }
  return defaultRegions
}
