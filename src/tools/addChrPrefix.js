export default function(r) { 
    var s = []
    r.forEach(function(d) {
      if (d.chr) { //TODO 
        s.push({
            "start": d.start,
            "end": d.end,
            "chr": "chr" + d.chr.replace("chr", "").replace("Chr","")
        })
      } 
    })
    return s
}
