import { defineComponent, onMounted, ref, computed } from 'vue';
import type { PropType } from 'vue';
import type { WindowState } from '../../core/types/system';

export default defineComponent({
  name: 'WebApp',
  props: {
    windowState: {
      type: Object as PropType<WindowState>,
      required: true
    }
  },
  setup(props) {
    const iframeRef = ref<HTMLIFrameElement | null>(null);
    const isLoading = ref(true);
    const hasError = ref(false);

    const url = computed(() => {
      return props.windowState?.app?.settings?.url || 'about:blank';
    });

    onMounted(() => {
      if (iframeRef.value) {
        iframeRef.value.onload = () => {
          isLoading.value = false;
        };
        iframeRef.value.onerror = () => {
          isLoading.value = false;
          hasError.value = true;
        };
      }
    });

    function openInNewTab() {
      window.open(url.value, '_blank');
    }

    function retry() {
      hasError.value = false;
      isLoading.value = true;
      if (iframeRef.value) {
        iframeRef.value.src = url.value;
      }
    }

    return {
      iframeRef,
      isLoading,
      hasError,
      url,
      openInNewTab,
      retry
    };
  }
});
