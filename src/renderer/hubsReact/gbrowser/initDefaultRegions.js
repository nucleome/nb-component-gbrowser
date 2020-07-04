import toolsDefaultRegions from "../../../tools/defaultRegions"

export default function(chrToLength,app,state,genomeChange) {

    var defaultRegions = toolsDefaultRegions(chrToLength, 2)
   var _r
   if (typeof app.regions !== "undefined") {
       _r = JSON.parse(JSON.stringify(app.regions))
    }
     var regions = state.regions || _r || defaultRegions

    if (genomeChange) {
        app.regions = JSON.parse(JSON.stringify(defaultRegions))
        state.regions = JSON.parse(JSON.stringify(defaultRegions))
        regions = JSON.parse(JSON.stringify(defaultRegions))
        genomeChange = false
        return regions
    }
    /*
    if (!("regions" in state)) {
        state.regions = regions //update state for new window TODO formalize
    }
    if (!("regions" in app) && !state.unlink) {
        app.regions = JSON.parse(JSON.stringify(regions)) //update app when recover from session
    }
    */
    return regions
}
