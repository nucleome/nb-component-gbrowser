export default  {
    draw: function (context, size) {
        context.moveTo(0, 0)
        context.lineTo(0, size);
        context.lineTo(size, 0);
        context.closePath();
    }
}
