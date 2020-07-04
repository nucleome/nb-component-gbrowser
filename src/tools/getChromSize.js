var chromSizes = {

}
function parseChromSize(d) {
    var rows = d.split("\n")
    return rows.map(function(d){
        var a = d.split("\t")
        return {"Name":a[0],"Length":parseInt(a[1])}
    })
}
function _getChromSize(genome,callback) {
        fetch("/static/data/chromSizes/"+genome+".chrom.sizes",{credentials: 'include'}).then(function(d){
          return d.text()
        }).then(function(d){
            callback(parseChromSize(d))
        }).catch(function(e){
            console.log(e)
            callback(null)
        })
}
export default function(genome,callback) {
    if (genome in chromSizes) {
        callback(chromeSizes[genome])
    } else {
        _getChromSize(genome,callback)
    }
}
