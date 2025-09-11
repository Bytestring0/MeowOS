<template>
  <div 
    class="desktop" 
    :style="desktopStyle"
  >
    <div class="desktop-grid" :style="gridStyle">
      <div
        v-for="app in visibleApps"
        :key="app.id"
        class="desktop-icon"
        @dblclick="openApp(app.id)"
      >
        <img :src="app.icon" :alt="app.name" />
        <span class="app-name">{{ app.name }}</span>
      </div>
    </div>
    <Taskbar />
  </div>
</template>

<script lang="ts" setup>
import { computed , ref } from 'vue';
import { system } from '../api/system';
import { showContextMenu } from '../api/contextmenu';
import type { AppManifest } from '../types/system';
import Taskbar from './Taskbar.vue';

const apps = computed(() => system.listApps());
const gridSize = ref({ columns: 10, rows: 1 });
const visibleApps = computed(() => apps.value.filter(a => 

  (a.showOnDesktop !== false) && 
  !a.isSystemComponent
));

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

</script>

<style scoped>
.desktop { position: fixed; inset:0; overflow:hidden; }
.desktop-grid { position:relative; }
.desktop-icon { 
  width:100px; 
  text-align:center; 
  padding:8px; 
  border-radius:8px; 
  backdrop-filter: var(--desktop-icon-blur, blur(6px)); 
  background:rgba(179, 174, 174, 0.05); 
  color:var(--text-color); 
  cursor:pointer; 
  transition: all var(--icon-hover-duration, 200ms) var(--icon-hover-easing, ease-out);
  transform-origin: center;
}
.desktop-icon:hover { 
  background:rgba(255,255,255,0.15); 
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.desktop-icon img { 
  width:48px; 
  height:48px; 
  object-fit:contain; 
  margin-bottom:6px;
  transition: all var(--icon-hover-duration, 200ms) var(--icon-hover-easing, ease-out);
}
.desktop-icon:hover img {
  transform: scale(1.1);
}
.app-name { 
  font-size:12px; 
  white-space:nowrap; 
  overflow:hidden; 
  text-overflow:ellipsis; 
  display:block; 
}
</style>
