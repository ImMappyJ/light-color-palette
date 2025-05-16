import { describe, expect, test } from "@jest/globals";
import { generateTheme, loadImage, getPixelsArray } from "../src";
import { generateColorImage } from "../__test__/test_utils";

const image_url = "file:///D:/Image/120672249_p0.jpg";

describe("get theme", () => {
  test("the number of themes color is k", async () => {
    expect((await generateTheme(image_url, 6)).length).toBe(6);
  });
  test("can get the picture via url", async () => {
    expect(await loadImage(image_url)).not.toBe(undefined);
  });
  test("can get pixels array via image", async () => {
    let img = await loadImage(image_url);
    expect(getPixelsArray(img).length).not.toBe(0);
  });
  test("store the theme color in localstorage", async () => {
    const k = 3;
    const theme_colors = await generateTheme(image_url, k);
    expect(theme_colors.length).toBe(k);
    for (let i = 0; i < theme_colors.length; i++) {
      const color = theme_colors[i];
      const outputPath = `./theme/color_${i + 1}.png`;
      await generateColorImage(color, 100, 100, outputPath);
      const fs = require("fs");
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(100);
    }
  });
});
