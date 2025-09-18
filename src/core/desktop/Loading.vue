<template>
  <div class="meow-os-loader" :class="{ 'fade-out': isFinishing }">
    <div class="background-orb"></div>
    <div class="glass-panel">
      <div class="logo-container">
        <svg class="logo-svg" viewBox="0 0 100 100">
          <path class="logo-path" d="M 10 90 L 30 30 L 50 70 L 70 30 L 90 90" />
        </svg>
        <h1 class="logo-text">
          <span>{{ typedText }}</span>
          <span class="cursor">_</span>
        </h1>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  data() {
    return {
      isFinishing: false,
      fullText: 'MeowOS',
      typedText: '',
      typingInterval: null,
    };
  },
  methods: {
    startTyping() {
      let charIndex = 0;
      this.typingInterval = setInterval(() => {
        if (charIndex < this.fullText.length) {
          this.typedText += this.fullText.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(this.typingInterval);
        }
      }, 100); // 打字速度
    },
  },
  mounted() {
    setTimeout(this.startTyping, 1000);

    setTimeout(() => {
      this.isFinishing = true;
      setTimeout(() => {
        this.$emit('finished');
      }, 300);
    }, 3500);
  },
  beforeUnmount() {
    clearInterval(this.typingInterval);
  },
};
</script>

<style scoped>
.meow-os-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #121212;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'SF Mono', 'Consolas', 'Menlo', monospace;
  z-index: 9999;
  transition: opacity 0.5s ease-in-out;
  overflow: hidden; /* 隐藏光晕的溢出部分 */
}

.meow-os-loader.fade-out {
  opacity: 0;
}

/* 动态背景光晕 */
.background-orb {
  position: absolute;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(97, 10, 153, 0.4) 0%, rgba(97, 10, 153, 0) 70%);
  border-radius: 50%;
  animation: move-orb 20s infinite alternate ease-in-out;
}

/* 毛玻璃效果面板 */
.glass-panel {
  padding: 40px 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  text-align: center;
}

.logo-svg {
  width: 100px;
  height: 100px;
  stroke: #ffffff;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.logo-path {
  stroke-dasharray: 250;
  stroke-dashoffset: 250;
  animation: draw-logo 2s ease-in-out forwards;
}

.logo-text {
  color: #ffffff;
  font-size: 2.5rem;
  margin-top: 10px;
  letter-spacing: 4px;
  height: 50px; /* 固定高度防止抖动 */
  display: flex;
  align-items: center;
}

/* 打字光标 */
.cursor {
  display: inline-block;
  color: #fff;
  animation: blink-cursor 0.7s infinite;
}

.progress-bar-container {
  width: 250px;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  margin-top: 30px;
  overflow: hidden;
}

.progress-bar {
  width: 0;
  height: 100%;
  background-color: #ffffff;
  border-radius: 2px;
  animation: load-progress 3s ease-in-out forwards 1s; /* 延迟 1.5s 开始 */
}

/* 动画定义 */
@keyframes draw-logo {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes load-progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes move-orb {
  from {
    transform: translate(-20%, -20%) scale(0.8);
  }
  to {
    transform: translate(20%, 20%) scale(1.2);
  }
}
</style>