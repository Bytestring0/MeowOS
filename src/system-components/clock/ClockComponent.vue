<template>
  <div class="clock-component" @click="toggleFormat">
    <div class="time-display">
      <div class="time">{{ currentTime }}</div>
      <div class="date" v-if="showDate">{{ currentDate }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import type { SystemComponentState } from '../../core/types/system';

interface Props {
  componentState: SystemComponentState;
}

const props = defineProps<Props>();

const currentTime = ref('');
const currentDate = ref('');
const showDate = ref(true);
const is24HourFormat = ref(true);

let timeInterval: number;

function updateTime() {
  const now = new Date();
  
  // 格式化时间
  if (is24HourFormat.value) {
    currentTime.value = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } else {
    currentTime.value = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
  
  // 格式化日期
  currentDate.value = now.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });
}

function toggleFormat() {
  is24HourFormat.value = !is24HourFormat.value;
  updateTime();
}

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  console.log('ClockComponent mounted with state:', props.componentState);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// 初始化时更新一次
updateTime();
</script>

<style scoped>
.clock-component {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.clock-component:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.time-display {
  text-align: center;
  color: var(--text-color, #333);
}

.time {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  line-height: 1.2;
}

.date {
  font-size: 10px;
  opacity: 0.8;
  margin-top: 1px;
}

/* 主题适配 */
[data-theme="dark"] .clock-component {
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
}

[data-theme="dark"] .clock-component:hover {
  background: rgba(0, 0, 0, 0.3);
}

[data-theme="glass"] .clock-component {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="custom-blue"] .clock-component {
  background: rgba(74, 144, 226, 0.2);
  color: #fff;
}
</style>
