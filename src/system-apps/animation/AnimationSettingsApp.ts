import { defineComponent, ref, onMounted, computed } from 'vue';
import { animationService } from '../../core/api/animationService';
import type { AnimationPreset } from '../../core/types/system';

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
      getSpeedText
    };
  }
});
