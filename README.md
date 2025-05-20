<h2 align="center">
LightColorPalatte
</h2>


<p align="center"><img src="images/icon.png" width="128px"/></p>

![GitHub package.json version](https://img.shields.io/github/package-json/v/immappyj/light-color-palette
)
![License](https://img.shields.io/npm/l/light-color-palette
)
![npm](https://img.shields.io/npm/dm/light-color-palette
)
![GitHub last commit](https://img.shields.io/github/last-commit/immappyj/light-color-palette)
![GitHub Repo stars](https://img.shields.io/github/stars/immappyj/light-color-palette?style=social)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.itsmygo.cn%2Flight-color-palette%2F&style=flat&label=DemoWeb)

## 简介
LightColorPalatte是一个强大轻量级的JavaScript库，用于从图片中提取主题色。它使用K-means算法对图片的像素进行聚类分析，从而得到代表性的主题色。此外，该库还支持对提取的颜色进行明度、亮度和饱和度排序，提供将RGB颜色转换为十六进制颜色代码的功能，以及生成指定颜色的单色系颜色列表。

[使用DEMO](https://www.itsmygo.cn/light-color-palette)

## 功能特性
- **主题色提取**：使用K-means算法从图片中提取指定数量的主题色。
- **颜色排序**：支持按明度、亮度和饱和度对提取的颜色进行排序。
- **颜色格式转换**：可以将RGB颜色转换为十六进制颜色代码。
- **图片处理**：支持加载本地图片和远程图片，并对图片进行像素抽样。
- **单色系生成**：能够生成指定颜色的单色系颜色列表。

## 安装
使用npm安装：
```bash
npm install light-color-palette
```

或使用yarn安装：
```bash
yarn add light-color-palette
```

## 使用方法

### 初始化
```javascript
// 创建 LCPalette 实例
const palette = new LCPalette('path/to/your/image.jpg');
```

### 生成主题色
```javascript
// 生成 6 种主题色
palette.genTheme(6).then(() => {
  console.log('主题色生成成功');
});
```

### 颜色排序
```javascript
// 按明度从低到高排序
palette.sortByLuminance(true);

// 按亮度从高到低排序
palette.sortByBrightness(false);

// 按饱和度从低到高排序
palette.sortBySaturation(true);
```

### 获取颜色代码
```javascript
// 获取十六进制颜色代码集合
const hexColors = palette.getHexColors();
console.log(hexColors);

// 获取 RGB 点集合
const rgbPoints = palette.getRGBPoints();
console.log(rgbPoints);
```

### 生成单色系颜色列表
```javascript
import { getMonochromaticColors } from 'light-color-palette';

const rgbPoint = [255, 0, 0]; // 示例 RGB 颜色
const monochromaticColors = getMonochromaticColors(rgbPoint, 3);
console.log(monochromaticColors);
```

## API 文档

### `LCPalette` 类
- **构造函数**：`constructor(src)`
  - `src`：图片资源的URL或`Image`对象。

- **方法**：
  - `genTheme(k)`：使用K-means算法生成主题色。
    - `k`：需要生成的颜色数量。
    - 返回值：`Promise<LCPalette>`

  - `sortByLuminance(order)`：按明度对颜色进行排序。
    - `order`：排列顺序，`true`为低到高。
    - 返回值：`LCPalette`

  - `sortByBrightness(order)`：按亮度对颜色进行排序。
    - `order`：排列顺序，`true`为低到高。
    - 返回值：`LCPalette`

  - `sortBySaturation(order)`：按饱和度对颜色进行排序。
    - `order`：排列顺序，`true`为低到高。
    - 返回值：`LCPalette`

  - `getHexColors()`：获取十六进制颜色代码集合。
    - 返回值：`Array<string>`

  - `getRGBPoints()`：获取RGB点集合。
    - 返回值：`Array<Array<number>>`

### 工具函数
- `getMonochromaticColors(point, step)`：生成指定颜色的单色系颜色列表。
  - `point`：RGB颜色值，格式为`[r, g, b]`。
  - `step`：生成的渐变步数（不包括原始颜色），默认3。
  - 返回值：单色系RGB颜色列表，格式为`[[r, g, b], ...]`

## 代码结构
- `src/algorithm.js`：包含K-means算法、颜色距离计算、明度和亮度计算、色相和饱和度计算、颜色排序、RGB转十六进制以及生成单色系颜色列表等核心算法。
- `src/utils.js`：包含图片加载和像素抽样的工具函数，以及RGB转十六进制和HSV转RGB的转换函数。
- `src/index.js`：定义了`LCPalette`类，作为对外的主要接口。

## 示例应用
以下是一个简单的HTML页面示例，展示如何使用LCPalette：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LCPalette Demo</title>
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
        import { LCPalette } from 'light-color-palette';

        const image = document.getElementById('targetImage');
        const palette = document.getElementById('colorPalette');

        const picker = new LCPalette(image);

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


### 主要更新点
`2025-05-20`
1. **简介部分**：增加了支持饱和度排序和生成单色系颜色列表的功能描述。
2. **功能特性部分**：添加了“单色系生成”的功能描述。
3. **使用方法部分**：
   - 将初始化和类名从`PicthePicker`改为`LCPalette`。
   - 增加了按饱和度排序的示例代码。
   - 增加了生成单色系颜色列表的示例代码。
4. **API文档部分**：
   - 将类名从`PicthePicker`改为`LCPalette`。
   - 增加了`sortBySaturation`方法的描述。
   - 增加了`getMonochromaticColors`工具函数的描述。
5. **代码结构部分**：更新了`src/algorithm.js`和`src/utils.js`包含的功能描述。
6. **示例应用部分**：将类名从`PicthePicker`改为`LCPalette`。