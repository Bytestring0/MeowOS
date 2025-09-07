<template>
  <div
    ref="windowRef"
    class="window"
    :class="{ maximized: window.isMaximized }"
    :style="{
      left: `${window.position.x}px`,
      top: `${window.position.y}px`,
      width: `${window.size.width}px`,
      height: `${window.size.height}px`,
      zIndex: window.zIndex,
    }"
    @mousedown="focus"
  >
    <div class="window-header" @mousedown="startDrag">
      <div class="window-title">
        <img :src="window.icon" :alt="window.title" class="window-icon" />
        <span>{{ window.title }}</span>
      </div>
      <div class="window-controls">
        <button class="control minimize" @click="minimize">─</button>
        <button class="control maximize" @click="maximize">□</button>
        <button class="control close" @click="close">×</button>
      </div>
    </div>
    
    <div class="window-content">
      <component :is="window.component" />
    </div>

    <div class="resize-handle" @mousedown.stop="startResize"></div>
  </div>
</template>

<script lang="ts" src="./Window.ts"></script>

<style scoped>
.window {
  position: absolute;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.window.maximized {
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}

.window-header {
  height: var(--window-header-height);
  background: var(--bg-color-light);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  cursor: move;
  user-select: none;
}

.window-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.window-icon {
  width: 16px;
  height: 16px;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.control {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--text-color);
}

.control:hover {
  background: rgba(0, 0, 0, 0.1);
}

.control.close:hover {
  background: var(--danger-color);
  color: white;
}

.window-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;
}

.resize-handle::after {
  content: '';
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
}
</style>
