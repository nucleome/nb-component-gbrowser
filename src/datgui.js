import * as d3 from "d3"
import dat from "dat.gui"

var factory = function (data, config) {
  var c = config
  for (var k in data) {
    if (data[k].type == "range") {

    } else {
      if (!c[k]) {
        if (Object.prototype.toString.call(data[k]) === '[object Array]') {
          c[k] = data[k][0]
        } else if (typeof data[k] === 'string') {
          c[k] = data[k]
        } else if (typeof data[k] === 'boolean') {
          c[k] = data[k]
        } else {
          c[k] = 0 //TODO
        }
      }
    }
  }
}

export default function () {
  var callback
  var closable = true
  var width = 200;
  var dispatch = d3.dispatch("updateDisplay")

  var chart = function (selection) {
    selection.each(function (d) {
      var el = d3.select(this)
      el.selectAll(".guidiv").remove()
      var gui = new dat.GUI({
        autoPlace: false,
        width: width
      })
      d.gui = gui //TODO
      if (!closable) {
        gui.__closeButton.style.display = "none"
      }
      factory(d.options, d.config)
      var inputs = {}
      d.inputs = inputs //TODO
      for (var k in d.options) {
        var v = d.options[k]
        if (v.type == "range") {
          if (v.min != undefined && v.max != undefined) {
            inputs[k] = gui.add(d.config, k, v.min, v.max)

            if (v.step) {
              inputs[k].step(v.step)
            }
            inputs[k].listen()
          }
        } else {
          if (Object.prototype.toString.call(d.options[k]) === '[object Array]') {
            inputs[k] = gui.add(d.config, k, d.options[k]).listen()
          } else if (typeof d.options[k] === 'string' && (d.options[k].match(/^#\S\S\S\S\S\S$/) || d.options[k].match(/^#\S\S\S$/))) {
            inputs[k] = gui.addColor(d.config, k)//.listen()
          } else if (typeof d.options[k] === 'boolean') {
            inputs[k] = gui.add(d.config, k).listen()
          } else if (typeof d.options[k] === "number") {
            inputs[k] = gui.add(d.config, k).step(0.01)
            //console.log("number", k,inputs[k].domElement.parentNode.parentNode)
          } else {
            inputs[k] = gui.add(d.config, k, d.options[k])
          }
        }
      }
      if (callback) {
        Object.keys(inputs).forEach(function(k){
           inputs[k].onFinishChange(function (value) {
             callback(k, value) //callback key and value
           })
        })
      }
      dispatch.on("updateDisplay", function () {
        for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
        }
      }) 
      var el0 = el.append("div").classed("guidiv", true).node();
      el0.appendChild(gui.domElement)
    })

  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  }
  chart.callback = function (_) {
    return arguments.length ? (callback = _, chart) : callback;
  }
  chart.closable = function (_) {
    return arguments.length ? (closable = _, chart) : closable;
  }
  chart.updateDisplay = function() {
    dispatch.call("updateDisplay",this,{})
  }

  return chart
}
