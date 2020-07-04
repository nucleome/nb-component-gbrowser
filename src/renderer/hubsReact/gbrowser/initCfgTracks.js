import manager from "../../../tracks/manager"
import decode from "../../../tracks/decode"
export default function(c,cfg,agent,trackchart,trackViews,state,dispatch,container,_loadGeneLoci,render, genome,regions,genomeChange) {
    var data = agent.trackData()
    var chart = manager().callback(function(d) {
        d3.select(c.node().parentNode.parentNode.parentNode).classed("s_cfg", false).classed("s_content", true)
        trackViews = [];
        d.forEach(function(d) {
            //TODO Decode D and Get Groups
            var v = agent.getValue(d)
            var k = decode(d)
            if ("group" in k) {
                v.group = k.group
            }
            trackViews.push(v)
        })
        //parse groups
        state.trackViews = trackViews
        state.configView = false
        container.setState(state)
        dispatch.call("updateTracks", this, trackViews)
        render();
    })
    //managerChart = chart;
    trackchart.managerChart(chart)
    renderCfg(data)

    function renderCfg(d) {
        cfg.html("")
        cfg.datum(d).call(chart)
        var k = trackViews[0].server
        var sign = false
        d.forEach(function(d) {
            if (d.server == k) {
                sign = true
            }
        })
        if (sign) {
            chart.init(trackViews)
        } else {
            agent.genome(genome)
            agent.reset()
            /*
            state.genome = genome
            app.genome = genome
            regions = undefined //TODO
            state.regions = undefined
            app.regions = undefined
            genomeChange = true //TODO
            cfg.html("<h3>loading...</h3>")
            trackViews = [] //reset trackViews to get default Views
            agent("all")
            _loadGeneLoci();
            */
        }
    }
    return {
        managerChart : chart
    }
}
