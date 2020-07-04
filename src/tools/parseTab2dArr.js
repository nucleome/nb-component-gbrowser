export default function (v) {
  var k = v[0]
  var l = k.length
  var a = new Array(l - 1)
  a.columns = v[0]
  v.forEach(function (d, i) {
    if (i == 0) {
      return
    }
    var b = {}
    d.forEach(function (d, j) {
      b[k[j]] = d
    })
    a[i - 1] = b
  })
  return a
}
