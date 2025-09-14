<template>
    <div class="guide-app">
        <div v-if="!fold" class="suspend-input" :style="inputStyle">
            <div class="wantedweb">
                <h3>想访问的网站</h3>
            </div>
            <div class="web-selection">
                <input v-model="urlInput" type="text" placeholder="请输入网址，例如:https://www.baidu.com/" class="url"
                    @keydown.enter="openIframe" />
            </div>
            <button @click="openIframe" class="visit-btn">访问</button>
            <button @click="fold = true" class="fold-btn">收起</button>
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <div v-if="iframeUrl" class="visit">
            <iframe :src="iframeUrl" class="web" frameborder="0"></iframe>
        </div>
        <div v-if="fold" class="suspend" @mousedown="startDrag" @click="handleBallClick"
            :style="{ top: ballPos.top + 'px', left: ballPos.left + 'px' }">
            🌐
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import sweetAlert from "../../config/sweetAlert"

const urlInput = ref("")
const iframeUrl = ref("")
const errorMessage = ref("")
const fold = ref(false)
const domainRegex = /^(https?:\/\/)?([\w\u4e00-\u9fa5-]+\.)+[\w\u4e00-\u9fa5-]{2,}(\/.*)?$/

const ballPos = ref({ top: 20, left: 20 })
let dragging = false
let clickPrevent = false
let offset = { x: 0, y: 0 }

const openIframe = () => {
    if (!urlInput.value) {
        sweetAlert.warning("请输入一个网址", "输入提示")
        return
    }

    if (!domainRegex.test(urlInput.value)) {
        errorMessage.value = "请输入合法的域名，例如:https://www.baidu.com"
        return
    } else {
        errorMessage.value = ""
    }

    // 如果没有 http 前缀，加上
    if (!/^https?:\/\//.test(urlInput.value)) {
        iframeUrl.value = "https://" + urlInput.value
    } else {
        iframeUrl.value = urlInput.value
    }
}

// 输入框样式（跟随球的位置）
const inputStyle = computed(() => {
    const width = 260
    const height = 120
    let top, left

    // 判断上下（球在下半屏 → 输入框在上方，否则在下方）
    if (ballPos.value.top > window.innerHeight / 2) {
        top = ballPos.value.top - height - 10
    } else {
        top = ballPos.value.top + 60
    }

    // 输入框居中到球的水平位置
    left = ballPos.value.left - width / 2 + 28

    // 限制左右边界
    left = Math.max(10, Math.min(window.innerWidth - width - 10, left))

    return {
        top: top + "px",
        left: left + "px"
    }
})

const startDrag = (e: any) => {
    dragging = true
    clickPrevent = false
    offset.x = e.clientX - ballPos.value.left
    offset.y = e.clientY - ballPos.value.top
    document.addEventListener("mousemove", onDrag)
    document.addEventListener("mouseup", stopDrag)
}

const onDrag = (e: any) => {
    if (dragging) {
        ballPos.value.left = Math.max(0, Math.min(window.innerWidth - 56, e.clientX - offset.x))
        ballPos.value.top = Math.max(0, Math.min(window.innerHeight - 56, e.clientY - offset.y))
        clickPrevent = true
    }
}

const stopDrag = () => {
    dragging = false
    document.removeEventListener("mousemove", onDrag)
    document.removeEventListener("mouseup", stopDrag)
}

// 点击悬浮球 → 展开输入栏
const handleBallClick = () => {
    if (!clickPrevent) {
        fold.value = false
    }
}
</script>

<style scoped>
.web {
    width: 100%;
    height: 100vh;
}

.guide-app {
    height: 100%;
    padding: 24px;
    overflow-y: auto;
    background: var(--bg-color);
    scrollbar-width: thin;
    scrollbar-color: var(--border-color) transparent;
}

.visit-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.visit-btn {
    background: var(--accent-color);
    color: white;
}

.visit-btn:hover {
    background: #3a7bc8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.fold-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.fold-btn {
    background: var(--accent-color);
    color: white;
}

.fold-btn:hover {
    background: #3a7bc8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.url {
    width: 300px;
    height: 25px;
    border: none;
    border-radius: 4px;
    box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
    outline: none;
    color: dimgray;
}

.url::before {
    content: '';
    width: 300px;
    background-color: red;
    height: 2px;
}

.url:invalid {
    animation: justshake 0.3s forwards;
    color: red;
}

@keyframes justshake {
    25% {
        transform: translateX(5px);
    }

    50% {
        transform: translateX(-5px);
    }

    75% {
        transform: translateX(5px);
    }

    100% {
        transform: translateX-(5px);
    }
}

.suspend {
    position: fixed;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #007bff;
    /* 蓝色背景 */
    color: white;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    user-select: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
    z-index: 9999;
}

.suspend:active {
    cursor: grabbing;
    transform: scale(0.95);
    /* 拖动时稍微缩小 */
}

.suspend-input {
    position: fixed;
    width: 320px;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 9999;
}
</style>