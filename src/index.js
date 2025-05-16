import { kmeans } from "./algorithm";

/**
 * 统一化传入图片类型
 * @param {string | Image} src 传入图片url或data
 * @return {Image} 图片data
 */
async function loadImage(src) {
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
 * @param {ImageData} pic 待处理图片
 * @return {Array<Object>} 像素数据点集合
 */
function getPixelsArray(pic) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const MAX_DIMENSION = 100;
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
 * 生成主题色函数
 * @param {string | Image} url 图片资源
 * @param {number} k 需要生成的颜色数量
 * @returns {Array<Object>} 生成的颜色数组
 */
export async function generateTheme(url, k) {
  return new Promise((resolve, reject) => {
    let img = loadImage(url);
    let pixels_array = getPixelsArray(img);
    resolve(kmeans(pixels_array, k));
  });
}
