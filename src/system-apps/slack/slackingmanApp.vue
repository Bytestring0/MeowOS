<template>
  <div class="moyu">
    <h2>摸鱼文本编辑器</h2>

    <!-- 上传文本文件 -->
    <div class="upload-container">
      <label for="file-upload" class="upload-button">选择文件</label>
      <input id="file-upload" type="file" @change="handleFileUpload" accept=".txt" />
    </div>

    <!-- 文本编辑器 -->
    <textarea
      class="editor"
      ref="editor"
      v-model="currentText"
      @input="onInput"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @blur="onBlur"
      placeholder="请输入..."
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'MoYu',
  data() {
    return {
      fileContent: '', // 存储上传的文本内容
      currentText: '', // 当前输入的文本内容
      inputLength: 0, // 当前输入的字符数
      isComposing: false, // 是否正在输入中文
      timer: null, // 处理延时器
    };
  },
  methods: {
    // 处理上传的文件
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.fileContent = e.target.result;
        };
        reader.readAsText(file);
      }
    },

    // 每次输入时，延迟更新文本内容
    onInput(event) {
      if (this.isComposing) return; // 避免在输入法过程中触发

      const inputLength = this.currentText.length;

      // 计算输入长度对应隐藏的文本内容长度
      const hiddenContent = this.fileContent.substring(0, inputLength);

      // 更新文本框内容，隐藏用户输入，展示隐藏文本
      this.updateEditorContent(hiddenContent);

      // 更新当前输入长度
      this.inputLength = inputLength;

      // 确保光标实时更新
      this.setCursorPosition(inputLength);
    },

    // 输入法开始
    onCompositionStart(event) {
      this.isComposing = true;
    },

    // 输入法结束，更新隐藏文本内容
    onCompositionEnd(event) {
      this.isComposing = false;

      const inputLength = this.currentText.length; // 获取当前输入内容的字符数

      // 计算输入长度对应隐藏的文本内容长度
      const hiddenContent = this.fileContent.substring(0, inputLength);

      // 更新文本框内容，隐藏用户输入，展示隐藏文本
      this.updateEditorContent(hiddenContent);

      // 更新当前输入长度
      this.inputLength = inputLength;

      // 确保光标实时更新
      this.setCursorPosition(inputLength);
    },

    // 更新文本框内容
    updateEditorContent(content) {
      this.currentText = content;
    },

    // 设置光标位置
    setCursorPosition(position) {
      // 确保光标正确显示在输入位置
      this.$nextTick(() => {
        const textarea = this.$refs.editor;
        textarea.setSelectionRange(position, position); // 设置光标位置
      });
    },

    // 失去焦点时清除计时器
    onBlur() {
      if (this.timer) clearTimeout(this.timer);
    }
  }
};
</script>

<style scoped>
.moyu {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.upload-button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #0056b3;
}

input[type="file"] {
  display: none;
}

.editor {
  width: 100%;
  height: 250px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Arial', sans-serif;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  outline: none;
}

.editor:focus {
  border-color: #007BFF;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
}

textarea::placeholder {
  color: #888;
}
</style>
