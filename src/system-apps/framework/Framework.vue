<template>

<iframe :src="iframeSrc" frameborder="0"></iframe>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const iframeSrc = ref('https://peergame.cn/')
</script>

<style scoped>
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>