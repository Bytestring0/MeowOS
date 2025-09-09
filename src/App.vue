<script setup lang="ts">
import Desktop from '@/core/desktop/Desktop.vue';
import Window from '@/core/desktop/Window.vue';
import { system } from '@/core/api/system';
import { computed, onMounted } from 'vue';

const windows = computed(() => system.getWindows().filter(w => !w.isHidden));

onMounted(() => {
  // 初始化应用主题
  system.applyTheme(system.theme);
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
