import symbolArrow from "../symbol/arrow"
import symbolRarrow from "../symbol/rarrow"
import font from "../shape/font"

var _font = font()

function split(start, end, thickStart, thickEnd) {
  if (end < thickStart || start > thickEnd) {
    return [{
      "s": start,
      "e": end,
      "t": 0
    }]
  }
  if (start >= thickStart && end <= thickEnd) {
    return [{
      "s": start,
      "e": end,
      "t": 1
    }]
  }
  if (start < thickStart && end < thickEnd) {
    return [{
      "s": start,
      "e": thickStart,
      "t": 0
    }, {
      "s": thickStart,
      "e": end,
      "t": 1
    }]
  }
  if (start > thickStart && end > thickEnd) {
    return [{
      "s": start,
      "e": thickEnd,
      "t": 1
    }, {
      "s": thickEnd,
      "e": end,
      "t": 0
    }]
  }
  if (start < thickStart && end > thickEnd) {
    return [{
      "s": start,
      "e": thickStart,
      "t": 0
    }, {
      "s": thickStart,
      "e": thickEnd,
      "t": 1
    }, {
      "s": thickEnd,
      "e": end,
      "t": 0
    }]
  }
  return []
}
export default function () {
  var color = "blue"
  var context
  var buffer
  var width = 200
  var label = false
  var y = 0

  function chart(data) {
    var scale = d3.scaleLinear().domain([0, data.end - data.start]).range([0, width])
    if (context == null) {
      buffer = context = d3.path();
    } else {
      context.strokeStyle = context.fillStyle = color
    }
    var hs = [6,10]
    var y = 0 //TODO
    var arrows = {
      "+":d3.symbol().type(symbolArrow).size(3).context(context),
      "-":d3.symbol().type(symbolRarrow).size(3).context(context)
    }
    var arrow = arrows[data.strand]
    context.moveTo(0, y)
    context.lineTo(width, y)
    if (!buffer) {
      context.stroke();
    }
    var thickStart = data.thickStart - data.start;
    var thickEnd = data.thickEnd - data.start;
    for (var i = 0; i < data.blockCount; i++) {
      var starti = data.blockStarts[i]
      var endi = data.blockStarts[i] + data.blockSizes[i]
      var di = split(starti, endi, thickStart, thickEnd)
      di.forEach(function (d) {
        var x = scale(d.s)
        var w = scale(d.e) - x
        var h = hs[d.t]
        context.rect(x, y - h / 2, w, h)
      })
    }

    if (!buffer) {
      //context.stroke();
      // context.save();
      //context.moveTo(-110,y);
      context.fill();
      if (label) {
      context.fillStyle = "black"
      context.font = _font.font
      context.fillText(data.name, Math.round(scale(0)) - _font.width *data.name.length - _font.gap,y + 3)
      }
      //context.restore();
    }
    for (var i = 0; i < data.blockCount - 1; i++) {
      var s = scale(data.blockStarts[i] + data.blockSizes[i])
      var e = scale(data.blockStarts[i + 1])
      if(!buffer && arrow){
      context.strokeStyle = "#333333"
      context.beginPath();
      for (var j = 10; j < e - s - 10; j += 10) {
        var x = s + j
        context.translate(x, y)
        context.beginPath()
        arrow()
        //context.closePath()
        context.stroke()
        context.translate(-x, -y)
      }
    }
    }
    if (buffer) {
      return buffer + "";
    } else {

    }
  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  }
  chart.color = function (_) {
    return arguments.length ? (color = _, chart) : color;
  }
  chart.context = function (_) {
    return arguments.length ? (context = _, chart) : context;
  }
  chart.label = function(_) { return arguments.length ? (label= _, chart) : label; }
  chart.y = function(_) { return arguments.length ? (y= _, chart) : y; }
  return chart
}
