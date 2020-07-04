export default function(canvas) {
    var c = "#DCDCFF"
    var width = canvas.width;
    var height = canvas.height;
    var gap = 12; //first 45
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = c;
    for (var i = 1;i < width/gap;i++){
        ctx.fillRect(i*gap-5,0,1,height)
    }
}

