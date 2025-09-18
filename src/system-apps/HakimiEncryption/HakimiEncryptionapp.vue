<template>
  <div>
    <h1>哈基米加密工具</h1>
    <div>
      <label for="language-mode">语言模式：</label>
      <select v-model="languageMode" id="language-mode">
        <option value="zh">中文</option>
        <option value="en">英文</option>
      </select>
    </div>
    <input v-model="userInput" placeholder="请输入内容" />
    <input v-model="secretKey" placeholder="请输入AES密钥" />
    <button @click="encryptContent">加密</button>
    <button @click="decryptContent">解密</button>
    <button @click="generateRandomText">生成随机文本</button>
    <button @click="clearInput">清除输入</button>
    <button v-if="encryptedContent" @click="copyToClipboard">复制加密文本</button>
    <button v-if="encryptedContent" @click="copyKeyToClipboard">复制密钥</button>
    <div v-if="encryptedContent" class="encrypted-content">
      <h2>加密后的内容</h2>
      <pre>{{ encryptedContent }}</pre>
      <p>使用的密钥: {{ secretKey }}</p>
    </div>
    <div v-if="decryptedContent" class="decrypted-content">
      <h2>解密后的内容</h2>
      <pre>{{ decryptedContent }}</pre>
    </div>
    <div>
      <h2>历史记录</h2>
      <ul>
        <li v-for="(item, index) in history" :key="index">
          <button @click="selectHistoryItem(item)">{{ item }}</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js';

export default {
  data() {
    return {
      userInput: '', // 用户输入的内容
      encryptedContent: '', // 加密后的内容
      decryptedContent: '', // 解密后的内容
      secretKey: 'mySecretKey123456789012', // 128 位密钥
      languageMode: 'zh', // 语言模式
      history: [], // 历史记录
    };
  },
  methods: {
    // 加密方法
    encryptContent() {
      // 使用 AES 加密
      const encrypted = CryptoJS.AES.encrypt(this.userInput, this.secretKey).toString();
      // 将加密后的字符串转换为二进制字符串
      const binaryString = this.toBinaryString(encrypted);
      // 用“哈”和“基”代替“1”和“0”
      this.encryptedContent = binaryString.replace(/1/g, '哈').replace(/0/g, '基');
      this.decryptedContent = ''; // 清空解密内容
      this.saveHistory(this.userInput); // 保存历史记录
    },
    // 解密方法
    decryptContent() {
      // 将“哈”和“基”还原为“1”和“0”
      const binaryString = this.encryptedContent.replace(/哈/g, '1').replace(/基/g, '0');
      // 将二进制字符串转换回加密后的字符串
      const encrypted = this.fromBinaryString(binaryString);
      if (!encrypted) {
        this.decryptedContent = '无效的加密内容';
        return;
      }
      // 使用 AES 解密
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.secretKey).toString(CryptoJS.enc.Utf8);
      this.decryptedContent = decrypted;
      this.encryptedContent = ''; // 清空加密内容
    },
    // 将字符串转换为二进制字符串
    toBinaryString(str) {
      return str.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
      }).join('');
    },
    // 将二进制字符串转换回字符串
    fromBinaryString(binaryStr) {
      if (!binaryStr || binaryStr.length % 8 !== 0) {
        return null; // 返回 null 表示无效的二进制字符串
      }
      const bytes = binaryStr.match(/.{1,8}/g).map(byte => {
        return String.fromCharCode(parseInt(byte, 2));
      });
      return bytes.join('');
    },
    // 生成随机文本
    generateRandomText() {
      const randomText = this.languageMode === 'zh' ? this.generateRandomChineseText() : this.generateRandomEnglishText();
      this.userInput = randomText;
    },
    // 生成随机中文文本
    generateRandomChineseText() {
      const chineseChars = '的是一在有和了不人我到他之为大也上个国我中';
      let result = '';
      for (let i = 0; i < 10; i++) {
        result += chineseChars.charAt(Math.floor(Math.random() * chineseChars.length));
      }
      return result;
    },
    // 生成随机英文文本
    generateRandomEnglishText() {
      const englishChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 10; i++) {
        result += englishChars.charAt(Math.floor(Math.random() * englishChars.length));
      }
      return result;
    },
    // 清除输入
    clearInput() {
      this.userInput = '';
      this.decryptedContent = '';
      this.history = []; // 清空历史记录
    },
    // 保存历史记录
    saveHistory(item) {
      this.history.push(item);
    },
    // 选择历史记录项
    selectHistoryItem(item) {
      this.userInput = item;
    },
    // 复制到剪贴板
    copyToClipboard() {
      if (this.encryptedContent) {
        navigator.clipboard.writeText(this.encryptedContent).then(() => {
          alert('加密文本已复制到剪贴板！');
        }).catch(err => {
          console.error('复制失败:', err);
        });
      }
    },
    // 复制密钥到剪贴板
    copyKeyToClipboard() {
      if (this.secretKey) {
        navigator.clipboard.writeText(this.secretKey).then(() => {
          alert('密钥已复制到剪贴板！');
        }).catch(err => {
          console.error('复制失败:', err);
        });
      }
    }
  }
};
</script>

<style>
.encrypted-content, .decrypted-content {
  margin-top: 20px;
}
pre {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>