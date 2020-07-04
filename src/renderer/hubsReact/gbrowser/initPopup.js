export default function(contentDiv){
    var pop = {}
    pop.main = contentDiv.append("div")
        .attr("class", "popup")
        .style("display", "none")
    var popup  = pop.main
    var popupLabel = popup.append("label")
    var ul = popup.append("ul")
    pop.cfg = ul.append("li").text("config")
    pop.highlight = ul.append("li").text("highlight")
    pop.dense = ul.append("li").text("dense")
    pop.full = ul.append("li").text("full")
    pop.hide = ul.append("li").text("hide")
    pop.cancel = ul.append("li").text("cancel").on("click", function() {
        popup.style("display", "none")
    })
    return pop
}
