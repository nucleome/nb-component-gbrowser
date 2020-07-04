import {isRow} from "../hubsUtils"
export default function(tabServer, agent, state, cfg) {
    var servers = {}
    tabServer.filter(isRow).forEach(function(d) {
        servers[d[0]] = d[1]
    })
    agent.servers(servers) //if servers size == 0 will load default in agent
    if (Object.keys(servers).length > 0) {
        app.servers = servers
    }
    agent.reset()
    agent.genome(state.genome)
    cfg.html("<h3>loading....</h3>") //TODO
    agent("all")
}
