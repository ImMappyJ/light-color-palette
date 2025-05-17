import { describe, expect, test } from "@jest/globals";
import { generateTheme, loadImage, getPixelsArray } from "../src";
import { PicthePicker } from "../src";
import { generateColorImage } from "../__test__/test_utils";

const image_url = "file:///I:/Photos/Completed%20Photos/Japan/DSC03655.jpg";

describe("get theme", () => {
  test("store the theme color in localstorage", async () => {
    const k = 6;
    const picker = new PicthePicker(image_url);
    const theme_colors = (await picker.genTheme(k)).sortByLuminance(true).getHexColors();
    expect(theme_colors.length).toBe(k);
    for (let i = 0; i < theme_colors.length; i++) {
      const color = theme_colors[i];
      console.log(color);
      const outputPath = `./theme/${i}_${theme_colors[i]}.png`;
      await generateColorImage(color, 100, 100, outputPath);
      const fs = require("fs");
      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(100);
    }
  });
});
