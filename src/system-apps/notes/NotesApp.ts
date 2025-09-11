import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { storage } from '../../core/api/storage';

export default defineComponent({
  name: 'NotesApp',
  setup() {
    const content = ref('');
    const autoSaveInterval = ref<number>();
    const APP_ID = 'system-notes';

    onMounted(async () => {
      const savedContent = await storage.getAppSetting(APP_ID, 'content');
      if (savedContent) {
        content.value = savedContent;
      }

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
      await storage.setAppSetting(APP_ID, 'content', content.value);
    };

    return {
      content,
      saveContent,
    };
  },
});
