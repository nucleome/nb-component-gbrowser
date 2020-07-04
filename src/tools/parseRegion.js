export default function(s){
  var a = s.split(":")
  if (a.length==1) {
    return {
      "chr": a[0],
      "start": 0,
      "end" : undefined
    }

  }
  var x = a[1].split("-")
  return {
      "chr": a[0],
      "start": +x[0]-1,
      "end": +x[1]
  }
}
