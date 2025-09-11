<template>
  <Teleport to="body">
    <Transition name="context-menu" appear>
      <div
        v-if="visible"
        ref="menuRef"
        class="context-menu"
        :style="{
          left: position.x + 'px',
          top: position.y + 'px'
        }"
        @contextmenu.prevent
      >
        <template v-for="(item, index) in items" :key="index">
          <div
            v-if="item.type === 'separator'"
            class="context-menu-separator"
          ></div>
          <div
            v-else
            class="context-menu-item"
            :class="{
              disabled: item.disabled,
              danger: item.danger,
              'has-submenu': item.submenu && item.submenu.length > 0
            }"
            @click="handleItemClick(item)"
          >
            <span v-if="item.icon" class="context-menu-icon">{{ item.icon }}</span>
            <span class="context-menu-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="context-menu-shortcut">{{ item.shortcut }}</span>
            <span v-if="item.submenu" class="context-menu-arrow">▶</span>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script src="./ContextMenu.ts"></script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 200px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  padding: 4px 0;
  backdrop-filter: blur(20px);
  user-select: none;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.context-menu-item:hover:not(.disabled) {
  background: var(--bg-color-light);
}

.context-menu-item.disabled {
  color: var(--text-color-lighter);
  cursor: not-allowed;
  opacity: 0.5;
}

.context-menu-item.danger {
  color: var(--danger-color);
}

.context-menu-item.danger:hover:not(.disabled) {
  background: rgba(var(--danger-color-rgb, 245, 108, 108), 0.1);
}

.context-menu-icon {
  margin-right: 8px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu-label {
  flex: 1;
}

.context-menu-shortcut {
  font-size: 12px;
  color: var(--text-color-lighter);
  margin-left: 16px;
}

.context-menu-arrow {
  margin-left: 8px;
  font-size: 10px;
  color: var(--text-color-lighter);
}

.context-menu-separator {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

/* 动画效果 */
.context-menu-enter-active,
.context-menu-leave-active {
  transition: all 0.15s ease-out;
}

.context-menu-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
