<template>
  <div class="full-page-container">
    <!-- Global background container -->
    <div class="background-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
      <div
        class="blur-overlay"
        :style="{
          backgroundColor: getColorWithContrast(3)
            ? `${getColorWithContrast(3)}50`
            : 'rgba(255, 255, 255, 0.3)',
        }"
      ></div>

      <!-- Main content with horizontal layout -->
      <div class="main-content">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner-large"></div>
          <p>正在生成主题...</p>
        </div>

        <div v-else class="two-column-layout">
          <!-- Left column: File upload and color controls -->
          <div class="left-column">
            <!-- 上传文件组件 - 垂直居中 -->
            <div class="upload-section">
              <div
                class="file-upload-container"
                :style="{ borderColor: getColorWithContrast(2) || '#ccc' }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                :class="{ dragging: isDragging }"
              >
                <label
                  class="file-upload-label"
                  :style="{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: getColorWithContrast(1) || '#000',
                  }"
                >
                  <input
                    type="file"
                    @change="handleFileChange"
                    accept="image/*"
                    class="file-input"
                  />
                  <div
                    class="upload-icon"
                    :style="{ borderColor: getColorWithContrast(1) || '#000' }"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <span>选择图片设置主题</span>
                  <small class="drag-hint">或拖放图片到此处</small>
                </label>
                <p
                  class="file-name"
                  v-if="fileName"
                  :style="{ color: getColorWithContrast(4) || '#000' }"
                >
                  已选择: {{ fileName }}
                </p>
              </div>

              <!-- K值文本输入框 - 用于k-means算法 -->
              <div v-if="imageData" class="k-input-container">
                <label for="k-input" :style="{ color: getColorWithContrast(2) || '#000' }">
                  颜色数量 (k值):
                </label>
                <div class="input-with-slider">
                  <input
                    type="range"
                    v-model.number="kValue"
                    min="3"
                    max="7"
                    class="k-slider"
                    :style="{ accentColor: getColorWithContrast(2) || '#4a90e2' }"
                  />
                  <span
                    class="k-value-display"
                    :style="{ color: getColorWithContrast(1) || '#000' }"
                  >
                    {{ kValue }}
                  </span>
                </div>
              </div>

              <!-- 颜色调色板显示 -->
              <div class="color-palette" v-if="sortedColors.length > 0">
                <p class="palette-title" :style="{ color: getColorWithContrast(1) || '#000' }">
                  主题颜色 (k={{ kValue }}):
                </p>
                <div class="color-chips">
                  <div
                    v-for="(color, index) in sortedColors"
                    :key="index"
                    class="color-chip"
                    :style="{
                      backgroundColor: color,
                      borderColor: usedColorIndices.includes(index)
                        ? getColorWithContrast(1)
                        : 'rgba(255, 255, 255, 0.3)',
                      borderWidth: usedColorIndices.includes(index) ? '3px' : '2px',
                    }"
                    :title="`颜色 ${index + 1}: ${color}`"
                    @click="showMonochromaticColors(color)"
                  >
                    <span class="color-hex">{{ color }}</span>
                  </div>
                </div>

                <!-- 单色系颜色设置 -->
                <div class="monochromatic-controls" v-if="sortedColors.length > 0">
                  <div class="form-group">
                    <label :style="{ color: getColorWithContrast(1) || '#000' }">
                      单色系渐变步数:
                    </label>
                    <div class="step-input-container">
                      <input
                        type="number"
                        v-model.number="stepValue"
                        min="1"
                        max="10"
                        class="step-input"
                        :style="{
                          borderColor: getColorWithContrast(2) || '#ccc',
                          color: getColorWithContrast(1) || '#000',
                        }"
                        @change="validateStepValue"
                      />
                      <span class="step-unit" :style="{ color: getColorWithContrast(1) || '#000' }"
                        >步</span
                      >
                    </div>
                  </div>
                </div>

                <!-- 显示单色系颜色 -->
                <div v-if="monochromaticColors.length > 0" class="monochromatic-colors">
                  <p class="palette-title" :style="{ color: getColorWithContrast(1) || '#000' }">
                    单色系颜色:
                  </p>
                  <div class="color-chips">
                    <div
                      v-for="(monoColor, idx) in monochromaticColors"
                      :key="idx"
                      class="color-chip"
                      :style="{ backgroundColor: monoColor }"
                      :title="`单色系 ${idx + 1}: ${monoColor}`"
                      @click="copyToClipboard(monoColor)"
                    >
                      <span class="color-hex">{{ monoColor }}</span>
                      <span v-if="copiedColor === monoColor" class="copied-indicator">已复制!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right column: Form -->
          <div class="right-column">
            <!-- 卡片容器表单 -->
            <div
              class="card"
              :style="{
                backgroundColor: getColorWithContrast(3)
                  ? `${getColorWithContrast(3)}90`
                  : 'rgba(255, 255, 255, 0.8)',
                boxShadow: getColorWithContrast(2)
                  ? `0 8px 32px ${getColorWithContrast(2)}40`
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              }"
            >
              <h2 :style="{ color: getColorWithContrast(1) || '#000' }">欢迎回来</h2>

              <!-- 增强表单 -->
              <form
                @submit.prevent="handleLogin"
                :style="{ color: getColorWithContrast(1) || '#000' }"
              >
                <div class="form-group">
                  <label for="username">用户名</label>
                  <div
                    class="input-container"
                    :style="{ borderColor: getColorWithContrast(2) || '#ccc' }"
                    :class="{ focused: focusedField === 'username' }"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input
                      type="text"
                      id="username"
                      v-model.lazy="username"
                      placeholder="请输入用户名"
                      :style="{ color: getColorWithContrast(1) || '#000' }"
                      @focus="focusedField = 'username'"
                      @blur="focusedField = null"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="password">密码</label>
                  <div
                    class="input-container"
                    :style="{ borderColor: getColorWithContrast(2) || '#ccc' }"
                    :class="{ focused: focusedField === 'password' }"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      v-model.lazy="password"
                      placeholder="请输入密码"
                      :style="{ color: getColorWithContrast(1) || '#000' }"
                      @focus="focusedField = 'password'"
                      @blur="focusedField = null"
                    />
                    <button
                      type="button"
                      class="toggle-password"
                      @click="showPassword = !showPassword"
                      :style="{ color: getColorWithContrast(1) || '#000' }"
                    >
                      <svg
                        v-if="showPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                        ></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-options">
                  <label class="checkbox-container">
                    <input type="checkbox" v-model="rememberMe" />
                    <span
                      class="checkmark"
                      :style="{ borderColor: getColorWithContrast(2) || '#ccc' }"
                    ></span>
                    <span :style="{ color: getColorWithContrast(1) || '#000' }">记住我</span>
                  </label>
                  <a
                    href="#"
                    class="forgot-password"
                    :style="{ color: getColorWithContrast(2) || '#4a90e2' }"
                  >
                    忘记密码?
                  </a>
                </div>

                <button
                  type="submit"
                  :style="{
                    backgroundColor: getColorWithContrast(2) || '#4a90e2',
                    color: getColorWithContrast(0) || '#fff',
                  }"
                >
                  登录
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- 信息文本 -->
        <p class="info-text" :style="{ color: getColorWithContrast(3) || '#000' }">
          上传图片并调整k值来控制主题中的颜色数量
        </p>
      </div>
    </div>

    <!-- GitHub 传送门 -->
    <div
      class="github-portal"
      :style="{
        backgroundColor: getColorWithContrast(1) ? `${getColorWithContrast(1)}e6` : '#24292e',
      }"
    >
      <a
        href="https://github.com/yourusername/color-picker"
        target="_blank"
        rel="noopener noreferrer"
        class="portal-link"
      >
        <div class="portal-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="github-icon"
          >
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            ></path>
          </svg>
          <span>前往 GitHub 项目</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { LCPalette, getMonochromaticColors, rgbToHex } from 'light-color-palette'

const backgroundImage = ref('')
const themeColors = ref([])
const sortedColors = ref([])
const fileName = ref('')
const kValue = ref(4) // k-means算法的默认k值
const imageData = ref(null) // 存储图像数据以便重新生成主题
const isLoading = ref(false) // 加载状态
const usedColorIndices = ref([]) // 存储已使用的颜色索引
const monochromaticColors = ref([]) // 存储单色系颜色
const stepValue = ref(3) // 单色系渐变步数
const isDragging = ref(false) // 拖拽状态
const focusedField = ref(null) // 当前聚焦的输入字段
const showPassword = ref(false) // 显示密码状态
const username = ref('') // 用户名
const password = ref('') // 密码
const rememberMe = ref(false) // 记住我
const copiedColor = ref('') // 已复制的颜色

// 获取具有足够对比度的颜色
const getColorWithContrast = (baseIndex) => {
  if (!sortedColors.value || sortedColors.value.length === 0) return null

  // 确保我们有足够的颜色可用
  if (baseIndex >= sortedColors.value.length) {
    baseIndex = baseIndex % sortedColors.value.length
  }

  // 直接返回对应索引的颜色
  return sortedColors.value[baseIndex]
}

// 基于当前k值生成主题颜色的函数
const generateTheme = async (imgData) => {
  if (!imgData) return

  isLoading.value = true
  usedColorIndices.value = [] // 重置已使用的颜色索引

  try {
    // 添加延迟以确保加载指示器可见
    await new Promise((resolve) => setTimeout(resolve, 300))

    const picker = new LCPalette(imgData)
    await picker.genTheme(parseInt(kValue.value))
    themeColors.value = picker.getHexColors()

    // 按亮度排序
    sortedColors.value = picker.sortByLuminance(false).getHexColors()

    // 预先分配一些颜色索引，确保UI一致性
    usedColorIndices.value = [0, 1, 2, 3]
  } catch (error) {
    console.error('生成主题时出错:', error)
  } finally {
    isLoading.value = false
  }
}

// 当k值变化时重新生成主题的函数
const regenerateTheme = async () => {
  // 验证k值在有效范围内
  const k = parseInt(kValue.value)
  if (isNaN(k) || k < 3) {
    kValue.value = 3
  } else if (k > 7) {
    kValue.value = 7
  }

  if (imageData.value) {
    await generateTheme(imageData.value)
  }
}

// 处理文件选择
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件拖放
const handleFileDrop = async (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

// 处理文件处理逻辑
const processFile = async (file) => {
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = async (e) => {
    backgroundImage.value = e.target.result
    imageData.value = e.target.result // 存储图像数据以便后续重新生成
    await generateTheme(e.target.result)
  }
  reader.readAsDataURL(file)
}

// 监听kValue变化，自动重新生成主题
watch(kValue, (newValue, oldValue) => {
  if (newValue !== oldValue && imageData.value) {
    regenerateTheme()
  }
})

// 监听stepValue变化，重新生成单色系颜色
watch(stepValue, (newValue) => {
  if (selectedColor.value) {
    showMonochromaticColors(selectedColor.value)
  }
})

// 存储当前选中的颜色
const selectedColor = ref('')

// 生成单色系颜色的函数
const showMonochromaticColors = (hexColor) => {
  selectedColor.value = hexColor

  // 将十六进制颜色转换为RGB数组
  const rgbArray = hexToRgb(hexColor)
  if (!rgbArray) return

  // 调用库函数生成单色系颜色
  try {
    monochromaticColors.value = getMonochromaticColors(rgbArray, parseInt(stepValue.value)).map(
      (hsv) => rgbToHex(...hsv),
    )
  } catch (error) {
    console.error('生成单色系颜色时出错:', error)
    monochromaticColors.value = []
  }
}

// 辅助函数：将十六进制颜色转为RGB数组
const hexToRgb = (hex) => {
  // 移除#符号
  hex = hex.replace('#', '')

  // 处理3位或6位十六进制颜色
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return [r, g, b]
}

// 复制颜色到剪贴板
const copyToClipboard = async (color) => {
  try {
    await navigator.clipboard.writeText(color)
    copiedColor.value = color
    setTimeout(() => {
      copiedColor.value = ''
    }, 2000)
  } catch (err) {
    console.error('复制到剪贴板失败:', err)
  }
}

// 验证步数值在有效范围内
const validateStepValue = () => {
  const value = parseInt(stepValue.value)
  if (isNaN(value) || value < 1) {
    stepValue.value = 1
  } else if (value > 10) {
    stepValue.value = 10
  }
}

// 处理登录表单提交
const handleLogin = () => {
  console.log('登录信息:', {
    username: username.value,
    password: password.value,
    rememberMe: rememberMe.value,
  })
  // 这里可以添加实际的登录逻辑
}

onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
.full-page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

/* 全局背景容器 */
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: background-image 0.5s ease;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(15px);
  transition: background-color 0.5s ease;
}

/* 主内容区域 */
.main-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

/* 两列布局 */
.two-column-layout {
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 30px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
}

/* 左侧列 - 上传部分 */
.left-column {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* 右侧列 - 表单部分 */
.right-column {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 文件上传容器 */
.file-upload-container {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
  position: relative;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
}

.file-upload-container:hover {
  transform: translateY(-2px);
}

.file-upload-container.dragging {
  border-width: 3px;
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.upload-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.drag-hint {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
}

.file-name {
  padding: 8px 16px;
  margin: 0;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* K值输入框样式 */
.k-input-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.k-input-container label {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  align-self: center;
}

.input-with-slider {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
}

.k-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
}

.k-value-display {
  font-size: 18px;
  font-weight: bold;
  min-width: 24px;
  text-align: center;
}

/* 加载指示器 */
.loading-spinner-large {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 30px;
  border-radius: 16px;
  z-index: 100;
}

/* 卡片样式 */
.card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

/* 表单样式 */
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.input-container.focused {
  border-width: 2px;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.input-container svg {
  opacity: 0.7;
}

.input-container input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
}

.input-container input::placeholder {
  opacity: 0.5;
}

.toggle-password {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -10px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid;
  border-radius: 4px;
}

.checkbox-container input:checked ~ .checkmark:after {
  content: '';
  position: absolute;
  display: block;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-password {
  font-size: 14px;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

button {
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
}

/* 颜色调色板样式 */
.color-palette {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

.palette-title {
  font-size: 14px;
  margin: 0 0 12px 0;
  text-align: center;
  font-weight: 500;
}

.color-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.color-chip {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.2s ease;
  cursor: pointer;
  position: relative;
}

.color-chip:hover {
  transform: scale(1.2);
}

.color-hex {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.color-chip:hover .color-hex {
  opacity: 1;
}

.copied-indicator {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 5;
}

.info-text {
  margin-top: 24px;
  font-size: 14px;
  text-align: center;
  max-width: 600px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.monochromatic-controls {
  margin-top: 16px;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  width: 100%;
}

.step-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.step-input {
  width: 60px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0 10px;
  font-size: 16px;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;
}

.step-input:focus {
  border-width: 2px;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.step-unit {
  font-size: 14px;
  font-weight: 500;
}

.monochromatic-colors {
  margin-top: 16px;
  width: 100%;
}

/* GitHub 传送门样式 */
.github-portal {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px 0;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.portal-link {
  display: block;
  text-decoration: none;
  color: white;
  transition: transform 0.3s ease;
}

.portal-link:hover {
  transform: translateY(-3px);
}

.portal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
}

.github-icon {
  width: 24px;
  height: 24px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .two-column-layout {
    flex-direction: column;
    gap: 20px;
  }

  .left-column,
  .right-column {
    max-width: 500px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .card {
    padding: 24px;
  }

  .input-container {
    height: 44px;
  }

  button {
    height: 44px;
  }

  .github-portal {
    padding: 10px 0;
  }

  .portal-content {
    font-size: 14px;
  }

  .github-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 15px;
  }

  .card,
  .color-palette,
  .k-input-container {
    padding: 16px;
  }

  .file-upload-container {
    margin-bottom: 0;
  }
}
</style>
