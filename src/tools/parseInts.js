export default function(s) {
  var a = []
  s.split(",").forEach(function (d) {
    a.push(parseInt(d))
  })
  return a;
}
