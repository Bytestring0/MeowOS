<template>
  <div class="card-container">
    <div
      v-for="(site, index) in sites"
      :key="index"
      class="card"
    >
      <!-- 图标覆盖整个卡片 -->
      <img :src="site.icon" alt="icon" class="card-icon-full" />

      <!-- hover 信息 -->
      <div class="card-info">
        <!-- 左上角 SVG 装饰 -->
        <div class="card-svg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#ff6f61"/>
          </svg>
        </div>

        <!-- 网站名称 -->
        <h3 class="card-title">{{ site.name }}</h3>

        <!-- 右上角网址 -->
        <div class="card-url">{{ site.url }}</div>

        <!-- 右下角分类 -->
        <div class="card-category">{{ site.category }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const sites = [
  {
    name: "Google",
    url: "https://www.google.com",
    category: "搜索",
    icon: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png"
  },
  {
    name: "Bing",
    url: "https://www.bing.com",
    category: "搜索",
    icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Bing_logo.svg"
  },
  {
    name: "GitHub",
    url: "https://www.github.com",
    category: "开发",
    icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
  }
];
</script>

<style scoped>
/* 卡片容器：横向排列 */
.card-container {
  display: flex;
  flex-wrap: wrap;           /* 宽度不足时换行 */
  justify-content: flex-start; /* 从左开始排列 */
  gap: 20px;                 /* 卡片间距 */
  margin-top: 20px;
  padding: 10px;
}

/* 卡片样式 */
.card {
  position: relative;
  width: 28%;                /* 横向宽度自适应 */
  min-width: 260px;
  max-width: 380px;
  aspect-ratio: 16/9;        /* 横板比例 */
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

/* 图标覆盖整个卡片 */
.card-icon-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  box-sizing: border-box;
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

/* 左上角 SVG */
.card-svg {
  position: absolute;
  top: 12px;
  left: 12px;
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

</style>
