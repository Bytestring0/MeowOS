<template>
    <div class="guide-app">
        <div class="wantedweb">
            <h3>想访问的网站</h3>
        </div>
        <div class="web-selection">
            <input v-model="urlInput" type="text" placeholder="请输入网址，例如:https://www.baidu.com/" class="url" />
        </div>
        <button @click="openIframe" class="visit-btn">访问</button>
        <p v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</p>
        <div v-if="iframeUrl" class="visit">
            <iframe :src="iframeUrl" class="web" frameborder="0"></iframe>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const urlInput = ref("")
const iframeUrl = ref("")
const errorMessage = ref("")
const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/

const openIframe = () => {
    if (!urlInput.value) {
        alert("请输入一个网址")
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
</script>

<style scoped>
.web {
    width: 100vh;
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

.url {
    width: 300px;
    height:25px;
    border: none;
    border-radius: 4px;
    box-shadow: 2px 2px 7px 0 rgb(0, 0, 0, 0.2);
    outline: none;
    color: dimgray;
}
.url::before{
    content:'';
    width:300px;
    background-color: red;
    height:2px;
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
</style>