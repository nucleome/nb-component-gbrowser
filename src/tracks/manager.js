import db from "./db"
import randomString from "../tools/randomString"
import code from "./code"
import decode from "./decode"
import datacode from "./dataSrcCode"

import addDrag from "../tools/addDrag"
//import 'jquery-ui-bundle';
//TODO Change Layouts of Track DB
function concat(a, b) {
    if (a == "") {
        return b
    } else {
        return a + "/" + b
    }
}

var info = function(el) {
    var k = $(el).closest("li")
    var id = k.attr("id")
    if (!k.attr("infoToggled")) {
        k.find(".infoDiv").show();
        k.attr("infoToggled", true)
    } else {
        k.find(".infoDiv").hide();
        k.removeAttr("infoToggled");
    }
}

var colors = {
    "hic": "#DD0000",
    "bigwig": "#000000",
    "bigbed": "#0000FF",
    "binindex": "#D0E000",
}
//color code TODO add Group
var color = function(format) {
    return colors[format] || "#777"
}

export default function() {
    //var dbMem = {} //store more keys
    var recover = function(ki) {
        var data = []
        for (var i = 0; i < ki.size; i++) {
            data.push({
                "i": i
            })
        }
        Object.keys(ki).forEach(function(k) {
            var d = decode(k)
            data[ki[k]] = d
        })
        return data
    }
    var callback = function(d) {
        console.log(d)
    }
    var t;
    var trackUlName;
    var dbDivName;
    var tracks;
    var dbs;
    var dbMap = {};
    //var src;
    //searchLiChart : ??
    var searchLiChart = function() {
       var chart = function(selection) {
            selection.each(function(d) {
                var li = d3.select(this)
                addDrag(li,d)
                var liHead = li.append("div").style("width", "55px").style("height", "2px") //.style("float","left")
                var liTitle = li.append("div").style("height","20px")

                liHead.style("background-color", function(d) {
                    return color(d.format)
                })

                liTitle.append("span").classed("trackLiName", true).text(function(d) {
                    return d.id
                })
                var btns = liTitle.append("span").classed("btns", true).classed("btn-group",true)
                    .style("float", "right")
                var liBody = li.append("div").classed("body", true).style("color","#777")
                if ("longLabel" in d) {
                    liBody.append("div").text(d.longLabel)
                }
                if ("metaLink" in d) {
                    liBody.append("div").append("a").attr("href",d.metaLink).attr("target","_blank").text("Read More...")
                }

                var addBtn = btns.append("button")
                    .classed("btn", true)
                    .classed("btn-default", true)
                    .classed("btn-xs", true)
                    .classed("glyphicon", true)
                    .classed("glyphicon-ok", true)

                addBtn.on("click", function(d) {
                    /* TODO: Improve selection by code 
                    */
                    var c0 = code(d)

                    dbMap[concat((d.server || ""), d.prefix)].selectAll("li").filter(function(d) {
                        var c1 = code(d)
                        if (c0 == c1) {
                            return true
                        } else {
                            return false
                        }

                    }).each(function(d) {
                        var el = d3.select(this)
                        el.on("submit")(d)
                    })
                    li.remove()
                })
            })
        }
        return chart
    }
    

    var reorder = function(d) {
        //re-order buffers event?
    }
    var self;
    var chart = function(el) {
        self = el;
        var d = el.datum();
        el.selectAll("div").remove()
        trackUlName = randomString();
        dbDivName = randomString();
        el.classed("row", true)
        var trackContainer = el.append("div")
        var dbContainer = trackContainer //TODO
        tracks = trackContainer.append("div").classed("tracksListDiv", true).classed("panel", true).classed("panel-info", true)
        var dbCtrl = dbContainer.append("div").style("padding", "2px")
        var tabBrowse = dbCtrl.append("button").classed("btn", true).classed("btn-success", true).classed("btn-xs", true).text("browse")
            .on("click", function() {
                dbTabs.style("display", "flex")
                dbs.style("display", "flex")
                dbSearch.style("display", "none")
                d3.select(this).classed("btn-success", true)
                d3.select(this).classed("btn-default", false)
                tabSearch.classed("btn-success", false).classed("btn-default", true)
            })
        /* TODO : Search Li Chart */

        var searchLi = searchLiChart()
        var tabSearch = dbCtrl.append("button").classed("btn", true).classed("btn-default", true).classed("btn-xs", true).text("search")
            .on("click", function() {
                dbTabs.style("display", "none")
                dbs.style("display", "none")
                 d3.select(this).classed("btn-success", true)
                d3.select(this).classed("btn-default", false)
                dbSearch.style("display", "flex")
                tabBrowse.classed("btn-success", false).classed("btn-default", true)
            })

        var dbSearch = dbContainer.append("div").style("display", "none")
        //.text("Under Constructing")
        var dbSearchPanel = dbSearch.append("div")
            .classed("panel", true)
            .classed("panel-default", true)
            .classed("tracksListDiv",true)
            //.style("width", "400px") //TODO
        var dbSearchPanelHeader = dbSearchPanel.append("div").classed("panel-heading", true)
        dbSearchPanelHeader.append("span").classed("panel-title", true).style("padding-right","5px").text("Search")
        /*
        var dbSearchPanelBtns = dbSearchPanelHeader.append("span").classed("btns", true).style("float-right", true)
        
        dbSearchPanelBtns.append("button")
            .classed("btn", true)
            .classed("btn-default", true)
            .classed("btn-xs", true)
            .classed("glyphicon", true)
            .classed("glyphicon-info", true)
        */
        var dbSearchPanelBody = dbSearchPanel.append("div").classed("panel-body", true)
        var searchInput = dbSearchPanelHeader.append("input").attr("type", "text").classed("input-xs", true)
            .on("change", function(d) {
                dbSearchPanelBody.text("") //TODO FiX
                var ulSearch = dbSearchPanelBody.append("ul").classed("tracksList",true)
                var key = searchInput.node().value
                var a = []
                var currents = {}
                self.selectAll(".buffer").each(function(d) {
                    currents[code(d)] = true
                })
                if (key.length >= 2) {
                    var re = new RegExp(key)
                    d.forEach(function(db) {
                        //TODO: Hide AllReady in Mem
                        db.tracks.forEach(function(d) {
                            if ((re.test(d.id) || re.test(d.longLabel)) && (!(code(d) in currents))) {
                                a.push(d)
                            }
                        })
                    })
                }
                //ADD Tabs and Select Track classed in.
                //TODO Search In Add In Button

                ulSearch.selectAll("li").data(a).enter().append("li").call(searchLi)


            })

        var addAllSearch = dbSearchPanelHeader.append("button").classed("btn", true).classed("btn-default", true)
            .classed("btn-xs", true)
            .on("click", function() {
                dbSearch.select("ul").selectAll(".glyphicon-ok").each(function(d) {
                    d3.select(this).on("click")(d)
                })

            })
            .classed("glyphicon",true)
            .classed("glyphicon-plus",true)
            .attr("title","Add all")



        var dbTabs = dbContainer.append("div").append("select")
            .classed("btn",true)
            .classed("btn-xs",true)
            .classed("btn-default",true)
        dbs = dbContainer.append("div").attr("id", dbDivName)
            .style("display", "flex")
            .style("overflow-x", "auto")
            .style("overflow-y", "auto")
        var head = tracks.append("div").classed("panel-heading", true)
        var title = head.append("div").classed("panel-title", true).text("tracks")
        var pbody = tracks.append("div").classed("panel-body", true)

        t = pbody.append("ul").attr("id", trackUlName).classed("tracksList", true)
        //TODO Group Managers Here
        // var groupMap = {}
        // var groupDiv = pbody.append("div").style("display", "none").html("todo group manager")
        // var groupMap = 
        //t.append("li").text("DNA") //TODO

        var ctrl = title.append("div").style("float", "right").classed("btn-group",true)
        ctrl.append("button")
            .classed("btn", true)
            .classed("btn-default", true)
            .classed("btn-xs", true)
            .on("click", function() {
                var idsInOrder = $(t.node()).sortable("toArray");
                callback(idsInOrder)
            })
            .on("touchstart", function() {
                d3.select(this).on("click")();
            })
            .classed("glyphicon", true)
            .classed("glyphicon-play-circle", true)
            .attr("data-toggle", "tooltip")
            .attr("title", "submit")

             ctrl.append("button")
            .classed("btn", true)
            .classed("btn-default", true)
            .classed("btn-xs", true)
            .on("click", function() {
                el.selectAll(".buffer").remove()
                el.selectAll(".in").classed("in", false).style("display", "block")
                el.datum().forEach(function(d) {
                    d.reset()
                })


            })
            .on("touchstart", function() {
                d3.select(this).on("click")();
            })
            .classed("glyphicon", true)
            .classed("glyphicon-remove-circle", true)
            .attr("data-toggle", "tooltip")
            .attr("title", "clear")


        ctrl.append("button")
            .classed("btn", true)
            .classed("btn-default", true)
            .classed("btn-xs", true)
            .on("click", function() {
                chart.sort();
            })
            .on("touchstart", function() {
                d3.select(this).on("click")();
            })
            .classed("glyphicon", true)
            .classed("glyphicon-sort", true)
            .attr("data-toggle", "tooltip")
            .attr("title", "sort")
       
        var _info = false;
        ctrl.append("button")
            .classed("btn", true)
            .classed("btn-default", true)
            .classed("btn-xs", true)
            .on("click", function() {
                //chart.sort();
                _info = !_info;
                d3.select(this).classed("btn-default",!_info).classed("btn-success",_info)
                //TODO
                t.selectAll("li").each(function(d){
                var el = d3.select(this)
                if (_info) {
                    el.attr("infoToggled",_info)
                } else {
                    el.attr("infoToggled",null)
                }
                if (_info) {
                    el.selectAll(".infoDiv").style("display", null)
                } else {
                    el.selectAll(".infoDiv").style("display", "none")
                }
            })

            })
            .on("touchstart", function() {
                d3.select(this).on("click")();
            })
            .classed("glyphicon", true)
            .classed("glyphicon-info-sign", true)
            .attr("data-toggle", "tooltip")
            .attr("title", "info")


        var c = db().tracksDiv(trackUlName)
    
        //TODO Tabs
        //Add Tabs Here
        //TODO SHOW

        dbTabs
            .selectAll("option")
            .data(d)
            .enter()
            .append("option")
            .attr("value",function(d,i){
                return i
            })
            .text(function(d) {
                var a = d.prefix.split("/")
                a.shift()
                return a.join("/")
            })
            /*
            .classed("btn", true)
            .classed("btn-xs", true)
            .classed("btn-default", true)
           */
        dbTabs 
            .on("change", function() {
                var i = parseInt(d3.select(this).property('value'));
                dbs.selectAll(".tracksListDiv").style("display", "none")
                //dbTabs.selectAll(".btn-success").classed('btn-success', false).classed('btn-default', true)
                //dbTabs.select(".btn:nth-child(" + (i + 1) + ")").classed('btn-success', true).classed("btn-default", false)
                dbs.select(".tracksListDiv:nth-child(" + (i + 1) + ")").style("display", null)
            })

        dbs.selectAll(".tracksListDiv")
            .data(d)
            .enter()
            .append("div")
            .style("flex-shrink", 0)
            .attr("id", function(d) {
                dbMap[concat((d.server || ""), d.prefix)] = d3.select(this);
                return "src_" + concat((d.server || ""), d.prefix)
            })
            .classed("tracksListDiv", true)
            .style("display", "none")
            .call(c)


        dbs.select(".tracksListDiv:nth-child(1)").style("display", null)
        //dbTabs.select(".btn:nth-child(1)").classed("btn-success", true).classed("btn-default", false)

    }
    //reorder the selected entries;

    //TODO.
    chart.del = function(d) {
        //Delete Not Working in This Way
        dbMap[concat((d.server || ""), d.prefix)].selectAll("li").filter(function(d0) {
                return d0.format == d.format && d0.id == d.id
        }).each(function(d){
            d3.select(this).on("out")();
        })
        //.classed("in", false).style("display", null)
        self.selectAll(".buffer").filter(function(d0) {
            return d0.format == d.format && d0.id == d.id && d0.server == d0.server
        }).remove();
        //TODO: process del in db ??? 
        
        /* 
        Object.key(dbMap).forEach(function(k){
           var el = dbMap[k]
            el.datum()["reset"]()
        })
        */
    }
    chart.sort = function(d) {
        if (arguments.length) {
            var codes = function(a) {
                return d[code(a)] 
            }
            t.selectAll("li").sort(function(a,b){
              return codes(a) - codes(b)
            })

        } else {
             t.selectAll("li").sort(function(a, b) {
                if (a == undefined) {
                    return -1
                }
                if (b == undefined) {
                    return 1
                }
                if (a.id == b.id) {
                    return 0
                }
                if (a.id > b.id) {
                    return 1
                }
                if (a.id < b.id) {
                    return -1
                }
                return 0
            })

        } 
    }
    chart.init = function(d1) { //should change to selection;
        d1.forEach(function(d) {
            d.server = d.server || d1.server || ""
            var id = datacode(d)
            var src = dbMap[concat((d.server || d1.server || ""), d.prefix)].selectAll("li").filter(function(d0) {
                return d0.format == d.format && d0.id == d.id
            }).each(function(d) {
                var el = d3.select(this)
                el.on("submit")()
            })
        })
    }

    chart.callback = function(_) {
        return arguments.length ? (callback = _, chart) : callback;
    }
    chart.idsInOrder = function() {
        return $(t.node()).sortable("toArray");
    }
    return chart
}
