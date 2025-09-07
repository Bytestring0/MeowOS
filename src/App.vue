<script setup lang="ts">
import Desktop from '@/core/desktop/Desktop.vue';
import Terminal from '@/components/Terminal.vue';
import Window from '@/core/desktop/Window.vue';
import { ref } from 'vue';
import { system } from '@/core/api/system';

// 控制终端显示
const showTerminal = ref(false);

// 切换终端显示
const toggleTerminal = (e: KeyboardEvent) => {
  if (e.key === '`' && e.ctrlKey) {
    showTerminal.value = !showTerminal.value;
  }
};

// 监听快捷键
window.addEventListener('keydown', toggleTerminal);
</script>

<template>
  <div class="app">
    <!-- 桌面 -->
    <Desktop />
    
    <!-- 窗口 -->
    <Window v-for="window in system.getWindows()" 
           :key="window.id" 
           :window="window" />
    
    <!-- 终端 (Ctrl + ` 切换) -->
    <div v-if="showTerminal" class="terminal-container">
      <Terminal />
    </div>
  </div>
</template>

<style>
:root {
  /* 导入主题变量 */
  @import '@/assets/styles/theme.css';
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.terminal-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background-color: var(--bg-color-darker);
  border-top: 1px solid var(--border-color);
  z-index: 9999;
}
</style>
