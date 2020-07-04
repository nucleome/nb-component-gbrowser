export default {
    draw: function (context, size) {
        context.beginPath();
        context.lineTo(size/2, -size/2);
        context.lineTo(size/2, 0);
        context.lineTo(size, -size/2);
        context.lineTo(size, +size/2);
        context.lineTo(size/2, 0);
        context.lineTo(size/2, size/2)
        context.lineTo(0,0)
        context.closePath();
        context.fill();
    }
}
