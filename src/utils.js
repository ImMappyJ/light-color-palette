/**
 * 统一化传入图片类型
 * @param {string | Image} src 传入图片url或data
 * @returns {Promise<Image>} 图片data
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = typeof src === "string" ? new Image() : src;

    if (typeof src === "string") {
      img.crossOrigin = "anonymous";
      img.src = src;
    }

    if (img.complete) {
      resolve(img);
    } else {
      img.onload = () => resolve(img);
      img.onerror = reject;
    }
  });
}

/**
 * 将图片的像素进行抽样插入数组
 * @param {Image} pic 待处理图片
 * @returns {Array<Object>} 像素数据点集合
 */
export function getPixelsArray(pic) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const MAX_DIMENSION = 200;
  let width = pic.width;
  let height = pic.height;
  if (width > height) {
    if (width > MAX_DIMENSION) {
      width = MAX_DIMENSION;
      height *= MAX_DIMENSION / pic.width;
    }
  } else {
    if (height > MAX_DIMENSION) {
      height = MAX_DIMENSION;
      width *= MAX_DIMENSION / pic.height;
    }
  }
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(pic, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const pixels_array = [];
  for (let idx = 0; idx < pixels.length; idx += 4) {
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const a = pixels[idx + 3];

    if (
      a >= 128 &&
      !(r > 245 && g > 245 && b > 245) &&
      !(r < 10 && g < 10 && b < 10)
    ) {
      pixels_array.push([r, g, b]);
    }
  }
  return pixels_array;
}

/**
 * 将8bitRGB格式转换为十六进制
 * (255,255,255) => #ffffff
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} #ffffff
 */
export function rgbToHex(r, g, b) {
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 将HSV颜色模型转换为RGB
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @returns {Array<number>} - RGB数组，格式为[r, g, b]，每个值范围0-255
 */
export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  s = s / 100;
  v = v / 100;

  if (s === 0) {
    const gray = Math.round(v * 255);
    return [gray, gray, gray];
  }

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r1, g1, b1;
  if (h >= 0 && h < 60) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r1, g1, b1] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r1, g1, b1] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }

  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return [r, g, b];
}
