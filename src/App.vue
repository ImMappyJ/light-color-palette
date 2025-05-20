<template>
  <div id="app">
    <ColorPicker />

    <!-- GitHub Portal Link -->
    <div class="github-portal">
      <a
        href="https://github.com/immappyj/light-color-palette"
        target="_blank"
        rel="noopener noreferrer"
        class="portal-link"
      >
        <div class="portal-content">
          <GithubIcon class="github-icon" />
          <span>前往 GitHub 项目</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import ColorPicker from './components/ColorPicker.vue'
import { Github as GithubIcon } from 'lucide-vue-next'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  position: relative;
  min-height: 100vh;
  padding-bottom: 80px;
}

.github-portal {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px 0;
  background: linear-gradient(to right, #24292e, #2b3137);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
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
</style>
