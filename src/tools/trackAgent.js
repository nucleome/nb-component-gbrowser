/*
  TODO ,
  TRACK AGENT With Genome Version
*/
import isActive from "./isActive"
import getjson from "./getjson"
import code from "../tracks/dataSrcCode"
import decode from "../tracks/decode"
import * as d3 from "d3" //TODO Replace with fetch
import sandInits from "../sandInits"
var supports = {
    "bigwig": true,
    "tracks": true,
    "bigbed": true,
    "hic": true,
    "track": true,
    "binindex": true,
    "tabix": true,
}

function support(format) {
    if (supports[format]) {
        return true
    } else {
        return false
    }
}

function parseTracks(results, trackdbs, format) {
    var tracks = []
    results.forEach(function(d, i) {
        d.forEach(function(v) {
            if (trackdbs[i].format && (trackdbs[i].format == format || format == "all")) {
                var k = {
                    "server": trackdbs[i].server,
                    "prefix": trackdbs[i].prefix,
                    "format": trackdbs[i].format,
                    "id": v.id || v
                }
                if (typeof v === "object") {
                    Object.keys(v).forEach(function(d) {
                        k[d] = v[d]
                    })
                }
                tracks.push(k)
            } else if (v.format && (v.format == format || format == "all")) {
                var k = {
                    "server": trackdbs[i].server,
                    "prefix": trackdbs[i].prefix,
                    "format": v.format,
                    "id": v.id
                }
                if (typeof v === "object") {
                    Object.keys(v).forEach(function(d) {
                        k[d] = v[d]
                    })
                }
                tracks.push(k)
            }
        })
    })
    return tracks
}

/* track agent :
   Usage:
    var agent = trackAgent().server(server).callback(function(_){})
    agent(format)

 */
export default function() {
    var server = ""
    var servers //server list
    var genome = "hg38"
    var callback = function(_) {
        console.log("callback", _)
    }
    var results //result list
    var trackdbs = []
    var inited = false
    var _format = "all"

    var initedMap = {}
    var activeServerMap = {}
    var activeServers = []

    var data = {}

    var process = function(_servers) {
        servers = _servers //TODO
        var q0 = [];
        var serverList = Object.keys(servers)
        serverList.forEach(function(s) {
            q0.push(new Promise(function(resolve, reject) {
                isActive(servers[s] + "/version", resolve)
            }))
        })
        Promise.all(q0).then(function(results) {
            activeServers = []
            results.forEach(function(d, i) {
                if (d) {
                    activeServers.push(serverList[i])
                }
            })
            if (activeServers.length > 0) {
                loadServers(servers, activeServers)
            } else {
                console.log("warning : no activeServers")
            }
        }).catch(function(e) {
            console.log("trackAgent", e)
        })
    }
    //Fix Bug For Tabix
    var objectToArray = function(r) {
        var v = Object.keys(r).sort().map(function(k) {
            var d = r[k]
            if (!("id" in d)) {
                d["id"] = k
            }
            if (!("format" in d)) {
                d["format"] = "tabix"
            }
            return d
        })
        return v
    }
    var loadServers = function(servers, activeServers) { //TODO
        var q1 = [];
        activeServers.forEach(function(serverName) {
            var server = servers[serverName]
            q1.push(
                getjson(server + "/" + genome + "/ls") //TODO MY JSON
            )
        })
        Promise.all(q1).then(function(r0) {
            r0.forEach(
                function(sdb, i) {
                    sdb.forEach(
                        function(db, j) {
                            trackdbs.push({
                                "server": servers[activeServers[i]],
                                "prefix": genome + "/" + db.dbname,
                                "format": db.format
                            })
                        })
                })
            var q = []
            var newtrackdbs = []
            trackdbs.forEach(function(db) {
                var server = db.server || ""
                if (db.format == "tabix") {
                    q.push(d3.json(server + "/" + db.prefix + "/ls?attr=1", sandInits))
                    newtrackdbs.push(db)
                } else if (support(db.format)) {
                    q.push(
                        d3.json(server + "/" + db.prefix + "/list?attr=1", sandInits)
                    )
                    newtrackdbs.push(db)
                }

            })
            trackdbs = newtrackdbs
            Promise.all(q).then(function(r) {
                var tracks
                results = r.map(function(a) {
                    if (typeof a == "object") {
                        return objectToArray(a)
                    } else {
                        return a
                    }
                })
                tracks = parseTracks(results, trackdbs, _format)
                tracks.forEach(function(d) {
                    data[code(d)] = d
                })
                inited = true
                callback(tracks)
            })
        })
        /*
        .catch(function(e){
          console.log("error in list genome",e)
        })
        */
    }
    var init = function(format) {
        _format = format
        if (servers && Object.keys(servers).length > 0) {
            process(servers)
        } else {
            d3.json(server + "/server/ls", sandInits).then(function(results) {
                process(results)
            })
        }
    }


    var chart = function(format) {
        if (inited) {
            callback(parseTracks(results, trackdbs, format))
        } else {
            init(format) //callback in init   possible dead loop not found servers
        }
    }
    /*
      interface for hubs render config
    */
    chart.trackData = function() {
        var data = []
        results.forEach(function(d, i) {
            var e = {}
            e.server = trackdbs[i].server
            e.prefix = trackdbs[i].prefix
            e.tracks = [];
            d.forEach(function(d) {
                var newd = {
                    "server": e.server,
                    "format": d.format || trackdbs[i].format,
                    "id": d.id || d //TODO
                }
                if (typeof d === "object") {
                    Object.keys(d).forEach(function(k) {
                        newd[k] = d[k]
                    })
                }
                e.tracks.push(newd)
            })
            e.tracks.sort(function(a, b) {
                if (a.id == b.id) {
                    return 0
                }
                if (a.id < b.id) {
                    return -1
                }
                return 1
            })
            data.push(e)
        })
        return data
    }
    chart.servers = function(_) {
        return arguments.length ? (servers = _, chart) : servers;
    }
    chart.server = function(_) {
        return arguments.length ? (server = _, chart) : server;
    }
    chart.callback = function(_) {
        return arguments.length ? (callback = _, chart) : callback;
    }
    chart.trackdbs = function() {
        return trackdbs
    }
    chart.results = function() {
        return results;
    }
    chart.reset = function() {
        inited = false;
        trackdbs = [];
        return chart
    }
    chart.load = function(_) {

    }
    chart.activeServers = function() {
        return activeServers
    }
    chart.genome = function(_) {
        return arguments.length ? (genome = _, chart) : genome;
    }
    chart.getValue = function(k) {
        //prefix|format|id|[server]
        var newk = code(decode(k))
        if (!data[newk]) {
            console.log("not find key ", k)
        }
        return data[newk] || null

    }
    return chart
}
