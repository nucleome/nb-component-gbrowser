
import hostedGenomes from "../../../tools/hostedGenomes"

import {isRow} from "../hubsUtils"

export default function(d, agent, dispatch, state, container,tabServer,hot,callback,genome) {
    var m = agent.servers()
    var listServers = d.map(function(d0) {
        return m[d0]
    })
    /* Set Genome */
    hostedGenomes(listServers, function(d) {
        //TODO Set Genomes
        /*
        var k = genomeInput.selectAll("option").data(d)
        k.exit().remove()
        k.enter().append("option").merge(k).attr("value", function(d) {
                return d
            })
            .text(function(d) {
                return d
            })
        */
        dispatch.call("setGenomes",this,d)
        var sign = false
        d.forEach(function(g) {
            if (state.genome == g) {
                sign = true
            }
        })
        if (sign) {
            //genomeInput.node().value = state.genome
            dispatch.call("setGenome",this,state.genome)
            agent.genome(state.genome)
        } else {
            state.genome = d[0]
            app.genome = state.genome
            genome = state.genome
            dispatch.call("setGenome",this,state.genome)
            //genomeInput.node().value = d[0]
            agent.genome(state.genome)
            callback()
        }

    })
    var e = {}
    d.forEach(function(d) {
        e[d] = true
    })
    tabServer.forEach(function(d, i) {
        if (isRow(d)){
        if (d[0] in e) {
            d[2] = "active"
        } else {
            d[2] = "not active"
        }
        } else {
            d[2]=""
        }   
    })

    //Hot Render tabServers 
    //TODO : Remove ID , and not Filter
    hot.loadData(tabServer)
    hot.render()
    state.tabServer = tabServer
    container.setState(state)
}
