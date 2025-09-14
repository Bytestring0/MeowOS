<template>
  <div class="battery-component" :class="{ 'charging': isCharging, 'low': isLow }">
    <div class="battery-icon">
      <div class="battery-body">
        <div class="battery-level" :style="{ width: batteryLevel + '%' }"></div>
      </div>
      <div class="battery-tip"></div>
    </div>
    <span class="battery-text">{{ batteryLevel }}%</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import type { SystemComponentState } from '../../core/types/system';

interface Props {
  componentState: SystemComponentState;
}

const props = defineProps<Props>();

const batteryLevel = ref(75);
const isCharging = ref(false);
const isLow = ref(false);

let batteryInterval: number | undefined;

function updateBattery() {
  // 模拟电池状态变化
  if (isCharging.value) {
    batteryLevel.value = Math.min(100, batteryLevel.value + 1);
    if (batteryLevel.value >= 100) {
      isCharging.value = false;
    }
  } else {
    batteryLevel.value = Math.max(0, batteryLevel.value - 0.1);
    if (batteryLevel.value <= 20) {
      isLow.value = true;
    } else {
      isLow.value = false;
    }
    
    // 模拟充电
    if (batteryLevel.value <= 10) {
      isCharging.value = true;
    }
  }
}

onMounted(() => {
  // 每5秒更新一次电池状态
  batteryInterval = setInterval(updateBattery, 5000);
});

onUnmounted(() => {
  if (batteryInterval) {
    clearInterval(batteryInterval);
  }
});
</script>

<style scoped>
.battery-component {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  user-select: none;
}

.battery-component:hover {
  background: rgba(255, 255, 255, 0.15);
}

.battery-icon {
  display: flex;
  align-items: center;
  position: relative;
}

.battery-body {
  width: 20px;
  height: 12px;
  border: 1.5px solid var(--text-color, #333);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.battery-level {
  height: 100%;
  background: #4ade80;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.battery-component.low .battery-level {
  background: #ef4444;
}

.battery-component.charging .battery-level {
  background: #3b82f6;
  animation: charging 1.5s ease-in-out infinite;
}

.battery-tip {
  width: 2px;
  height: 6px;
  background: var(--text-color, #333);
  border-radius: 0 1px 1px 0;
  margin-left: 1px;
}

.battery-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-color, #333);
}

@keyframes charging {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 主题适配 */
[data-theme="dark"] .battery-component {
  background: rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .battery-body {
  border-color: #fff;
}

[data-theme="dark"] .battery-tip {
  background: #fff;
}

[data-theme="dark"] .battery-text {
  color: #fff;
}

[data-theme="glass"] .battery-component {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="custom-blue"] .battery-component {
  background: rgba(74, 144, 226, 0.2);
}

[data-theme="custom-blue"] .battery-text {
  color: #fff;
}
</style>
