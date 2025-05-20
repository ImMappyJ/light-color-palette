const {
  getMonochromaticColors,
  getHue,
  getBrightness,
  getSaturation,
  getLuminance,
  sortColor,
} = require("../src/algorithm");
const { hsvToRgb } = require("../src/utils");

describe("getMonochromaticColors", () => {
  // 测试生成的单色系颜色列表长度是否正确
  test("should generate correct number of monochromatic colors", () => {
    const point = [255, 0, 0]; // 示例颜色
    const step = 3;
    const colors = getMonochromaticColors(point, step);
    // 检查生成的颜色数量是否符合预期
    expect(colors.length).toBe(2 * step + 3);
  });

  // 测试生成的颜色是否为有效的 RGB 颜色
  test("should generate valid RGB colors", () => {
    const point = [255, 0, 0];
    const step = 3;
    const colors = getMonochromaticColors(point, step);
    // 遍历生成的颜色列表
    colors.forEach((color) => {
      // 检查每个颜色是否为数组
      expect(Array.isArray(color)).toBe(true);
      // 检查每个颜色数组的长度是否为 3
      expect(color.length).toBe(3);
      color.forEach((value) => {
        // 检查每个颜色值是否在 0 到 255 之间
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
      });
    });
  });

  // 测试默认步数是否为 3
  test("should use default step of 3 if not provided", () => {
    const point = [255, 0, 0];
    const colors = getMonochromaticColors(point);
    // 检查生成的颜色数量是否符合默认步数的预期
    expect(colors.length).toBe(2 * 3 + 3);
  });
});

describe("sortColors", () => {
  // 测试按色相排序
  test("should sort colors by hue in ascending order", () => {
    const colors = [
      [255, 0, 0], // 红色
      [0, 255, 0], // 绿色
      [0, 0, 255], // 蓝色
      [255, 255, 0], // 黄色
    ];

    const sortedColors = sortColor(colors, true, getHue);
    const hues = colors.map((color) => getHue(color));

    // 检查色相是否按升序排列
    for (let i = 1; i < hues.length; i++) {
      expect(hues[i]).toBeGreaterThanOrEqual(hues[i - 1]);
    }
  });

  // 测试按亮度排序
  test("should sort colors by luminance in descending order", () => {
    const colors = [
      [255, 255, 255], // 白色
      [128, 128, 128], // 灰色
      [0, 0, 0], // 黑色
      [200, 200, 200], // 浅灰色
    ];

    const sortedColors = sortColor(colors, false, getLuminance);
    const luminances = colors.map((color) => getLuminance(color));

    // 检查亮度是否按降序排列
    for (let i = 1; i < luminances.length; i++) {
      expect(luminances[i]).toBeLessThanOrEqual(luminances[i - 1]);
    }
  });

  // 测试包含相同颜色的数组
  test("should handle duplicate colors correctly", () => {
    const colors = [
      [255, 0, 0],
      [255, 0, 0],
      [0, 0, 255],
      [0, 0, 255],
    ];

    const sortedColors = sortColor(colors, true, getHue);
    const hues = colors.map((color) => getHue(color));

    // 检查排序稳定性（相同颜色保持原有顺序）
    const redIndices = hues
      .map((h, i) => (h === getHue([255, 0, 0]) ? i : -1))
      .filter((i) => i !== -1);
    const blueIndices = hues
      .map((h, i) => (h === getHue([0, 0, 255]) ? i : -1))
      .filter((i) => i !== -1);

    expect(redIndices).toEqual([0, 1]);
    expect(blueIndices).toEqual([2, 3]);
  });
});
