import parseRegion from "../../../tools/parseRegion"
import Awesomplete from "awesomplete"
import sandInits from "../../../sandInits"
export default function(regionInput, state, getChrLength, dispatch, callback) {
    var input = regionInput.node()
    if (typeof input !== "null") {
        var awesomplete = new Awesomplete(input, {
            filter: function(text, input) {
                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
            },

            item: function(text, input) {
                return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0]);
            },

            replace: function(text) {
                var before = this.input.value.match(/^.+,\s*|/)[0];
                this.input.value = before + text + ", ";
            }
        });
        input.addEventListener("awesomplete-selectcomplete", function(d) {
            awesomplete.close()
        })
    }
    //var _renderInput
    var _processRenderInput = function(error, data) {
        var _renderInput = function() {
            var v = regionInput.node().value
            if (typeof v === "undefined") {
                return
            }
            var rs = v.split(/[ ,;]+/)
            if (rs.length > 5) {
                alert("Please limit your input in less than 5 regions")
                return
            }
            var a = []
            rs.forEach(function(v) {
                var r
                var V = v.toUpperCase()
                if (error == null && (V in data)) {
                    r = data[V]
                } else if (error == null && (v in data)) {
                    r = data[v]
                } else {
                    r = v
                }
                if (r.match(/\S+:\d+-\d+/) || getChrLength(r)) {
                    var k = parseRegion(r)
                    if (k.chr) {
                        a.push(parseRegion(r))
                    }
                }
            })
            //TODO filter out undefined chromosome
            a.forEach(function(d) {
                if (typeof d.end === "undefined" || d.end === null) {
                    d.end = getChrLength(d.chr)
                }
            })
            if (a.length > 0) {
                dispatch.call("update", this, a)
            } else {
                alert("Wrong input region or gene name")
            }
        }
        if (error != null) {
            regionInput.attr("placeholder", "input genome regions")
            regionInput.on("change", function(e) {
                _renderInput()
            })
            awesomplete.list = []
            awesomplete.evaluate()
        } else {
            regionInput.attr("placeholder", "input genome regions or gene names")
            regionInput.on("change", function(e) {
                _renderInput()
                awesomplete.close()
            })
            /* auto complete part */
            awesomplete.list = Object.keys(data).sort()
            awesomplete.evaluate()
            /* end autocomplete part */
        }

        callback({
            _renderInput: _renderInput,
            _loadGeneLoci: _loadGeneLoci
        })

    }
    // TODO CHANGE GENOME  (Get Gene Loci From BED or MySQL Instead)
    var _loadGeneLoci = function() {
        fetch("/" + state.genome + "/list", sandInits).then(function(d) {
            return d.json()
        }).then(function(d) {
            var sign = false;
            var loci = state.genome + "_loci"
            d.forEach(function(d) {
                if (d == loci) {
                    sign = true
                }
            })
            if (sign) {
                fetch("/" + state.genome + "/" + state.genome + "_loci/ls", sandInits)
                    .then(function(res) {
                        return res.json()
                    })
                    .then(function(d) {
                        _processRenderInput(null, d)
                    })
                    .catch(function(e) {
                        console.log("loci names not found")
                        _processRenderInput(e, null)
                    })
            } else {
                console.log("loci names not found")
                _processRenderInput({
                    "error": "not found"
                }, null)
            }

        })

    }
    _loadGeneLoci()
}
