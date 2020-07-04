export default function () {
  var inputs = [{"id":"v","format":"bigwig,bigbed"}]
  var chart = function(selection){
    var data = selection.datum();
    selection.html("<pre style='overflow-y:auto;height:200px'>"+JSON.stringify(data.v,undefined,4)+"</pre>") //TODO D,O
  }
  chart.inputs = function () {
    return inputs;
  }
  chart.width = function(_) { return arguments.length ? (width= _, chart) : width; }
  chart.height = function(_) { return arguments.length ? (height= _, chart) : height; }
  chart.emit = function(_) { return arguments.length ? (emit= _, chart) : emit; }
  return chart
}
