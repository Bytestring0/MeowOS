<template>
  <div>
    
  </div>
  <Transition 
    name="window"
    appear
    @enter="onWindowEnter"
    @leave="onWindowLeave"
  >
    <div
      v-show="!window.isHidden && !window.isMinimized"
      ref="windowRef"
      class="window"
      :class="{ 
        maximized: window.isMaximized,
        'window-animating': isAnimating,
        pinned: window.isPinned
      }"
      :style="{
        left: window.isMaximized ? '0px' : `${window.position.x}px`,
        top: window.isMaximized ? '0px' : `${window.position.y}px`,
        width: window.isMaximized ? '100vw' : `${window.size.width}px`,
        height: window.isMaximized ? 'calc(100vh - 50px)' : `${window.size.height}px`,
        zIndex: window.zIndex,
        backdropFilter: 'var(--window-backdrop-filter, none)',
        background: `rgba(var(--window-bg-rgb, 255, 255, 255), var(--window-bg-alpha, 0.92))`,
        boxShadow: 'var(--box-shadow)',
        transition: isAnimating ? `all var(--window-maximize-duration, 300ms) var(--window-maximize-easing, ease-out)` : 'none'
      }"
      @mousedown="focus"
    >
    <div class="window-header" @mousedown="startDrag">
      <div class="window-title">
        <img :src="window.icon" :alt="window.title" class="window-icon" />
        <span>{{ window.title }}</span>
      </div>
      <div class="window-controls">
        <button class="control pin" :class="{ active: window.isPinned }" @click="togglePin" title="置顶">📌</button>
        <button class="control minimize" @click="minimize">─</button>
        <button class="control maximize" @click="maximize">□</button>
        <button class="control close" @click="close">×</button>
      </div>
    </div>
    
    <div class="window-content">
      <component 
        :is="appRegistry[window.component]" 
        :window-state="window"
      />
    </div>

    <!-- 调整大小手柄 -->
    <div class="resize-handle-se" @mousedown.stop="(e) => startResize(e, 'se')"></div>
    <div class="resize-handle-s" @mousedown.stop="(e) => startResize(e, 's')"></div>
    <div class="resize-handle-e" @mousedown.stop="(e) => startResize(e, 'e')"></div>
    <div class="resize-handle-n" @mousedown.stop="(e) => startResize(e, 'n')"></div>
    <div class="resize-handle-w" @mousedown.stop="(e) => startResize(e, 'w')"></div>
    <div class="resize-handle-ne" @mousedown.stop="(e) => startResize(e, 'ne')"></div>
    <div class="resize-handle-nw" @mousedown.stop="(e) => startResize(e, 'nw')"></div>
    <div class="resize-handle-sw" @mousedown.stop="(e) => startResize(e, 'sw')"></div>
    </div>
  </Transition>
</template>

<script lang="ts" src="./Window.ts"></script>

<style scoped>
.window {
  position: absolute;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.window.maximized {
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}

.window.pinned {
  border: 2px solid rgba(255, 165, 0, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 165, 0, 0.2);
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

.control.pin {
  font-size: 14px;
}

.control.pin:hover {
  background: rgba(255, 165, 0, 0.2);
}

.control.pin.active {
  background: rgba(255, 165, 0, 0.3);
  color: #ff8c00;
}

.window-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* 调整大小手柄 */
.resize-handle-se {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;
}

.resize-handle-s {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 4px;
  cursor: s-resize;
}

.resize-handle-e {
  position: absolute;
  right: 0;
  top: 16px;
  bottom: 16px;
  width: 4px;
  cursor: e-resize;
}

.resize-handle-n {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 0;
  height: 4px;
  cursor: n-resize;
}

.resize-handle-w {
  position: absolute;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 4px;
  cursor: w-resize;
}

.resize-handle-ne {
  position: absolute;
  right: 0;
  top: 0;
  width: 16px;
  height: 16px;
  cursor: ne-resize;
}

.resize-handle-nw {
  position: absolute;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  cursor: nw-resize;
}

.resize-handle-sw {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: sw-resize;
}

.resize-handle-se::after {
  content: '';
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
}

/* 窗口动画 */
.window-enter-active {
  animation: window-open var(--window-open-duration, 300ms) var(--window-open-easing, ease-out);
}

.window-leave-active {
  animation: window-close var(--window-close-duration, 250ms) var(--window-close-easing, ease-in);
}

@keyframes window-open {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0px);
    filter: blur(0px);
  }
}

@keyframes window-close {
  from {
    opacity: 1;
    transform: scale(1) translateY(0px);
    filter: blur(0px);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
    filter: blur(2px);
  }
}

.window-animating {
  transition: all var(--window-maximize-duration, 350ms) var(--window-maximize-easing, ease-out);
}
</style>
