var colorMap = {
    "hic": "red",
    "bigwig": "black",
    "bigbed": "blue"
}
export function trackIcon(selection) {
    selection.each(function(d, i) {
        var el = d3.select(this)
        var bar = el.append("rect")
            .attr("x", 2)
            .attr("y", -10)
            .attr("height", 10)
            .attr("width", 10)
            .attr("fill", function(d) {
                return colorMap[d.format] || "grey"
            })
            .attr("opacity", 0.5)
            .on("mouseover", function(d) {
                if (d.metaLink) {
                    d3.select(this).attr("opacity", 1.0)
                }
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("opacity", 0.5)

            })
            .on("click", function(d) {
                if (d.metaLink) {
                    window.open(d.metaLink)
                }
            })
            .append("svg:title")
            .text(d.longLabel || d.id)

        var txt = el.append("text")
            .attr("x", "15")
            .style("font-size", "10px")
            .style("cursor", "default")
            .text(d.id || d.longLabel)
            .attr("pointer-events", "null")

    })
}
export function renderHubIcon(trackViews, maxrows, e) {
            var l = trackViews.length
            if (l > maxrows) {
                e.append("text").attr("x", 5).attr("y", 20 * maxrows + 25).style("font-size", "10px")
                    .text("... " + (l - maxrows + 1) + " more tracks")
                l = maxrows - 1
            }
            e.selectAll("g")
                .data(trackViews.slice(0, l))
                .enter()
                .append("g")
                .attr("transform", function(d, i) {
                    return "translate( 5," + (i * 20 + 45) + ")"
                })
                .call(trackIcon)
}

export function isRow(d) {
    if (d[0] != null && d[0] !== "") {
        return true
    }
    return false
}


export function checkBool(b) {
    if (b) {
        return null
    } else {
        return "none"
    }
}


