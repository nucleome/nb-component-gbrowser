export default {
    draw: function (context, size) {
        context.moveTo(0, -size/2)
        context.lineTo(size/2, 0);
        context.lineTo(0, size/2);
    }
}
