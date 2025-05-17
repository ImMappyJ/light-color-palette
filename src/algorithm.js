/**
 * 计算色点与色点之间的欧氏距离
 * @param {Array<number>} point1 第一个点
 * @param {Array<number>} point2 第二个点
 * @return {number} 距离
 */
function euclideanDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) +
      Math.pow(point1[1] - point2[1], 2) +
      Math.pow(point1[2] - point2[2], 2)
  );
}

/**
 * 判断算法是否收敛
 * @param {Array<Object>} old_centers 上一批中心点
 * @param {Array<Object>} new_centers 当前中心点
 * @return {boolean} 是否收敛
 */
function isConverged(old_centers, new_centers) {
  if (old_centers.length == 0) return false;
  for (let i = 0; i < old_centers.length; i++) {
    if (euclideanDistance(old_centers[i], new_centers[i]) > 1) return false;
  }
  return true;
}

/**
 * 使用K-means算法对所有样本点进行抽取
 * @param {Array<Object>} pixels_array 像素点数组
 * @param {number} k 需要抽取出的中心点数量
 * @param {number} max_iterations 算法需要迭代的最大次数
 * @return {Array<Object>} 抽取出的中心点数组
 */
export async function kmeans(pixels_array, k = 6, max_iterations = 100) {
  let centers = pixels_array.sort(() => 0.5 - Math.random()).slice(0, k);
  let old_centers = [];
  let iterations = 0;
  while (!isConverged(old_centers, centers) && iterations++ <= max_iterations) {
    old_centers = centers.map((c) => [...c]);
    let clusters = Array(k)
      .fill()
      .map(() => []);
    pixels_array.forEach((pixel) => {
      const distances = centers.map((point) => euclideanDistance(point, pixel));
      const target_index = distances.indexOf(Math.min(...distances));
      clusters[target_index].push(pixel);
    });
    centers = clusters.map((points) => {
      if (points.length === 0) {
        return pixels_array[Math.floor(Math.random() * pixels_array.length)];
      } else {
        const sum = points.reduce((acc, val) => {
          return acc.map((x, i) => {
            return x + val[i];
          });
        }, Array(3).fill(0));
        return sum.map((x) => Math.round(x / points.length));
      }
    });
  }
  console.log(`一共迭代了${iterations}次`);
  return centers;
}

/**
 * 计算一个像素点的明度用于后续的明度排序
 * @param {Array<number>} point 需要计算明度的点
 * @return {Number} 最后得出的明度
 * 根据 `https://www.w3.org/TR/WCAG20/#relativeluminancedef` 公式得出
 */
function getLuminance(point) {
  const [LR, LG, LB] = point.map((val) => {
    const s_val = val / 255;
    if (s_val <= 0.03928) {
      return s_val / 12.92;
    } else {
      return Math.pow((s_val + 0.055) / 1.055, 2.4);
    }
  });
  return 0.2126 * LR + 0.7152 * LG + 0.0722 * LB;
}

/**
 * 对生成的颜色进行明度排序
 * @param {Array<Object>} points 需要进行排列的颜色点
 * @param {boolean} order 是否按照明度由小到大排列
 * @return {Array<Object>} 最后生成的排序后的颜色集合
 */
export function sortColorbyLuminance(points, order) {
  if (order) return points.sort((a, b) => getLuminance(a) - getLuminance(b));
  else return points.sort((a, b) => getLuminance(b) - getLuminance(a));
}

/**
 * 将8bitRGB格式转换为十六进制
 * (255,255,255) => #ffffff
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @return {string} #ffffff
 */
export function rgbToHex(r, g, b) {
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
