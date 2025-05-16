/**
 * 计算色点与色点之间的欧氏距离的平方
 * @param {Array<number>} point1 第一个点
 * @param {Array<number>} point2 第二个点
 * @return {number} 距离的平方
 */
function euclideanDistance(point1, point2) {
  return (
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
export function kmeans(pixels_array, k, max_iterations = 100) {
  let centers = pixels_array.sort(() => 0.5 - Math.random()).slice(0, k);
  let old_centers = [];
  const iterations = 0;
  while (isConverged(old_centers, centers) && iterations++ <= max_iterations) {
    old_centers = centers.slice();
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
          acc.map((x, i) => {
            return x + val[i];
          });
        }, Array(3).fill(0));
        return sum.map((x) => Math.round(x / clusters.length));
      }
    });
  }
  return centers;
}
