export default function(r) {
    var a = []
    r.forEach(function(d) {
      if(d.chr) {//TODO FIX
        a.push({
            "chr": d.chr.replace("chr", "").replace("Chr",""),
            "start": d.start,
            "end": d.end
        })
       }    
    })
    return a
}
