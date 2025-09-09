<template>
  <div class="paint-app">
    <div class="paint-toolbar">
      <div class="tool-group">
        <label>工具:</label>
        <button
          v-for="tool in tools"
          :key="tool.id"
          class="tool-btn"
          :class="{ active: currentTool === tool.id }"
          @click="selectTool(tool.id)"
          :title="tool.name"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
        </button>
      </div>

      <div class="tool-group">
        <label>画笔大小:</label>
        <input
          type="range"
          v-model="brushSize"
          min="1"
          max="50"
          class="size-slider"
        />
        <span class="size-value">{{ brushSize }}px</span>
      </div>

      <div class="tool-group">
        <label>颜色:</label>
        <div class="color-palette">
          <div
            v-for="color in colorPalette"
            :key="color"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            :class="{ active: currentColor === color }"
            @click="selectColor(color)"
          ></div>
        </div>
        <input
          type="color"
          v-model="currentColor"
          class="color-picker"
          title="自定义颜色"
        />
      </div>

      <div class="tool-group">
        <button @click="clearCanvas" class="action-btn" title="清空画布">
          🗑️ 清空
        </button>
        <button @click="saveImage" class="action-btn" title="保存图片">
          💾 保存
        </button>
        <button @click="undo" class="action-btn" title="撤销" :disabled="!canUndo">
          ↶ 撤销
        </button>
        <button @click="redo" class="action-btn" title="重做" :disabled="!canRedo">
          ↷ 重做
        </button>
      </div>
    </div>

    <div class="paint-canvas-container" ref="canvasContainer">
      <canvas
        ref="canvas"
        class="paint-canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @contextmenu.prevent
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const tools = [
  { id: 'brush', name: '画笔', icon: '🖌️' },
  { id: 'eraser', name: '橡皮擦', icon: '🧽' },
  { id: 'line', name: '直线', icon: '📏' },
  { id: 'rectangle', name: '矩形', icon: '▭' },
  { id: 'circle', name: '圆形', icon: '○' }
];

const colorPalette = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#008000', '#ffc0cb', '#a52a2a', '#808080', '#000080'
];

const canvas = ref<HTMLCanvasElement>();
const canvasContainer = ref<HTMLDivElement>();
const currentTool = ref('brush');
const currentColor = ref('#000000');
const brushSize = ref(5);

const isDrawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);
const startX = ref(0);
const startY = ref(0);

// 历史记录
const history = ref<ImageData[]>([]);
const historyIndex = ref(-1);
const canUndo = ref(false);
const canRedo = ref(false);

let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
});

function initCanvas() {
  if (!canvas.value || !canvasContainer.value) return;
  
  ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  resizeCanvas();
  
  // 设置默认样式
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  
  // 保存初始状态
  saveToHistory();
}

function resizeCanvas() {
  if (!canvas.value || !canvasContainer.value) return;
  
  const container = canvasContainer.value;
  const rect = container.getBoundingClientRect();
  
  canvas.value.width = rect.width - 20; // 减去padding
  canvas.value.height = rect.height - 20;
  
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  }
}

function selectTool(toolId: string) {
  currentTool.value = toolId;
}

function selectColor(color: string) {
  currentColor.value = color;
}

function getMousePos(e: MouseEvent) {
  if (!canvas.value) return { x: 0, y: 0 };
  
  const rect = canvas.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function startDrawing(e: MouseEvent) {
  if (!ctx) return;
  
  isDrawing.value = true;
  const pos = getMousePos(e);
  lastX.value = pos.x;
  lastY.value = pos.y;
  startX.value = pos.x;
  startY.value = pos.y;

  if (currentTool.value === 'brush' || currentTool.value === 'eraser') {
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }
}

function draw(e: MouseEvent) {
  if (!isDrawing.value || !ctx) return;
  
  const pos = getMousePos(e);
  
  ctx.lineWidth = brushSize.value;
  
  if (currentTool.value === 'brush') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor.value;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  } else if (currentTool.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }
  
  lastX.value = pos.x;
  lastY.value = pos.y;
}

function stopDrawing(e: MouseEvent) {
  if (!isDrawing.value || !ctx) return;
  
  isDrawing.value = false;
  const pos = getMousePos(e);
  
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = currentColor.value;
  ctx.lineWidth = brushSize.value;
  
  if (currentTool.value === 'line') {
    ctx.beginPath();
    ctx.moveTo(startX.value, startY.value);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  } else if (currentTool.value === 'rectangle') {
    const width = pos.x - startX.value;
    const height = pos.y - startY.value;
    ctx.strokeRect(startX.value, startY.value, width, height);
  } else if (currentTool.value === 'circle') {
    const radius = Math.sqrt(
      Math.pow(pos.x - startX.value, 2) + Math.pow(pos.y - startY.value, 2)
    );
    ctx.beginPath();
    ctx.arc(startX.value, startY.value, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  saveToHistory();
}

function saveToHistory() {
  if (!ctx || !canvas.value) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
  
  // 删除当前位置之后的历史记录
  history.value = history.value.slice(0, historyIndex.value + 1);
  
  // 添加新的历史记录
  history.value.push(imageData);
  historyIndex.value++;
  
  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value.shift();
    historyIndex.value--;
  }
  
  updateHistoryState();
}

function updateHistoryState() {
  canUndo.value = historyIndex.value > 0;
  canRedo.value = historyIndex.value < history.value.length - 1;
}

function undo() {
  if (!canUndo.value || !ctx) return;
  
  historyIndex.value--;
  const imageData = history.value[historyIndex.value];
  ctx.putImageData(imageData, 0, 0);
  
  updateHistoryState();
}

function redo() {
  if (!canRedo.value || !ctx) return;
  
  historyIndex.value++;
  const imageData = history.value[historyIndex.value];
  ctx.putImageData(imageData, 0, 0);
  
  updateHistoryState();
}

function clearCanvas() {
  if (!ctx || !canvas.value) return;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  saveToHistory();
}

function saveImage() {
  if (!canvas.value) return;
  
  const link = document.createElement('a');
  link.download = `paint-${Date.now()}.png`;
  link.href = canvas.value.toDataURL();
  link.click();
}
</script>

<style scoped>
.paint-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color);
}

.paint-toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px;
  background: var(--bg-color-light);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  font-size: 13px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-group label {
  color: var(--text-color);
  font-weight: 500;
  white-space: nowrap;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  border-color: var(--primary-color);
}

.tool-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.tool-icon {
  font-size: 16px;
}

.size-slider {
  width: 80px;
  accent-color: var(--primary-color);
}

.size-value {
  color: var(--text-color-light);
  font-size: 12px;
  min-width: 35px;
}

.color-palette {
  display: flex;
  gap: 4px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.color-swatch:hover {
  border-color: var(--text-color-lighter);
}

.color-swatch.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.color-picker {
  width: 32px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn {
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: opacity 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paint-canvas-container {
  flex: 1;
  padding: 10px;
  overflow: hidden;
}

.paint-canvas {
  display: block;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: crosshair;
  background: white;
  width: 100%;
  height: 100%;
}

.paint-canvas:active {
  cursor: none;
}
</style>
