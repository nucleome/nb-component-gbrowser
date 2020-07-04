import React from "react"
import ReactDOM from "react-dom"

import CfgAppBar from "../cfgAppBar"
import addBtnTo from "../../../tools/addBtnTo"
import Handsontable from "handsontable"
export default function(state, callback, refresh, c, dispatch, classes) {
    var cfg0 = c.append("div")
        .classed("cfg", true)
    /********************* Cfg Top Section ******************/
    var cfgTop = cfg0.append("div")
    //.classed("nb-btn-bar", true)

    //var cfgBlank = 
    //cfgTop.append("div").style("float", "right").style("width", "50px")
    //.style("height", "55px").style("background-color", "#FFFFFF")
    //Cog Btns
    //
    var cfgBtnGroup = cfgTop.append("div")
        .classed("btn-group", true)
        .style("float", "left")

    var cfgBtnGroupA = cfgTop.append("div")
        .classed("btn-group", true)
        .style("float", "left")
        .style("padding-top", "2px")

    var cfgToolbarReady = function() {
        cfgTop.select("#btnPlay")
            .attr("title", "Plot Current Tracks")
            .on("click", function() {
                callback()
            })
        cfgTop.select("#btnCog")
            .attr("title", "Config Servers")
            .on("click", function() {
                if (cfgTable.style("display") == "none") {
                    cfgTable.style("display", null)
                } else {
                    cfgTable.style("display", "none")
                }
            })
        cfgTop.select("#btnRefresh")
            .attr("title", "Load Servers in Current Table, if table is empty, load the default servers")
            .on("click", function() {
                refresh()
            })
    }
    ReactDOM.render(<CfgAppBar dispatch = {dispatch} classes={classes}/>, cfgTop.node(), cfgToolbarReady)
    /*
    var gGroup = cfgBtnGroupA.append("div").classed("input-group", true)
    gGroup.append("div")
        .classed("input-group-prepend", true)
        .style("padding-right", "3px")
        .append("div")
        .classed("input-group-text", true)
        .text("Genome")
    */
    //var genomeInput = //cfgBtnGroupA.append("select")
    //.classed("btn", true)
    //.classed("btn-xs", true)
    //.classed("btn-default", true)
    //  cfgTop.select("#inputGenome")//.select("select")
    //.attr("value", state.genome || "hg38") //TODO Select Genome 
    var cfgTable = cfg0.append("div")
        .style("height", "150px")
        .style("width", "100%")
        .style("display", "none")
        .style("background-color", "#F7F7F7")
        .style("font-size", "18px")


    var tabServer = state.tabServer || [] //should be loaded into server
    var hot = new Handsontable(cfgTable.node(), {
        data: tabServer,
        search: true,
        colHeaders: ["Id", "URI", "Status"],
        rowHeaders: true,
        contextMenu: true,
        height: 150,
        minRows: 5,
        columnSorting: true,
        columns: [{
            data: 0,
        }, {
            data: 1,
        }, {
            data: 2,
            editor: false
        }],
        hiddenColumns: {
            //columns: [2]
        },
        cells: function(row, column) {
            var cellMeta = {}
            if (column == 1) {
                cellMeta.width = 350
            }
            if (column == 2) {
                cellMeta.type = 'text';
                cellMeta.renderer = function(hotInstance, TD, row, col, prop, value) {
                    var colors = {
                        "not active": '#e87677',
                        "active": '#66e100',
                    };
                    TD.style.color = colors[value];
                    TD.textContent = value;
                };
            }
            return cellMeta
        },
        afterSelection: function(_) {
            var d = hot.getDataAtRow(_)
        },
        licenseKey: "non-commercial-and-evaluation"
    });
    var cfg = cfg0.append("div")
        .style("max-height", "calc(100% - " + 55 + "px)")
        .style("max-width", "calc(100% - " + 5 + "px)")
        .style("overflow", "auto")
        .style("padding-left", "15px") //TODO
        .style("padding-top", "28px") //TODO


    return {
        cfg: cfg,
        cfg0: cfg0,
        tabServer: tabServer,
        hot: hot
    }
}
