
/* TODO: Using Genome Turing To Merge */
function compare(a,b) {
  if(a.chr < b.chr) {
    return -1
  }
  if (a.chr > b.chr) {
    return 1
  }
  if (a.start < b.start) {
    return -1
  }
  if (a.start > b.start) {
    return 1
  }
  if (a.end < b.end) {
    return -1
  }
  if (a.end > b.end) {
    return 1
  }
  return 0
}

function nearby(a,b) {
    if (a.chr!=b.chr) {return false}
    var l = Math.max(a.end,b.end) - Math.min(a.start,b.start)
    if (((a.end-a.start)+(b.end-b.start))/ l > 0.95) {
      return true
    }
    return false
}
function merge(a,b) {
    return {"chr":a.chr,"start":Math.min(a.start,b.start),"end":Math.max(a.end,b.end)}
}
/* input :regions, regions in sort??
 * output : merged regions */
/* TODO Fast Merge Regions for Scatter Plot */
/* Genome Coordinates Turing Machine Merge */

function fixed(regions) {
  if (regions.length==1) {
    return regions;
  }
  for (var i = 0;i<regions.length-1;i++){
    if (nearby(regions[i],regions[i+1])) {
      var k = [];
      for(var j=0;j<i;j++) {
        k.push(regions[j])
      }
      k.push(merge(regions[i],regions[i+1]))
      for (var j=i+2;j<regions.length;j++) {
        k.push(regions[j])
      }
      return fixed(k)
    }
  }
  return regions;
  /*
  if (nearby(regions[0],regions[1])) {
    return [merge(regions[0],regions[1])]
  } else {
    return regions
  }
  */
}
export default function(regions) {
  var k = [];
  regions.forEach(function(d){
    if (d.chr!="" && d.start != undefined && d.end != undefined) {
      k.push(d)
    }
  })
  k.sort(compare)
  return fixed(k)
}
