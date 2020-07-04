function overlap(a,b){
  if (a.chr!=b.chr) {
    return false
  }
  if (a.start > b.end || b.start > a.end) {
    return false
  }
  return true
}
function _intersect(a,b) {
  return {
    "chr":a.chr,
    "start":Math.max(a.start,b.start),
    "end":Math.min(a.end,b.end)
  }
}
function intersect(a,b) {
  if (overlap(a,b)) {
    _intersect(a,b)
  }
  else {
    return undefined;
  }
}

export default function() {
  var domain; // regions {"chr":name,"start":x,"end":y}
  var gap = 10; //TODO.
  var range;//[0,width] or any scale.

  /*
   * return [[start,end],[start,end] ...]
   */
  var scales = []
  var scale2d = []
  var init = false;
  var initialize = function() {
    scales = []

    init = true;
    var l = 0;
    domain.forEach(function(d){
      l += d.end-d.start
    })
    var eW = range[1]-range[0] - gap * (domain.length-1)
    var offset = range[0]
    domain.forEach(function(d){
      var w = eW * (+d.end-d.start) / l
      scales.push(d3.scaleLinear().domain([+d.start,+d.end]).range([offset,offset+w]))
      offset += w+gap

    })


  }
  var chart = function(r) { //d = {"chr":name,"start":x,"end":y}
      if (init==false) {
        initialize()
      }
      var overlaps =[]
      domain.forEach(function(d,i){
          if (overlap(d,r)) {
            var v = _intersect(d,r)
            var _d = [scales[i](v.start),scales[i](v.end)]
              if ("color" in r) {
                  _d.color = r.color
              }
            overlaps.push(_d)
          }
      })
      return overlaps;
  }

  chart.invert = function(value) { //TODO.

  }

  chart.scales = function(_) { return arguments.length ? (scales= _, chart) : scales; }
  chart.gap = function(_) { return arguments.length ? (gap= _, init=false, chart) : gap; }
  chart.domain = function(_) { return arguments.length ? (domain= _,init=false, chart) : domain; }
  chart.range = function(_) { return arguments.length ? (range= _,init=false, chart) : range; }
  return chart
}
