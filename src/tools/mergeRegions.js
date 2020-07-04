function compare(a, b) {
    if (a.start < b.start) {
        return -1
    }
    if (a.start > b.start) {
        return 1
    }
    if (a.end < b.end) {
        return -1
    }
    if (a.end > b.end) {
        return 1
    }
    return 0
}

function group(regions) {
    var chrs = {}
    var _r = {}
    regions.forEach(function(d) {
        if (d.chr in chrs) {
            chrs[d.chr].push(d)
        } else {
            chrs[d.chr] = [d]
        }
    })
    Object.keys(chrs).forEach(function(k) {
        var t = turing(chrs[k])
        var t2 = turingMerge(t)
        _r[k] = t2
    })
    var _a = []
    Object.keys(chrs).sort().forEach(function(k) {
        _a = _a.concat(_r[k].map(function(d) {
            return {
                chr: k,
                start: d[0],
                end: d[1]
            }
        }))
    })
    return _a
}

function turingMerge(a) {
    var k = []
    var s = 0;
    var sign = false;
    var i = -1
    a.forEach(function(d) {
        s += d[1];
        if (sign == false && s == 1) {
            sign = true;
            i++
            k.push([d[0]])
        }
        if (s == 0) {
            k[i].push(d[0])
            sign = false
        }
    })
    return k
}

function turingCmp(a, b) {
    if (a[0] < b[0]) return -1
    if (a[0] > b[0]) return 1
    if (a[1] < b[1]) return 1
    if (a[1] > b[1]) return -1
    return 0
}

function turing(r) {
    var s1 = r.map((d,i) => {
        return [d.start , 1]
    })
    var s2 = r.map((d,i) => {
        return [d.end, -1]
    })
    var s = s1.concat(s2)
    s.sort(turingCmp)
    return s
}

export default function(regions) {
    return group(regions)
}
