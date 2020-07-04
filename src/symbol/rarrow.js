export default {
    draw: function (context, size) {
        context.moveTo(size/2, -size/2)
        context.lineTo(0, 0);
        context.lineTo(size/2, size/2);
    }
}
