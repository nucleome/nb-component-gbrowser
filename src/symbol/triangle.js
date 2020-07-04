export default {
    draw: function (context, size) {
        context.moveTo(0, 0)
        context.lineTo(size, 0);
        context.lineTo(size / 2, -size / 2);
        context.closePath();
    }
}
