<template>
  <div class="desktop no-select" :style="desktopStyle" @contextmenu="handleDesktopContextMenu" @click="clearSelection">
    <div class="desktop-grid" :style="gridStyle">
      <div v-for="app in visibleApps" :key="app.id" class="desktop-icon" @dblclick="openApp(app.id)"
        @contextmenu.stop="handleAppContextMenu($event, app)">
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
import { computed, onMounted, ref } from 'vue';
import { system } from '../api/system';
import { showContextMenu, contextMenuAPI } from '../api/contextmenu';
import type { AppManifest } from '../types/system';
import Taskbar from './Taskbar.vue';
import ContextMenu from './ContextMenu.vue';
import { eventBus, SystemEvents } from '../api/event';
import { animationService } from '../api/animationService';

const apps = computed(() => system.listApps());
const gridSize = ref({ columns: 10, rows: 1 });
const visibleApps = computed(() => apps.value.filter(a =>
  (a.showOnDesktop !== false) &&
  !a.isSystemComponent
));
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

onMounted(() => {
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
  })
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
}

.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
