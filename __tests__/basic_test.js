import { getHue } from "../src/algorithm";
import { describe, expect, test } from "@jest/globals";

describe("getHue", () => {
  // 捕获console.log输出
  let consoleLogSpy;

  beforeEach(() => {
    // 启用console.log捕获
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    // 恢复console.log
    consoleLogSpy.mockRestore();
  });

  it("处理纯红色", () => {
    const result = getHue([255, 0, 0]);
    console.log("纯红色测试结果:", result);

    expect(result).toBe(0);
    // 验证console.log被调用
    expect(consoleLogSpy).toHaveBeenCalledWith("纯红色测试结果:", 0);
  });

  it("处理纯绿色", () => {
    const result = getHue([0, 255, 0]);
    console.log("纯绿色测试结果:", result);

    expect(result).toBe(120);
    expect(consoleLogSpy).toHaveBeenCalledWith("纯绿色测试结果:", 120);
  });

  it("处理纯蓝色", () => {
    const result = getHue([0, 0, 255]);
    console.log("纯蓝色测试结果:", result);

    expect(result).toBe(240);
    expect(consoleLogSpy).toHaveBeenCalledWith("纯蓝色测试结果:", 240);
  });

  it("处理灰色(无色彩)", () => {
    const result = getHue([128, 128, 128]);
    console.log("灰色测试结果:", result);

    expect(result).toBe(0);
    expect(consoleLogSpy).toHaveBeenCalledWith("灰色测试结果:", 0);
  });

  it("处理黄色(R=255, G=255, B=0)", () => {
    const result = getHue([255, 255, 0]);
    console.log("黄色测试结果:", result);

    expect(result).toBe(60);
    expect(consoleLogSpy).toHaveBeenCalledWith("黄色测试结果:", 60);
  });

  it("处理负值情况", () => {
    const result = getHue([0, 0, 128]);
    console.log("负值测试结果:", result);

    // 青色的Hue值应为180
    expect(result).toBe(240);
    expect(consoleLogSpy).toHaveBeenCalledWith("负值测试结果:", 240);
  });
});
