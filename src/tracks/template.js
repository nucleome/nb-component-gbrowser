/*Template for New Track TYPE
  Interface for hubs.js:
  tracksRender[d.format]()
   .regions(regions)
   .canvas(canvas)
   .modal(modal)
   .mask(mask)
   .scope(scope)
   .dispatch(dispatch)
   .width(scope.edge)
   .init(initMap[d.id] || {})
   .state(state)
   .callback(function (_) {
  })

  tracks[id].brush(_)

  tracks[id].config()

  Step.1 AddTo tracks/renders.js
  Step.2 Add Support in data/trackManager.go => indexed.Magic _format_:[format]:URI
  TODO: make data loader works in other format .
  TODO Step.3   make trackManager2.go works. 
 */
import font from "../shape/font"
var _font = font()

export default function () {
  var gap = 20
  var width
  var height
  var modal
  var mask
  var scope
  var dispatch
  var state
  var callback = function(_){
    console.log("TODO callback ",_)
    // callback function in hubs
    // in ～ line 1166
    // dispatch by _.code
  }
  var chart = function (el) {
    el.html("TODO render")
  }

  /* brush in hubs.js ~ line 1247 */
  chart.brush = function (d) { //TODO interface for respose hubs brush.
    console.log("TODO brush", d)
  }
  chart.width = function (_) {
    return arguments.length ? (width = _, chart) : width;
  }
  chart.height = function (_) {
    return arguments.length ? (height = _, chart) : height;
  }
  chart.gap = function (_) {
    return arguments.length ? (gap = _, chart) : gap;
  }
  chart.modal = function (_) {
    return arguments.length ? (modal = _, chart) : modal;
  }
  chart.mask = function (_) {
    return arguments.length ? (mask = _, chart) : mask;
  }
  chart.scope = function (_) {
    return arguments.length ? (scope = _, chart) : scope;
  }
  chart.dispatch = function (_) {
    return arguments.length ? (dispatch = _, chart) : dispatch;
  }
  chart.state = function (_) {
    return arguments.length ? (state = _, chart) : state;
  }
  chart.callback = function(_) { return arguments.length ? (callback= _, chart) : callback; }

  chart.init = function(_) {
    //TODO
  }

  /* TODO: MODULIZED CONFIG WRITING
   * TO REVISE CONFIG BASED ON THE TRACK
   */
  chart.config = function() {
    modal.selectAll("div").remove();
    var cfg = modal.append("div")
    /* Example
    var datIO = datgui().closable(false);
    var opts = {
      "color": state["color"] || strToColor(d.id),
      "height": {
        type: "range",
        min: 30,
        max: 100,
        step: 10
      },
    }
    var _state = JSON.parse(JSON.stringify(state))
    _state.color = _state.color || strToColor(d.id)
    _state.height = _state.height || barHeight + 10
    cfg.selectAll(".datgui").remove();
    cfg.selectAll(".datgui")
      .data([{
        "options": opts,
        "config": _state
      }])
      .enter()
      .append("div")
      .classed("datgui", true)
      .call(datIO)
    var _renderContent = function () {
      state = JSON.parse(JSON.stringify(_state))
      render.color(state.color)
      render.barHeight(state.height - 10)
      canvas.attr("height", state.height - 10)
      canvas.call(render)
      _addBrush()
      mask.style("display", "none")
      modal.style("display", "none");
      //state = JSON.parse(JSON.stringify(_state))

      callback({
        "code": "state",
        "data": state
      })
      callback({
        "code": "height",
        "data": state.height,
      })
    }
    cfg.selectAll(".default").remove();
    cfg.append("input")
      .attr("type", "button")
      .classed("default", true)
      .attr("value", "default")
      .on("click", function (d0) {
        _state.color = strToColor(d.id)
        _renderContent()
      })
    cfg.selectAll(".submit").remove();
    cfg.append("input")
      .attr("type", "button")
      .classed("submit", true)
      .attr("value", "submit")
      .on("click", function (d0) {
        _renderContent()
      })
    */
    cfg.selectAll(".cancel").remove();
    cfg.append("input")
      .attr("type", "button")
      .classed("cancel", true)
      .attr("value", "cancel")
      .on("click", function (d0) {
        mask.style("display", "none")
        modal.style("display", "none");
      })

  }
  return chart
}
