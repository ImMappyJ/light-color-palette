<h2 align="center">
PictureColorThemePicker
</h2>


<p align="center"><img src="images/icon.png" width="128px"/></p>

![GitHub package.json version](https://img.shields.io/github/package-json/v/immappyj/picture-color-theme-picker)
![License](https://img.shields.io/npm/l/picture-color-theme-picker)
![npm](https://img.shields.io/npm/dm/picture-color-theme-picker)
![GitHub last commit](https://img.shields.io/github/last-commit/immappyj/picture-color-theme-picker)
![GitHub Repo stars](https://img.shields.io/github/stars/immappyj/picture-color-theme-picker?style=social)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.itsmygo.cn%2Fpicture-color-theme-picker%2F&style=flat&label=DemoWeb)



## 简介
PicthePicker是一个强大轻量级的JavaScript库，用于从图片中提取主题色。它使用K-means算法对图片的像素进行聚类分析，从而得到代表性的主题色。此外，该库还支持对提取的颜色进行明度和亮度排序，并提供将RGB颜色转换为十六进制颜色代码的功能。

[使用DEMO](https://www.itsmygo.cn/picture-color-theme-picker)

## 功能特性
- **主题色提取**：使用K-means算法从图片中提取指定数量的主题色。
- **颜色排序**：支持按明度和亮度对提取的颜色进行排序。
- **颜色格式转换**：可以将RGB颜色转换为十六进制颜色代码。
- **图片处理**：支持加载本地图片和远程图片，并对图片进行像素抽样。

## 安装
使用npm安装：
```bash
npm install picture-color-theme-picker
```

或使用yarn安装：
```bash
yarn add picture-color-theme-picker
```

## 使用方法

### 初始化
```javascript
// 创建 PicthePicker 实例
const picker = new PicthePicker('path/to/your/image.jpg');
```

### 生成主题色
```javascript
// 生成 6 种主题色
picker.genTheme(6).then(() => {
  console.log('主题色生成成功');
});
```

### 颜色排序
```javascript
// 按明度从低到高排序
picker.sortByLuminance(true);

// 按亮度从高到低排序
picker.sortByBrightness(false);
```

### 获取颜色代码
```javascript
// 获取十六进制颜色代码集合
const hexColors = picker.getHexColors();
console.log(hexColors);

// 获取 RGB 点集合
const rgbPoints = picker.getRGBPoints();
console.log(rgbPoints);
```

## API 文档

### `PicthePicker` 类
- **构造函数**：`constructor(src)`
  - `src`：图片资源的URL或`Image`对象。

- **方法**：
  - `genTheme(k)`：使用K-means算法生成主题色。
    - `k`：需要生成的颜色数量。
    - 返回值：`Promise<PicthePicker>`

  - `sortByLuminance(order)`：按明度对颜色进行排序。
    - `order`：排列顺序，`true`为低到高。
    - 返回值：`PicthePicker`

  - `sortByBrightness(order)`：按亮度对颜色进行排序。
    - `order`：排列顺序，`true`为低到高。
    - 返回值：`PicthePicker`

  - `getHexColors()`：获取十六进制颜色代码集合。
    - 返回值：`Array<string>`

  - `getRGBPoints()`：获取RGB点集合。
    - 返回值：`Array<Array<number>>`

## 代码结构
- `src/algorithm.js`：包含K-means算法、颜色距离计算、明度和亮度计算、颜色排序以及RGB转十六进制等核心算法。
- `src/utils.js`：包含图片加载和像素抽样的工具函数。
- `src/index.js`：定义了`PicthePicker`类，作为对外的主要接口。

## 示例应用
以下是一个简单的HTML页面示例，展示如何使用PicthePicker：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PicthePicker Demo</title>
    <style>
        .color-swatch {
            width: 100px;
            height: 100px;
            display: inline-block;
            margin: 5px;
        }
    </style>
</head>
<body>
    <img id="targetImage" src="sample.jpg" alt="Sample Image">
    <div id="colorPalette"></div>

    <script type="module">
        import { PicthePicker } from 'picture-color-theme-picker';

        const image = document.getElementById('targetImage');
        const palette = document.getElementById('colorPalette');

        const picker = new PicthePicker(image);

        picker.genTheme(5).then(() => {
            const hexColors = picker.getHexColors();
            
            hexColors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                swatch.textContent = color;
                palette.appendChild(swatch);
            });
        });
    </script>
</body>
</html>
```

## 贡献
如果你对该项目有任何建议或发现了bug，请在GitHub上提交issue或pull request。

## 许可证
该项目采用[MIT许可证](https://opensource.org/licenses/MIT)。