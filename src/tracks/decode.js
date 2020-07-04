export default function (v) {
  var x = v.split("|")
  var r = {
    "prefix": x[0],
    "format": x[1],
    "id": x[2],
    "server": x[3] || "",
  }
  if (x.length > 4) {
    r.omero = x[4]
  }
  if (x.length > 5) {
    r.group = x[5]
  }
  return r
}
