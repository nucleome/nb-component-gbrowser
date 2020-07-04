function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toLowerCase();
    return "#"+"00000".substring(0, 6 - c.length) + c;
}
function rgbToInt(c){
    var c0 = c.replace("#","0x")
    return parseInt(c0)
}
export default function(color){
    var i = rgbToInt(color)
    var c = i ^ 0xFFFFFF
    return intToRGB(c)
}
