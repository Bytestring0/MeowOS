<template>
  <div class="taskbar" :class="position" :style="taskbarStyle">
    <div class="taskbar-left">
      <div class="logo" @click="openLauncher">MeowOS</div>
    </div>
    <div class="taskbar-center">
      <!-- 中央系统组件 -->
      <div 
        v-for="component in centerSystemComponents"
        :key="component.id"
        class="taskbar-system-component"
        :style="{
          order: component.manifest.systemComponent?.position.order || 0
        }"
      >
        <component 
          :is="systemComponentRegistry[component.manifest.entry]" 
          :component-state="component"
        />
      </div>
    </div>
    <div class="taskbar-windows">
      <div v-for="item in items" :key="item.windowId" class="taskbar-item" :class="{active:item.isActive, minimized:item.isMinimized}" @click="toggle(item.windowId)" @dblclick="restore(item.windowId)">
        <img :src="item.icon" :alt="item.title" />
        <span class="title">{{ item.title }}</span>
      </div>
    </div>
    <div class="taskbar-right">
      <!-- 右侧系统组件 -->
      <div 
        v-for="component in rightSystemComponents"
        :key="component.id"
        class="taskbar-system-component"
        :style="{
          order: component.manifest.systemComponent?.position.order || 0
        }"
      >
        <component 
          :is="systemComponentRegistry[component.manifest.entry]" 
          :component-state="component"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, shallowRef } from 'vue';
import { system } from '../api/system';

const config = system.config;
const items = computed(()=> system.getTaskbarItems());
const position = computed(()=> config.taskbar.position);
const taskbarStyle = computed(()=> ({ height: config.taskbar.height + 'px' }));

// 系统组件注册表
const systemComponentRegistry = shallowRef<Record<string, any>>({});

// 获取任务栏系统组件，按placement分组
const centerSystemComponents = computed(() => 
  system.getSystemComponents().filter(c => 
    c.manifest.systemComponent?.position.type === 'taskbar' &&
    c.manifest.systemComponent?.position.placement === 'center'
  )
);

const rightSystemComponents = computed(() => 
  system.getSystemComponents().filter(c => 
    c.manifest.systemComponent?.position.type === 'taskbar' &&
    (c.manifest.systemComponent?.position.placement === 'right' || 
     !c.manifest.systemComponent?.position.placement) // 默认为right
  )
);

// 获取任务栏系统组件（保持向后兼容）
const taskbarSystemComponents = computed(() => 
  system.getSystemComponents().filter(c => 
    c.manifest.systemComponent?.position.type === 'taskbar'
  )
);

// 加载系统组件模块
async function loadSystemComponentModules() {
  const modules = import.meta.glob('../../system-components/*/*.vue', { eager: true });
  
  for (const path in modules) {
    const mod: any = modules[path];
    const component = mod.default || mod;
    
    // 从路径提取组件名
    const pathParts = path.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const componentName = fileName.replace('.vue', '');
    
    systemComponentRegistry.value[componentName] = component;
  }
  
  console.log('Loaded taskbar system components:', Object.keys(systemComponentRegistry.value));
}

function toggle(id:string){ system.toggleMinimize(id); }
function restore(id:string){ system.focusWindow(id); }
function openApp(id:string){ system.openApp(id); }
function openLauncher(){
  console.log("logo clicked");
}

onMounted(() => {
  loadSystemComponentModules();
});
</script>
<style scoped>
.taskbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  backdrop-filter: var(--taskbar-backdrop-filter, blur(20px) saturate(150%));
  background: rgba(var(--taskbar-bg-rgb, 255, 255, 255), var(--taskbar-bg-alpha, 0.85));
  border: 1px solid var(--border-color);
  padding: 0 12px;
  gap: 16px;
  border-top: 1px solid var(--border-color-light);
  z-index: 9999;
  font-size: 13px;
  color: var(--text-primary);
  box-shadow: var(--box-shadow);
  transition: all var(--animation-duration) ease;
}

.taskbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.taskbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.taskbar-windows {
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  justify-content: flex-start;
}

.taskbar-windows::-webkit-scrollbar {
  display: none;
}

.taskbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.taskbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  cursor: pointer;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  min-width: 100px;
  max-width: 180px;
  backdrop-filter: inherit;
  transition: all var(--animation-duration) ease;
  user-select: none;
  color: var(--text-primary);
}

.taskbar-item img {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.taskbar-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.taskbar-item.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  box-shadow: var(--box-shadow-focus);
}

.taskbar-item.minimized {
  opacity: 0.65;
  background: var(--bg-tertiary);
}

.taskbar-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.taskbar-item.active:hover {
  background: var(--accent-color);
  opacity: 0.9;
}

.logo {
  font-weight: 700;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary, #667eea));
  opacity: 0.8;
  color: white;
  cursor: pointer;
  font-size: 14px;
  box-shadow: var(--box-shadow);
  transition: all var(--animation-duration) ease;
}

.logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

/* 任务栏系统组件样式 */
.taskbar-system-component {
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .taskbar {
    padding: 0 8px;
    gap: 8px;
  }
  
  .taskbar-item {
    min-width: 80px;
    max-width: 120px;
    padding: 4px 8px;
  }
  
  .brand {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
