import addBtnTo from "../../../tools/addBtnTo"
import toolsFixRegions from "../../../tools/fixRegions"

export default function(gbctrldiv,getSelectAxis,btnGroup,o,dispatch,getChrLength) {//regions is local, it is not object
var regions = o.regions
var navApply = function(navFunc) {
    var arr = getSelectAxis()
    arr.forEach(navFunc)
    regions = toolsFixRegions(regions)
    dispatch.call("update", this, regions)
}
dispatch.on("update.navbtn",function(d){
    regions = d
})
var btnBackward = gbctrldiv.select("#btnBackward")
    .attr("title", "backward")
    .on("click", function() {
        navApply(function(i) {
            var d = regions[i];
            d.length = getChrLength(d.chr)
            var l = Math.round((d.end - d.start) / 2)
            l = l <= d.start ? l : d.start
            regions[i].start = d.start - l
            regions[i].end = d.end - l
        })
    })
var btnForward = gbctrldiv.select("#btnForward")
    //addBtnTo(btnGroup, "forward", true)
    .attr("title", "forward")
    .on("click", function() {
        navApply(function(i) {
            var d = regions[i];
            d.length = getChrLength(d.chr)
            var l = Math.round((d.end - d.start) / 2)
            var left = d.length - d.end
            l = l < (d.length - d.end) ? l : left
            regions[i].start = d.start + l
            regions[i].end = d.end + l
        })
    })
var btnZoomOut = gbctrldiv.select("#btnZoomOut")
    //addBtnTo(btnGroup, "zoom-out")
    .attr("title", "zoom out 3x")
    .on("click", function() {
        navApply(function(i) {
            var d = regions[i]
            d.length = getChrLength(d.chr)
            var l = d.end - d.start
            regions[i].start = d.start - l < 0 ? 0 : d.start - l
            regions[i].end = d.end + l > d.length ? d.length : d.end + l
        })
    })

var btnZoomIn = gbctrldiv.select("#btnZoomIn")
    //addBtnTo(btnGroup, "zoom-in")
    .attr("title", "zoom in 3x")
    .on("click", function() {
        navApply(function(i) {
            var d = regions[i]
            var l = Math.round((d.end - d.start) / 3)
            regions[i].start = d.start + l
            regions[i].end = d.end - l
        })
    })
return  [btnBackward, btnForward, btnZoomIn, btnZoomOut]

}
