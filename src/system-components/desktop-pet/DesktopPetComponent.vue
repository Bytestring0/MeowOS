<template>
  <div 
    class="desktop-pet" 
    :class="{ 'moving': isMoving, 'sleeping': isSleeping }"
    @click="interact"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <div class="pet-body">
      <div class="pet-face">
        <div class="eyes">
          <div class="eye left" :class="{ 'closed': isSleeping }"></div>
          <div class="eye right" :class="{ 'closed': isSleeping }"></div>
        </div>
        <div class="mouth" :class="{ 'happy': isHappy, 'sleeping': isSleeping }"></div>
      </div>
      <div class="pet-ears">
        <div class="ear left"></div>
        <div class="ear right"></div>
      </div>
    </div>
    
    <!-- 状态指示 -->
    <div class="status-indicator" v-if="statusText">
      <div class="status-bubble">{{ statusText }}</div>
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

const isMoving = ref(false);
const isSleeping = ref(false);
const isHappy = ref(false);
const statusText = ref('');

let idleTimer: number | undefined;
let statusTimer: number | undefined;
let animationTimer: number | undefined;

// 宠物行为状态
const behaviors = [
  { name: 'idle', duration: 5000 },
  { name: 'sleep', duration: 10000 },
  { name: 'happy', duration: 3000 },
  { name: 'move', duration: 2000 }
];

let currentBehaviorIndex = 0;

function resetPetState() {
  isMoving.value = false;
  isSleeping.value = false;
  isHappy.value = false;
  statusText.value = '';
}

function setBehavior(behavior: string) {
  resetPetState();
  
  switch (behavior) {
    case 'sleep':
      isSleeping.value = true;
      statusText.value = '😴';
      break;
    case 'happy':
      isHappy.value = true;
      statusText.value = '😸';
      break;
    case 'move':
      isMoving.value = true;
      statusText.value = '🐾';
      // 随机移动（在父组件中实现拖拽）
      randomMove();
      break;
    default:
      statusText.value = '';
  }
  
  // 清除状态文本
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusText.value = '';
  }, 2000);
}

function randomMove() {
  if (!props.componentState.manifest.systemComponent?.display?.draggable) return;
  
  const maxX = window.innerWidth - props.componentState.size.width;
  const maxY = window.innerHeight - props.componentState.size.height - 80; // 考虑taskbar
  
  const newX = Math.random() * maxX;
  const newY = Math.random() * maxY;
  
  // 触发位置更新事件
  const newPosition = { x: newX, y: newY };
  props.componentState.position = newPosition;
  
  // 这里可以添加平滑移动动画
}

function startBehaviorCycle() {
  const behavior = behaviors[currentBehaviorIndex];
  setBehavior(behavior.name);
  
  if (animationTimer) clearTimeout(animationTimer);
  animationTimer = setTimeout(() => {
    currentBehaviorIndex = (currentBehaviorIndex + 1) % behaviors.length;
    startBehaviorCycle();
  }, behavior.duration);
}

function interact() {
  // 用户点击交互
  setBehavior('happy');
  
  // 重置行为循环
  if (animationTimer) clearTimeout(animationTimer);
  setTimeout(() => {
    startBehaviorCycle();
  }, 3000);
}

function onHover() {
  if (!isSleeping.value) {
    isHappy.value = true;
  }
}

function onLeave() {
  if (!isSleeping.value) {
    isHappy.value = false;
  }
}

onMounted(() => {
  // 延迟启动行为循环，避免初始化时立即触发
  setTimeout(() => {
    startBehaviorCycle();
  }, 2000);
});

onUnmounted(() => {
  if (idleTimer) clearTimeout(idleTimer);
  if (statusTimer) clearTimeout(statusTimer);
  if (animationTimer) clearTimeout(animationTimer);
});
</script>

<style scoped>
.desktop-pet {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
  transform-origin: center bottom;
}

.desktop-pet:hover {
  transform: scale(1.1);
}

.desktop-pet.moving {
  animation: bounce 0.5s ease-in-out infinite alternate;
}

.pet-body {
  position: relative;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  border-radius: 50%;
  margin: 10px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.pet-ears {
  position: absolute;
  top: -8px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
}

.ear {
  width: 16px;
  height: 20px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border-radius: 50% 50% 0 0;
  transform: rotate(-20deg);
  transition: transform 0.3s ease;
}

.ear.right {
  transform: rotate(20deg);
}

.desktop-pet:hover .ear {
  transform: rotate(-30deg);
}

.desktop-pet:hover .ear.right {
  transform: rotate(30deg);
}

.pet-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 30px;
}

.eyes {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.eye {
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.eye.closed {
  height: 2px;
  border-radius: 0;
  background: #666;
}

.mouth {
  width: 12px;
  height: 6px;
  border: 2px solid #333;
  border-top: none;
  border-radius: 0 0 12px 12px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.mouth.happy {
  border-radius: 0 0 20px 20px;
  width: 16px;
  height: 8px;
}

.mouth.sleeping {
  width: 8px;
  height: 3px;
  border-radius: 50%;
  border: 1px solid #666;
}

.status-indicator {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.status-bubble {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes bounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-10px) scale(1.05); }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.desktop-pet.sleeping .pet-body {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 主题适配 */
[data-theme="dark"] .pet-body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .ear {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

[data-theme="glass"] .pet-body {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="custom-blue"] .pet-body {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
}
</style>
