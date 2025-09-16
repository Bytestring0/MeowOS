<template>
  <div class="app-container">
    <!-- 卡片页面 -->
    <div v-if="!selectedSite" class="card-container">
      <div
        v-for="site in sites"
        :key="site.url"
        class="card"
        @click="openSite(site)"
      >
        <img :src="site.icon" alt="icon" class="card-icon-full" />

        <!-- 悬浮信息 -->
        <div class="card-info">
          <div class="card-img">
            <!-- IMG 装饰 -->
            <img src="./hajimi.png" alt="装饰">
          </div>

          <h3 class="card-title">{{ site.name }}</h3>
          <div class="card-url">{{ site.url }}</div>
          <div class="card-category">{{ site.category }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const selectedSite = ref(null);

const sites = ref([
  {
    name: "海拥游戏大全",
    url: "https://peergame.cn/",
    icon: "icons/haiyong.svg",
    category: "摸鱼"
  },
  {
    name: "CET",
    url: "https://www.qian-qian.xyz/cet/#/",
    icon: "icons/CET.png",
    category: "最！高！六！级！分！数！"
  },
  {
    name: "猫国建设者",
    url: "http://jsd1.2bps.cn/",
    icon: "icons/NotoCatFace.svg",
    category: "喵~"
  }
]);

function openSite(site) {
  window.open(site.url, "_blank");
}

function closeSite() {
  selectedSite.value = null;
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
}

/* 横向排列容器 */
.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  margin-top: 20px;
  padding: 10px;
}

/* 卡片 */
.card {
  position: relative;
  width: 28%;
  min-width: 260px;
  max-width: 380px;
  aspect-ratio: 16/9;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.3);
}

/* 图标全覆盖 */
.card-icon-full {
  width: 60%;           /* 占卡片宽度的 60%，可调 */
  height: auto;         /* 高度自适应 */
  object-fit: contain;  /* 保持图标比例，不裁切 */
  margin: auto;         /* 居中 */
  display: block;
  transition: transform 0.5s ease;
}

.card:hover .card-icon-full {
  transform: translateX(-65%);
}

/* hover 信息层 */
.card-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.15);
  transition: transform 0.5s ease;
  transform: translateX(100%);
}

.card:hover .card-info {
  transform: translateX(0);
}

/* 左上角装饰图片 */
.card-img {
  position: absolute;
  top: 12px;
  left: 12px;
}

.card-img img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}


/* 网站名称 */
.card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
}

/* 右上角网址 */
.card-url {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.4);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右下角分类 */
.card-category {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.4);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
}

/* iframe 页面 */
.iframe-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.site-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 返回按钮 */
.back-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  background: rgba(0,0,0,0.8);
}
*{
  overflow: scroll;
  -ms-overflow-style: none;
}
*::-webkit-scrollbar{
  display: none;
}
</style>
