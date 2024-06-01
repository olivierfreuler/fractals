onmessage = function (e) {
  const { zoom, offsetX, offsetY } = e.data;
  const width = 800;
  const height = 600;
  const maxIterations = 100;
  const data = [];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let zx = (x / zoom) + offsetX;
      let zy = (y / zoom) + offsetY;
      let i = maxIterations;
      while (zx * zx + zy * zy < 4 && i > 0) {
        let tmp = zx * zx - zy * zy + offsetX;
        zy = 2.0 * zx * zy + offsetY;
        zx = tmp;
        i--;
      }
      const color = i === 0 ? '#000' : `hsl(${(i / maxIterations) * 360}, 100%, 50%)`;
      data.push({ x, y, color });
    }
  }

  postMessage(data);
};

