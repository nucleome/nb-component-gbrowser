import trackManager from "./trackManager"
import parseInts from "../tools/parseInts";
import bgPlot from "./bgPlot"



function lineToBed3(l) {
    try {
        var a = l.split("\t")
        var r = {
            chr: a[0],
            start: parseInt(a[1]),
            end: parseInt(a[2])
        }
        return r
    } catch (e) {
        return undefined
    }
}


function _glyphORM() {
    var yi
    var coord
    var ctx
    var height
    var state
    var colorScale = d3.scaleLinear()
        .domain([1, 1000, 2000])
        .range(['#d73027', '#fee08b', '#1a9850'])
        .interpolate(d3.interpolateHcl);
    var chart = function(r) {
        var b = coord(r)
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        var H = height + 2
        b.forEach(function(x) {
            ctx.fillRect(x.x, 17 + yi.i * H, x.l > 1 ? x.l : 1, height)
        })
        r.feats.forEach(function(f) {
            if (f.type == "N") {
                ctx.fillStyle = 'rgba(0,0,255,0.3)'
                ctx.fillStyle = colorScale(f.val)
                //TODO Color Scale
                var a0 = coord({
                    chr: r.chr,
                    start: r.start + f.pos,
                    end: r.start + f.pos + 1
                })
                a0.forEach(function(x) {
                    ctx.fillRect(x.x, 16 + yi.i * H, x.l > 1 ? x.l : 1, height)
                })
            }
            if (f.type == "S") {
                ctx.fillStyle = 'rgba(3,3,3,0.5)'
                var a0 = coord({
                    chr: r.chr,
                    start: r.start + f.pos,
                    end: r.start + f.pos + f.val
                })
                a0.forEach(function(x) {
                    ctx.fillRect(x.x, 16 + yi.i * H + Math.round(height / 2), x.l > 1 ? x.l : 1, 1)
                })
            }

        })



    }
    chart.yi = function(_) {
        return arguments.length ? (yi = _, chart) : yi;
    }
    chart.ctx = function(_) {
        return arguments.length ? (ctx = _, chart) : ctx;
    }
    chart.height = function(_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.state = function(_) {
        if (arguments.length == 0) {
            return state
        } else {
            state = _
            colorScale.range([state.lower, state.middle, state.higher])
            return chart
        }
    }
    chart.coord = function(_) {
        return arguments.length ? (coord = _, chart) : coord;
    }
    return chart
}

function _glyphBed3() {
    var yi
    var coord
    var ctx
    var height
    var state
    var colorScale
    var chart = function(r) {
        var b = coord(r)
        var H = height + 2
        ctx.fillStyle = state.color
        b.forEach(function(x) {
            ctx.fillRect(x.x, 17 + yi.i * H, x.l > 1 ? x.l : 1, height)
        })

    }
    chart.yi = function(_) {
        return arguments.length ? (yi = _, chart) : yi;
    }
    chart.ctx = function(_) {
        return arguments.length ? (ctx = _, chart) : ctx;
    }
    chart.height = function(_) {
        return arguments.length ? (height = _, chart) : height;
    }
    chart.state = function(_) {
        if (arguments.length == 0) {
            return state
        } else {
            state = _
            //TODO colorScale = d3.linearScale().domain().range()
            return chart
        }
    }
    chart.coord = function(_) {
        return arguments.length ? (coord = _, chart) : coord;
    }
    return chart
}



function lineToORM(d) {
    try {
        var a = d.split("\t")
        var r = {
            chr: a[0],
            start: parseInt(a[1]),
            end: parseInt(a[2]),
            name: a[3],
            score: parseFloat(a[5]),
            strand: a[4],
            featCount: parseInt(a[6])
        }
        r.feats = []
        if (r.featCount > 0) {
            var f = a[7].split(",")
            var pos = parseInts(a[8])
            var val = parseInts(a[9])
            for (var i = 0; i < r.featCount; i++) {
                r.feats.push({
                    "type": f[i],
                    "pos": pos[i],
                    "val": val[i]
                })
            }
        }
        return r
    } catch (e) {
        return undefined
    }
}

var glyphs = {
    "bed3": _glyphBed3,
    "ORM": _glyphORM
}
var parsers = {
    "bed3": lineToBed3,
    "ORM": lineToORM
}
export default function() {
    var regions
    var coord
    var URI
    var id
    var parser = "bed3"
    var glyph = "bed3"
    var glyphHeight = 7

    var callback = function(d) {
        console.log("callback", d)
    }
    var ctx
    var el
    var bg = true
    var state
    var chart = function(selection) {
        el = selection //canvas?
        ctx = el.node().getContext("2d")
        render(el);

    }
    chart.state = function(_) {
        return arguments.length ? (state = _, chart) : state;
    }
    chart.regions = function(_) {
        return arguments.length ? (regions = _, chart) : regions;
    }
    chart.coord = function(_) {
        return arguments.length ? (coord = _, chart) : coord;
    }
    chart.URI = function(_) {
        return arguments.length ? (URI = _, chart) : URI;
    }
    chart.id = function(_) {
        return arguments.length ? (id = _, chart) : id;
    }
    chart.callback = function(_) {
        return arguments.length ? (callback = _, chart) : callback;
    }
    chart.glyph = function(_) {
        return arguments.length ? (glyph = _, chart) : glyph;
    }
    chart.parser = function(_) {
        return arguments.length ? (parser = _, chart) : parser;
    }
    chart.bg = function(_) {
        return arguments.length ? (bg = _, chart) : bg;
    }
    chart.glyphHeight = function(_) {
        return arguments.length ? (glyphHeight = _, chart) : glyphHeight;
    }
    var _render_ = function(results) {
        var trackM = trackManager().coord(coord).trackSize(1000).labelSize(0)
        var glyphRender = glyphs[glyph]().coord(coord).ctx(ctx).height(glyphHeight).state(state)
        var rs = []
        var _filter = function(d) {
            return true
        }
        if ("signalsOnly" in state && !state.signalsOnly) {
            //sort results twice
            results.forEach(function(d, rI) {
                var lines = d.trim().split("\n")
                var entries = lines.map(function(d) {
                    return parsers[parser](d)
                }).filter(function(d) {
                    return (typeof(d) !== "undefined")
                })
                entries.filter(function(d){
                    return d.featCount > 0
                }).forEach(function(r) {
                    var yi = trackM.AssignTrack(r)
                    rs.push({
                        i: yi,
                        d: r
                    })
                })
                entries.filter(function(d){
                    return d.featCount == 0
                }).forEach(function(r) {
                    var yi = trackM.AssignTrack(r)
                    rs.push({
                        i: yi,
                        d: r
                    })
                })
             }


            )
        } else {

            if ("signalsOnly" in state && state.signalsOnly) {
                _filter = function(d) {
                    return d.featCount > 0
                }
            }
            results.forEach(function(d, rI) {
                var lines = d.trim().split("\n")
                var entries = lines.map(function(d) {
                    return parsers[parser](d)
                }).filter(function(d) {
                    return (typeof(d) !== "undefined")
                }).filter(_filter)
                entries.forEach(function(r) {
                    var yi = trackM.AssignTrack(r)
                    rs.push({
                        i: yi,
                        d: r
                    })
                })

            })
        }
        el.attr("height", (glyphHeight + 2) * trackM.trackNumber() + 30)
        if (bg) {
            bgPlot(el.node())
        }
        rs.forEach(function(d) {
            glyphRender.yi(d.i)(d.d)
        })

        callback({
            "code": "height",
            "data": {
                "canvasHeight": (glyphHeight + 2) * trackM.trackNumber() + 30
            }
        });

    }
    var render = function() {
        //TODO using fetch
        var q = []
        regions.forEach(function(d) {
            q.push(d3.text(URI + "/" + id + "/get/" + d.chr + ":" + d.start + "-" + d.end, sandInits)) //TODO Remove SandInits
        })
        Promise.all(q).then(_render_)
    }

    return chart
}
