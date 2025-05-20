import {
  kmeans,
  sortColor,
  getLuminance,
  getBrightness,
  getSaturation,
  getMonochromaticColors,
} from "./algorithm";
import { loadImage, getPixelsArray, rgbToHex } from "./utils";

export class LCPalette {
  constructor(src) {
    this.src = src;
  }
  /**
   * 使用K-means算法生成主题色函数
   * @param {string | Image} src 图片资源
   * @param {number} k 需要生成的颜色数量
   * @returns {Promise<LCPalette>}
   */
  async genTheme(k) {
    this.img = await loadImage(this.src);
    this.points = await kmeans(getPixelsArray(this.img), k);
    return this;
  }

  /**
   * 进行明度排序
   * @param {boolean} order 排列顺序 true为低到高
   * @returns {LCPalette}
   */
  sortByLuminance(order) {
    sortColor(this.points, order, getLuminance);
    return this;
  }

  /**
   * 进行亮度排序
   * @param {boolean} order 排列顺序 true为低到高
   * @returns {LCPalette}
   */
  sortByBrightness(order) {
    sortColor(this.points, order, getBrightness);
    return this;
  }

  /**
   * 进行饱和度排序
   * @param {boolean} order
   * @returns {LCPalette}
   */
  sortBySaturation(order) {
    sortColor(this.points, order, getSaturation);
    return this;
  }

  /**
   * 获取十六进制颜色代码集合
   * @returns {Array<string>} 十六进制代码集合
   */
  getHexColors() {
    return this.points.map((a) => rgbToHex(a[0], a[1], a[2]));
  }

  /**
   * 获取RGB点集合
   * [[255,255,255],[0,0,0]]
   * @returns {Array<Array<number>>} RGB点集合
   */
  getRGBPoints() {
    return this.points;
  }
}

export { getMonochromaticColors };
