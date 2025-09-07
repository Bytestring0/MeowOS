<template>
  <div class="desktop" :style="{ backgroundImage: `url(${wallpaper})` }">
    <div class="desktop-grid" :style="gridStyle">
      <div
        v-for="app in apps"
        :key="app.id"
        class="desktop-icon"
        @click="openApp(app.id)"
        @dblclick="openApp(app.id)"
      >
        <img :src="app.icon" :alt="app.name" />
        <span class="app-name">{{ app.name }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./Desktop.ts"></script>

<style scoped>
.desktop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.desktop-grid {
  width: 100%;
  height: 100%;
  position: relative;
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.desktop-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.desktop-icon img {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.app-name {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-size: 14px;
  text-align: center;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
