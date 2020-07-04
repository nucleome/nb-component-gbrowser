/*trackManager:
      bed tile layout manager
 */
export default function () {
  var callback
  var minSize = 0;
  var coord;
  var labelSize = 110; //TODO.
  //var rectClass = "bed6"
  var trackHeight = 5;
  var trackSize = 1000;
  var trackNumber = 0;
  var trackAvailableArray = Array.apply(null, Array(trackSize)).map(Number.prototype.valueOf, -labelSize - 10);

  var minTrackId = function () {
    var i = 0;
    var x = trackAvailableArray[0];
    trackAvailableArray.forEach(function (d, j) {
      if (d < x) {
        x = d;
        i = j
      }
    })
    return i;
  }

  var _trackAvailable = function (d) {
    var start_pos = d.x;
    for (var i = 0; i < trackSize; i++) {
      if (trackAvailableArray[i] + labelSize <= start_pos  ) {
        return {"i":i,"c":false};
      }
    }
    return {"i":minTrackId(),"c":true};
  }
  var _putToTrack = function (d, i) {
    d.forEach(function (d) {
      var l = Math.max(d.l,minSize)
      if (trackAvailableArray[i] < d.x + l) {
        trackAvailableArray[i] = d.x + l
      }
    })
    if (trackNumber < i) {
      trackNumber = i
    };
  }
  var trackAssign = function(d) {
    var r = {i:0,c:false};
    d.forEach(function (d0) {
      var x = _trackAvailable(d0)
      if (r.i <= x.i) {
         r.i = x.i;
         r.c = x.c;
      }
    })
    _putToTrack(d, r.i)
    return r
  }

  var chart = function (selection) {
  
  }
  chart.AssignTrack = function(d) {
    var r = coord(d);
    return trackAssign(r)
  }
  chart.trackSize = function (x) {
    if (!arguments.length == 0) {
      trackSize = x;
      trackAvailableArray = Array.apply(null, Array(trackSize)).map(Number.prototype.valueOf, 0);
      trackNumber = 0; //reset track index;
      return chart
    } else {
      return trackSize;
    }
  }
  chart.trackHeight = function (x) {
    if (!arguments.length == 0) {
      trackHeight = x;
      return chart
    } else {
      return trackHeight;
    }
  }
    chart.trackNumber = function() {
        return trackNumber
    }

  chart.coord = function (_) {
    return arguments.length ? (coord = _, chart) : coord;
  }
  chart.regions = function (_) {
    return arguments.length ? (regions = _, chart) : regions;
  }
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  }
  chart.labelSize = function(_) { return arguments.length ? (labelSize= _, chart) : labelSize; }
  chart.minSize = function(_) { return arguments.length ? (minSize= _, chart) : minSize; }
  
  return chart;
}
