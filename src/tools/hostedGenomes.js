import getjson from "./getjson"
export default function (servers,callback) {
  var g = {}
  var q = []
  servers.forEach(function (d) {
    q.push(getjson(d + "/genomes"))
  })
  Promise.all(q).then(function (gs) {
    gs.forEach(function (v) {
      v.forEach(function(d){
      if (!g[d]) {
        g[d] = 1
      } else {
        g[d] += 1
      }
      })
    })
    callback(Object.keys(g).sort())
  })

}
