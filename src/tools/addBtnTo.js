export default function(selection,icon){
  return selection.append("button")
    .classed("btn", true)
    .classed("btn-default", true)
    .classed("btn-xs", true)
    .classed("glyphicon", true)
    .classed("glyphicon-"+icon, true)
}
