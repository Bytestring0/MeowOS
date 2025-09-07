import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { storage } from '../../core/api/storage';

export default defineComponent({
  name: 'NotesApp',
  setup() {
    const content = ref('');
    const autoSaveInterval = ref<number>();
    const STORAGE_KEY = 'notes-content';

    // 加载保存的内容
    onMounted(async () => {
      const savedContent = await storage.get(STORAGE_KEY, true);
      if (savedContent) {
        content.value = savedContent;
      }

      // 每30秒自动保存
      autoSaveInterval.value = window.setInterval(async () => {
        await saveContent();
      }, 30000);
    });

    onUnmounted(() => {
      if (autoSaveInterval.value) {
        clearInterval(autoSaveInterval.value);
      }
      saveContent();
    });

    const saveContent = async () => {
      if (content.value) {
        await storage.set(STORAGE_KEY, content.value, true);
      }
    };

    return {
      content,
      saveContent,
    };
  },
});
