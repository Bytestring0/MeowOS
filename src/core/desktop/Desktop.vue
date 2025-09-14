<template>
  <div class="desktop no-select" :style="desktopStyle" @contextmenu="handleDesktopContextMenu" @click="clearSelection">
    <div class="desktop-grid" :style="gridStyle" @dragover.prevent @drop.prevent>
      <div 
        v-for="(app, index) in sortedVisibleApps" 
        :key="app.id" 
        class="desktop-icon" 
        :class="{ 'dragging': dragState.draggedAppId === app.id, 'drag-over': dragState.dragOverIndex === index }"
        @dblclick="openApp(app.id)"
        @contextmenu.stop="handleAppContextMenu($event, app)"
        @mousedown="startDrag($event, app, index)"
        @dragover.prevent="handleDragOver($event, index)"
        @drop="handleDrop($event, index)"
        :draggable="true"
        @dragstart="handleDragStart($event, app, index)"
        @dragend="handleDragEnd"
        @dragenter.prevent
        @dragleave="handleDragLeave($event, index)"
      >
        <img :src="app.icon" :alt="app.name" />
        <span class="app-name">{{ app.name }}</span>
      </div>
    </div>
    <Taskbar />
    <ContextMenu />
  </div>
  <div class="wallpaper-animation" :style="desktopStyle2">
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, reactive } from 'vue';
import { system } from '../api/system';
import { showContextMenu, contextMenuAPI } from '../api/contextmenu';
import type { AppManifest } from '../types/system';
import Taskbar from './Taskbar.vue';
import ContextMenu from './ContextMenu.vue';
import { eventBus, SystemEvents } from '../api/event';
import { animationService } from '../api/animationService';

const apps = computed(() => system.listApps());
const gridSize = ref({ columns: 10, rows: 1 });

// 拖拽状态
const dragState = reactive({
  draggedAppId: null as string | null,
  draggedAppIndex: -1,
  dragOverIndex: -1,
  isDragging: false,
});

// 按位置排序的可见应用
const sortedVisibleApps = computed(() => {
  const visibleApps = apps.value.filter(a =>
    (a.showOnDesktop !== false) &&
    !a.isSystemComponent
  );

  // 按照gridIndex排序，如果没有gridIndex则按原来的顺序
  return visibleApps.sort((a, b) => {
    const aIndex = a.desktopPosition?.gridIndex ?? 999;
    const bIndex = b.desktopPosition?.gridIndex ?? 999;
    return aIndex - bIndex;
  });
});

const desktopStyle2 = ref();
const desktopStyle = computed(() => {
  const wp = system.wallpaper;
  if (wp.startsWith('linear-gradient') || wp.startsWith('#')) {
    return { background: wp };
  }
  return { backgroundImage: `url(${wp})`, backgroundSize: 'cover', backgroundPosition: 'center' };
});

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(100px, 1fr))`,
  gridAutoRows: '100px',
  gap: '20px',
  padding: '20px',
  width: '100%',
  height: '100%',
  alignContent: 'flex-start'
}));

function openApp(id: string) {
  system.openApp(id);
}

// 拖拽相关方法
function startDrag(event: MouseEvent, app: AppManifest, index: number) {
  // 这里可以添加鼠标拖拽的逻辑，但我们主要使用HTML5拖拽API
}

function handleDragStart(event: DragEvent, app: AppManifest, index: number) {
  dragState.draggedAppId = app.id;
  dragState.draggedAppIndex = index;
  dragState.isDragging = true;
  
  // 发布拖拽开始事件
  eventBus.emit(SystemEvents.IconDragStart, {
    appId: app.id,
    appName: app.name,
    index: index,
    position: app.desktopPosition
  });
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', app.id);
    
    // 创建自定义拖拽图像
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-image';
    dragImage.innerHTML = `
      <img src="${app.icon}" alt="${app.name}" style="width: 48px; height: 48px;">
      <span style="display: block; font-size: 12px; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${app.name}</span>
    `;
    dragImage.style.cssText = `
      position: absolute; 
      top: -1000px; 
      background: rgba(0,0,0,0.7); 
      padding: 8px; 
      border-radius: 8px; 
      text-align: center;
      opacity: 0.9;
    `;
    document.body.appendChild(dragImage);
    
    event.dataTransfer.setDragImage(dragImage, 50, 50);
    
    // 清理拖拽图像
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }
}

function handleDragOver(event: DragEvent, index: number) {
  if (dragState.isDragging) {
    dragState.dragOverIndex = index;
  }
}

function handleDragLeave(event: DragEvent, index: number) {
  // 只有当真正离开元素时才清除dragOverIndex
  if (dragState.dragOverIndex === index) {
    setTimeout(() => {
      if (dragState.dragOverIndex === index) {
        dragState.dragOverIndex = -1;
      }
    }, 50);
  }
}

function handleDrop(event: DragEvent, dropIndex: number) {
  event.preventDefault();
  
  const draggedAppId = event.dataTransfer?.getData('text/plain');
  if (!draggedAppId || draggedAppId === sortedVisibleApps.value[dropIndex]?.id) {
    return;
  }

  const draggedIndex = dragState.draggedAppIndex;
  if (draggedIndex === dropIndex || draggedIndex === -1) {
    return;
  }

  // 重新排列应用顺序
  reorderApps(draggedIndex, dropIndex);
}

function handleDragEnd() {
  const draggedApp = sortedVisibleApps.value.find(app => app.id === dragState.draggedAppId);
  
  // 发布拖拽结束事件
  eventBus.emit(SystemEvents.IconDragEnd, {
    appId: dragState.draggedAppId,
    appName: draggedApp?.name,
    finalIndex: dragState.draggedAppIndex,
    finalPosition: draggedApp?.desktopPosition
  });
  
  dragState.draggedAppId = null;
  dragState.draggedAppIndex = -1;
  dragState.dragOverIndex = -1;
  dragState.isDragging = false;
}

// 重新排列应用
function reorderApps(fromIndex: number, toIndex: number) {
  const apps = [...sortedVisibleApps.value]; // 创建副本避免直接修改响应式数据
  const updates: Array<{ appId: string; position: { x: number; y: number; gridIndex?: number } }> = [];
  
  // 重新计算所有应用的gridIndex
  apps.forEach((app, index) => {
    let newIndex: number;
    
    if (index === fromIndex) {
      // 被拖拽的应用移动到目标位置
      newIndex = toIndex;
    } else if (fromIndex < toIndex) {
      // 向后拖拽：从fromIndex到toIndex之间的应用向前移动
      if (index > fromIndex && index <= toIndex) {
        newIndex = index - 1;
      } else {
        newIndex = index;
      }
    } else {
      // 向前拖拽：从toIndex到fromIndex之间的应用向后移动
      if (index >= toIndex && index < fromIndex) {
        newIndex = index + 1;
      } else {
        newIndex = index;
      }
    }
    
    // 收集需要更新的位置信息
    updates.push({
      appId: app.id,
      position: {
        x: app.desktopPosition?.x ?? 0,
        y: app.desktopPosition?.y ?? 0,
        gridIndex: newIndex
      }
    });
  });

  // 批量更新应用位置
  system.updateMultipleAppPositions(updates);
  
  console.log(`已将应用从位置 ${fromIndex} 移动到位置 ${toIndex}`);
}

onMounted(() => {
  // 壁纸变更事件
  eventBus.on(SystemEvents.WallpaperChanged, (oldVal: string, newVal: string) => {
    // 设置旧壁纸到动画容器
    if (oldVal.startsWith('linear-gradient') || oldVal.startsWith('#')) {
      desktopStyle2.value = {
        background: oldVal,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else {
      desktopStyle2.value = {
        backgroundImage: `url(${oldVal})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    // 获取元素引用
    const oldEl = document.querySelector('.wallpaper-animation') as HTMLElement  // 显示旧壁纸
    const newEl = document.querySelector('.desktop') as HTMLElement              // 显示新壁纸
    
    if (oldEl && newEl) {
      console.log('触发壁纸更换动画', oldVal, newVal);
      
      const duration = animationService.animateWallpaperChange(oldEl, newEl);
      
    }
  });

  // 桌面图标相关事件监听
  eventBus.on(SystemEvents.IconDragStart, (data) => {
    console.log('图标拖拽开始:', data);
  });

  eventBus.on(SystemEvents.IconDragEnd, (data) => {
    console.log('图标拖拽结束:', data);
  });

  eventBus.on(SystemEvents.IconPositionChanged, (data) => {
    console.log('图标位置变更:', data);
  });

  eventBus.on(SystemEvents.IconOrderChanged, (data) => {
    console.log('图标顺序变更:', data);
  });

  eventBus.on(SystemEvents.DesktopLayoutSaved, (data) => {
    console.log('桌面布局已保存:', data);
  });

  eventBus.on(SystemEvents.DesktopLayoutLoaded, (data) => {
    console.log('桌面布局已加载:', data);
  });
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  // 清理所有桌面相关的事件监听器
  eventBus.clear(SystemEvents.IconDragStart);
  eventBus.clear(SystemEvents.IconDragEnd);
  eventBus.clear(SystemEvents.IconPositionChanged);
  eventBus.clear(SystemEvents.IconOrderChanged);
  eventBus.clear(SystemEvents.DesktopLayoutSaved);
  eventBus.clear(SystemEvents.DesktopLayoutLoaded);
})

// 桌面右键菜单
function handleDesktopContextMenu(event: MouseEvent) {
  event.preventDefault();

  const menuItems = contextMenuAPI.createDesktopContextMenu({
    onRefresh: () => {
      // 刷新桌面
      console.log('刷新桌面');
    },
    onPersonalize: () => {
      // 打开个性化设置
      system.openApp('system-theme');
    },
    onDisplaySettings: () => {
      // 打开显示设置
      system.openApp('system-wallpaper');
    },
    onSystemInfo: () => {
      // 打开系统信息
      console.log('系统信息');
    }
  });

  showContextMenu({
    x: event.clientX,
    y: event.clientY,
    items: menuItems
  });
}

// 应用右键菜单
function handleAppContextMenu(event: MouseEvent, app: AppManifest) {
  event.preventDefault();

  showContextMenu({
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: '打开',
        icon: '🚀',
        action: () => openApp(app.id)
      },
      { type: 'separator' },
      {
        label: '属性',
        icon: '⚙️',
        action: () => {
          console.log('应用属性:', app);
        }
      }
    ]
  });
}

// 清除选择
function clearSelection() {
  // 取消所有选中状态，这里可以扩展
  console.log('清除选择');
}

</script>

<style scoped>
.desktop {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 1; /* 确保桌面内容在壁纸上方 */
}

.wallpaper-animation {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.desktop-grid {
  position: relative;
  z-index: 10; /* 确保桌面图标在最上方 */
}

.desktop-icon {
  width: 100px;
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  backdrop-filter: var(--desktop-icon-blur, blur(6px));
  background: rgba(179, 174, 174, 0.01);
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--icon-hover-duration, 200ms) var(--icon-hover-easing, ease-out);
  transform-origin: center;
  position: relative;
}

.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.desktop-icon.dragging {
  opacity: 0.5;
  transform: scale(1.1);
  z-index: 1000;
}

.desktop-icon.drag-over {
  background: rgba(255, 255, 255, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.desktop-icon.drag-over::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid rgba(74, 144, 226, 0.8);
  border-radius: 10px;
  background: rgba(74, 144, 226, 0.1);
  pointer-events: none;
}

.desktop-icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 6px;
  transition: all var(--icon-hover-duration, 200ms) var(--icon-hover-easing, ease-out);
}

.desktop-icon:hover img {
  transform: scale(1.1);
}

.app-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
</style>
