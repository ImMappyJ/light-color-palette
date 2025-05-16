const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
/**
 * 将十六进制颜色转换为纯色图片
 * @param {string} hexColor - 十六进制颜色代码（如 "#FF0000" 或 "FF0000"）
 * @param {number} width - 图片宽度（默认 100px）
 * @param {number} height - 图片高度（默认 100px）
 * @param {string} outputPath - 输出文件路径（默认 "./color.png"）
 * @param {string} format - 图片格式（"png" 或 "jpg"，默认 "png"）
 */
export function generateColorImage(hexColor, width = 100, height = 100, outputPath = './color.png', format = 'png') {
  // 处理十六进制颜色（移除 # 前缀并验证格式）
  const cleanHex = hexColor.replace('#', '');
  if (!/^[0-9A-F]{6}$/i.test(cleanHex)) {
    throw new Error('无效的十六进制颜色代码，应为6位数字或字母');
  }

  // 解析 RGB 值
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // 创建 Canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 绘制纯色矩形
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, width, height);

  // 确保输出目录存在
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 保存图片
  const stream = format === 'png' 
    ? canvas.createPNGStream() 
    : canvas.createJPEGStream({ quality: 1 });

  const out = fs.createWriteStream(outputPath);
  stream.pipe(out);

  return new Promise((resolve, reject) => {
    out.on('finish', () => resolve(outputPath));
    out.on('error', (err) => reject(err));
  });
}