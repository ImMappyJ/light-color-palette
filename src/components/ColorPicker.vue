<template>
  <div class="full-page-container">
    <div class="content-container">
      <!-- 上传文件组件 - 水平居中 -->
      <div
        class="file-upload-container"
        :style="{ borderColor: getColorWithContrast(2) || '#ccc' }"
      >
        <label
          class="file-upload-label"
          :style="{
            backgroundColor: '#f0f0f0',
            color: getColorWithContrast(1) || '#000',
          }"
        >
          <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />
          <div class="upload-icon" :style="{ borderColor: getColorWithContrast(1) || '#000' }">
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
        </label>
        <p class="file-name" v-if="fileName" :style="{ color: getColorWithContrast(4) || '#000' }">
          已选择: {{ fileName }}
        </p>
      </div>

      <!-- K值文本输入框 - 用于k-means算法 -->
      <div v-if="imageData" class="k-input-container">
        <label for="k-input" :style="{ color: getColorWithContrast(2) || '#000' }">
          颜色数量 (k值):
        </label>
        <div class="input-with-button">
          <input
            type="number"
            id="k-input"
            v-model="kValue"
            min="3"
            max="7"
            class="k-input"
            :style="{
              borderColor: getColorWithContrast(2) || '#ccc',
              color: getColorWithContrast(2) || '#000',
            }"
          />
        </div>
      </div>
    </div>

    <div class="background-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
      <div
        class="blur-overlay"
        :style="{
          backgroundColor: getColorWithContrast(3)
            ? `${getColorWithContrast(3)}50`
            : 'rgba(255, 255, 255, 0.3)',
        }"
      ></div>

      <div class="foreground-components">
        <!-- 加载指示器 -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner-large"></div>
          <p>正在生成主题...</p>
        </div>

        <!-- 卡片容器表单 -->
        <div
          v-else
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
          <form @submit.prevent :style="{ color: getColorWithContrast(1) || '#000' }">
            <div class="form-group">
              <label for="username">用户名</label>
              <div
                class="input-container"
                :style="{ borderColor: getColorWithContrast(2) || '#ccc' }"
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
                  placeholder="请输入用户名"
                  :style="{ color: getColorWithContrast(1) || '#000' }"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <div
                class="input-container"
                :style="{ borderColor: getColorWithContrast(2) || '#ccc' }"
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
                  type="password"
                  id="password"
                  placeholder="请输入密码"
                  :style="{ color: getColorWithContrast(1) || '#000' }"
                />
              </div>
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
              ></div>
            </div>
          </div>
        </div>

        <!-- 信息文本 -->
        <p class="info-text" :style="{ color: getColorWithContrast(3) || '#000' }">
          上传图片并调整k值来控制主题中的颜色数量
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { PicthePicker } from 'picture-color-theme-picker'

const backgroundImage = ref('')
const themeColors = ref([])
const sortedColors = ref([])
const fileName = ref('')
const kValue = ref(4) // k-means算法的默认k值
const imageData = ref(null) // 存储图像数据以便重新生成主题
const isLoading = ref(false) // 加载状态
const usedColorIndices = ref([]) // 存储已使用的颜色索引

// 获取具有足够对比度的颜色
const getColorWithContrast = (baseIndex) => {
  if (!sortedColors.value || sortedColors.value.length === 0) return null

  // 确保我们有足够的颜色可用
  if (baseIndex >= sortedColors.value.length) {
    baseIndex = baseIndex % sortedColors.value.length
  }

  // 直接返回对应索引的颜色，不再检查是否已使用
  // 这样可以确保每次调用相同的baseIndex会返回相同的颜色
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

    const picker = new PicthePicker(imgData)
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

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (file) {
    fileName.value = file.name
    const reader = new FileReader()
    reader.onload = async (e) => {
      backgroundImage.value = e.target.result
      imageData.value = e.target.result // 存储图像数据以便后续重新生成
      await generateTheme(e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

// 监听kValue变化，自动重新生成主题
watch(kValue, (newValue, oldValue) => {
  if (newValue !== oldValue && imageData.value) {
    regenerateTheme()
  }
})

// 组件挂载时初始化
onMounted(() => {
  // 可以在这里添加默认图片或其他初始化逻辑
})
</script>

<style scoped>
/* 原有的样式保持不变 */
.full-page-container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.content-container {
  position: absolute;
  top: 0;
  left: auto;
  right: auto;
  width: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.file-upload-container {
  max-width: 320px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.file-upload-container:hover {
  transform: translateY(-2px);
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
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.k-input-container label {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 4px 12px;
  border-radius: 12px;
  align-self: center;
}

.input-with-button {
  display: flex;
  width: 100%;
  gap: 8px;
}

.k-input {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 0 12px;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.8);
  outline: none;
  transition: all 0.2s ease;
}

.k-input:focus {
  border-width: 2px;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.apply-button {
  height: 40px;
  min-width: 80px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.apply-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.apply-button:active:not(:disabled) {
  transform: translateY(0);
}

.apply-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 加载指示器样式 */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

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

.background-container {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
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

.foreground-components {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

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

.input-container:focus-within {
  border-width: 2px;
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

.color-palette {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.palette-title {
  font-size: 14px;
  margin: 0 0 8px 0;
  text-align: center;
}

.color-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.color-chip {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.2s ease;
}

.color-chip:hover {
  transform: scale(1.2);
}

.info-text {
  margin-top: 24px;
  font-size: 14px;
  text-align: center;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
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
}
</style>
