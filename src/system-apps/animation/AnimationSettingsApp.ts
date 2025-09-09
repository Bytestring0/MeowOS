import { defineComponent, ref, onMounted, computed } from 'vue';
import { animationService } from '../../core/services/animationService';
import type { AnimationPreset } from '../../core/services/animationService';

export default defineComponent({
  name: 'AnimationSettingsApp',
  setup() {
    const currentPreset = ref('default');
    const presets = ref<AnimationPreset[]>([]);
    const selectedPreset = ref<AnimationPreset | null>(null);
    const showCustomEditor = ref(false);

    onMounted(() => {
      presets.value = animationService.getPresets();
      currentPreset.value = animationService.getCurrentPreset();
      selectedPreset.value = presets.value.find(p => p.id === currentPreset.value) || null;
    });

    const selectPreset = async (presetId: string) => {
      await animationService.setPreset(presetId);
      currentPreset.value = presetId;
      selectedPreset.value = presets.value.find(p => p.id === presetId) || null;
    };

    const previewAnimation = (type: string) => {
      // 创建一个临时元素来预览动画
      const preview = document.createElement('div');
      preview.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 100px;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transform: translate(-50%, -50%);
      `;
      preview.textContent = '动画预览';
      document.body.appendChild(preview);

      // 根据类型播放不同动画
      let animation: Animation;
      switch (type) {
        case 'open':
          animation = animationService.animateWindowOpen(preview);
          break;
        case 'close':
          animation = animationService.animateWindowClose(preview);
          break;
        case 'maximize':
          animation = animationService.animateWindowMaximize(preview, true);
          break;
        default:
          animation = preview.animate([
            { opacity: 0 },
            { opacity: 1 }
          ], { duration: 300 });
      }

      animation.addEventListener('finish', () => {
        setTimeout(() => {
          document.body.removeChild(preview);
        }, 500);
      });
    };

    const getSpeedText = (duration: number) => {
      if (duration === 0) return '禁用';
      if (duration < 200) return '极快';
      if (duration < 300) return '快速';
      if (duration < 500) return '正常';
      if (duration < 700) return '缓慢';
      return '极慢';
    };

    return {
      currentPreset,
      presets,
      selectedPreset,
      showCustomEditor,
      selectPreset,
      previewAnimation,
      getSpeedText
    };
  }
});
