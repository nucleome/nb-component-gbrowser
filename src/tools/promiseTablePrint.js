import {
    select
} from "d3-selection"
// Input : select table
export default function(t) {
    var selection = t.selectAll("tr")
    var heights = [];
    var widths = [];
    var h = 0
    var w = 0
    var xoffsets = []
    var yoffsets = []
    selection.each(function(d, i) {
        var tr = select(this)
        var height = 0;
        var width = 0;
        if (i == 0) {
            tr.selectAll("td").each(function(d, j) {
                widths.push(0)
            })
        }
        tr.selectAll("td").each(function(d, j) {
            var td = select(this)
            var canvases = td.selectAll("canvas")
            canvases.each(function(d) {
                var canvas = select(this)
                if (height < canvas.node().height) {
                    height = canvas.node().height
                }
                if (widths[j] < canvas.node().width) {
                    widths[j] = canvas.node().width;
                }
            })
        })
        heights.push(height)
    })
    widths.forEach(function(d, i) {
        xoffsets.push(w);
        w += d;
    })
    heights.forEach(function(d, i) {
        yoffsets.push(h);
        h += d;
    })
    t.selectAll(".tmp").remove()
    var tmpDiv = t.append("div").classed("tmp", true)
        .style("display", "none")
    var destCanvas = tmpDiv.append("canvas").attr("width", w + 20).attr("height", h + 20)
    var destCtx = destCanvas.node().getContext('2d')
    destCtx.fillStyle = "#FFF"
    destCtx.fillRect(0, 0, w + 20, h + 20)
    var draws = []
    selection.each(function(d, i) {
        var tr = select(this)
        tr.selectAll("td").each(function(d, j) {
            var td = select(this)
            var addCanvases = function() {
                var canvases = td.selectAll("canvas")
                canvases.each(function(d) {
                    var canvas = select(this)
                    destCtx.drawImage(canvas.node(), 10 + xoffsets[j], 10 + yoffsets[i])
                })
            }
            var addImgs = function() {
                var imgs = td.selectAll("img")
                imgs.each(function(d) {
                    var img = select(this).node()
                    destCtx.drawImage(img, 10 + xoffsets[j], 10 + yoffsets[i])
                })
            }
            var addSvgs = function() {
                var svgs = td.selectAll("svg")
                svgs.each(function(d) {
                    var svg = select(this).node()
                    var svgString = new XMLSerializer().serializeToString(svg);
                    var DOMURL = self.URL || self.webkitURL || self; //TODO GLobal Self
                    var svgImage = new Blob([svgString], {
                        type: "image/svg+xml;charset=utf-8"
                    });
                    var url = DOMURL.createObjectURL(svgImage);
                    draws.push(new Promise(function(resolve, reject) {
                        var img = new Image()
                        img.onload = function() {
                            destCtx.drawImage(img, 10 + xoffsets[j], 10 + yoffsets[i])
                            resolve(true)
                        }
                        img.src = url
                    }))
                })
            }
            addCanvases()
            addImgs()
            addSvgs()
        })
    })
    var print = function() {
        tmpDiv.selectAll("a").remove()
        var link = tmpDiv.append("a");
        link.attr("download", "newplot.png");
        destCanvas.node().toBlob(function(blob) {
            link.node().href = URL.createObjectURL(blob);
            link.node().click();
        }, 'image/png');
    }
    Promise.all(draws).then(print)
}
