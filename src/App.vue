<script setup lang="ts">
import Desktop from '@/core/desktop/Desktop.vue';
import Window from '@/core/desktop/Window.vue';
import { system } from '@/core/api/system';
import { computed, onMounted } from 'vue';

const windows = computed(() => system.getWindows().filter(w => !w.isHidden));

onMounted(async () => {
  // 初始化应用主题
  system.applyTheme(system.theme);
  // 尝试加载用户配置（如果存在）
  try {
    const { userConfig } = await import('@/config/user-config');
    console.info('已加载用户配置', userConfig);
    system.setUserConfig(userConfig);
    system.themes;
  } catch (error) {
    // 用户配置文件不存在，使用默认配置
    console.info('使用默认系统配置');
  }
});

</script>

<template>
  <div class="app" :data-theme="system.theme">
    <Desktop />
    <Window v-for="w in windows" :key="w.id" :window="w" />
  </div>
</template>

<style>
:root { @import '@/assets/styles/theme.css'; }
.app { 
  width:100vw; 
  height:100vh; 
  position:relative; 
  user-select: none; /* 禁用用户选择 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 全局禁用文本选择蓝色高亮 */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

*::selection {
  background: transparent;
}

*::-moz-selection {
  background: transparent;
}

/* 允许在输入框中选择文本 */
input, textarea, [contenteditable="true"] {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

input::selection, textarea::selection, [contenteditable="true"]::selection {
  background: var(--primary-color, #4a90e2);
  color: white;
}
</style>
