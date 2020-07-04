function _merge_bed6(beds,id) {
  var l = []
  var strand = beds[0].strand
  beds.forEach(function(d,i){
    l.push([d.start,-1])
    l.push([d.end,1])
    if (strand!=d.strand) {
      strand = "."
    }
  })
  var chr = beds[0].chr
  l.sort()

  var start = l[0][0]
  var end = l[len(l)-1][0]

  var state = 1
  var toggle = 1
  var lastPos = l[0][0]
  var blockSizes = []
  var blockStarts = []
  l.forEach(function(d,i){
    state -= d[1]
    if (toggle == 1 && state == 0 ) {
      blockStarts.push(lastPos - start)
      blockSizes.push(d[0]-lastPos)
      toggle = 0
    }
    if (toggle == 0 && state > 0) {
      lastPos = d[0]
      toggle = 1
    }
  })
  var blockCount = len(blockSizes)
  //TODO
  return {
    "chr":chr,
    "start":start,
    "end":end,
    "id" : id || "noname",
    "score" : 0.0,
    "strand" : strand,
    "thickStart" : start,
    "thickEnd" : start,
    "itemRgb" : "0,0,0",
    "blockCount" : blockCount,
    "blockSizes" : blockSizes,
    "blockStarts" : blockStarts,
  }


}
function _slice(bed12,start,end,suffix) {
  suffix = suffix || "_sliced"
  var chr = bed12.chr
  if (start < bed12.start) {
    start = bed12.start
  }
  if (end > bed12.end) {
    end = bed12.end
  }
  var blockCount = 0
  var sliceBlockStarts = []
  var sliceBlockSizes = []
  for (var i=0;i<bed12.blockCount;i++) {
    var exonStart = bed12.blockStarts[i]  + bed12.start
    var exonEnd = exonStart + bed12.blockSizes[i]
    var sliceStart = Math.max(start,exonStart)
    var sliceEnd = Math.min(end,exonEnd)
    if (sliceStart<sliceEnd) {
      blockCount += 1
      sliceBlockStarts.push(sliceStart - start)
      sliceBlockSizes.push(sliceEnd-sliceStart)
    }
  }
  if (blockCount==0) {
    return undefined
  } else {
    return {
      "chr" : bed12.chr,
      "start" : start,
      "end" : end,
      "id"  : bed12.id+suffix || "noname",
      "strand" : bed12.strand,
      "score"  : bed12.score,
      "thickStart" : Math.max(start,bed12.thickStart),
      "thickEnd" : Math.min(end,bed12.thickEnd),
      "itemRgb" : bed12.itemRgb,
      "blockCount": blockCount,
      "blockSizes": sliceBlockSizes,
      "blockStarts": sliceBlockStarts,
    }
  }

}
export default function(bed12) {
  if (bed12.thickStart==bed12.thickEnd) {
    return undefined
  }
  return _slice(bed12,bed12.thickStart,bed12.thickEnd,"_cds")
}
