const { getMonochromaticColors } = require("../src/algorithm");
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
