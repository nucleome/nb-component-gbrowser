export function renderTriangle(ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1, binsize) {
    ctx.save()
    ctx.translate(xoffset, yoffset)
    ctx.rotate(-Math.PI / 4)
    //var binsize = bpres[resIdx]
    var x0 = (se1[0] - region1.start) / binsize * cellSize
    var y0 = (se1[0] - region1.start) / binsize * cellSize
    var h0 = cellSize + y0
    var w0 = cellSize + x0
    var w1 = cellSize + (region1.end - se1[1]) / binsize * cellSize
    var h1 = w1
    var nx = mat.length;
    var ny = mat[0].length;
    if (nx == 0 || ny == 0) {
        return
    }
    for (var x = 1; x < mat.length - 1; x++) {
        for (var y = x; y < mat[0].length - 1; y++) {
            ctx.fillStyle = colorScale(mat[x][y]); //mat[x][y] mirror
            ctx.fillRect(y * cellSize + y0, x * cellSize + x0, cellSize, cellSize);
        }
    }
    ctx.fillStyle = colorScale(mat[0][0])
    ctx.fillRect(0, 0, h0, w0)

    ctx.fillStyle = colorScale(mat[0][ny - 1])
    ctx.fillRect(y0 + cellSize * (ny - 1), 0, h1, w0)
    ctx.fillStyle = colorScale(mat[nx - 1][ny - 1])
    ctx.fillRect(y0 + cellSize * (ny - 1), x0 + cellSize * (nx - 1), h1, w1)

    for (var y = 1; y < mat[0].length - 1; y++) {
        var l = nx - 1;
        ctx.fillStyle = colorScale(mat[0][y]);
        ctx.fillRect(y * cellSize + y0, 0, cellSize, w0); //TODO fix size?
    }
    for (var x = 1; x < mat.length - 1; x++) {
        var l = ny - 1;
        ctx.fillStyle = colorScale(mat[x][l]);
        ctx.fillRect(l * cellSize + y0, x * cellSize + x0, h1, cellSize);

    }
    ctx.restore()
}

export function renderMatrix(ctx, xoffset, yoffset, mat, cellSize, colorScale, region1, se1, region2, se2, binsize) {
    ctx.save()
    ctx.rotate(-Math.PI / 4)
    ctx.translate(xoffset, yoffset)
    var x0 = (se1[0] - region1.start) / binsize * cellSize
    var y0 = (se2[0] - region2.start) / binsize * cellSize
    var h0 = cellSize + y0
    var w0 = cellSize + x0
    var w1 = cellSize + (region1.end - se1[1]) / binsize * cellSize
    var h1 = cellSize + (region2.end - se2[1]) / binsize * cellSize
    var nx = mat.length;
    var ny = mat[0].length;
    if (nx == 0 || ny == 0) {
        return
    }
    ctx.fillStyle = colorScale(mat[0][0])
    ctx.fillRect(0, 0, h0, w0)

    ctx.fillStyle = colorScale(mat[0][ny - 1])
    ctx.fillRect(y0 + cellSize * (ny - 1), 0, h1, w0)

    ctx.fillStyle = colorScale(mat[nx - 1][0])
    ctx.fillRect(0, x0 + cellSize * (nx - 1), h0, w1)

    ctx.fillStyle = colorScale(mat[nx - 1][ny - 1])
    ctx.fillRect(y0 + cellSize * (ny - 1), x0 + cellSize * (nx - 1), h1, w1)

    for (var y = 1; y < mat[0].length - 1; y++) {
        var l = nx - 1;
        ctx.fillStyle = colorScale(mat[0][y]);
        ctx.fillRect(y * cellSize + y0, 0, cellSize, w0); //TODO fix size?
        ctx.fillStyle = colorScale(mat[l][y]);
        ctx.fillRect(y * cellSize + y0, l * cellSize + x0, cellSize, w1);
    }
    for (var x = 1; x < mat.length - 1; x++) {
        var l = ny - 1;
        ctx.fillStyle = colorScale(mat[x][0]);
        ctx.fillRect(0, x * cellSize + x0, h0, cellSize);
        ctx.fillStyle = colorScale(mat[x][l]);
        ctx.fillRect(l * cellSize + y0, x * cellSize + x0, h1, cellSize);
    }

    for (var x = 1; x < mat.length - 1; x++) {
        for (var y = 1; y < mat[0].length - 1; y++) {
            ctx.fillStyle = colorScale(mat[x][y]);
            ctx.fillRect(y * cellSize + y0, x * cellSize + x0, cellSize, cellSize);
        }
    }
    ctx.restore()
}



