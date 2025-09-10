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
.app { width:100vw; height:100vh; position:relative; }
</style>
