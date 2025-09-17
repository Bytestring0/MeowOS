# SystemAudio API 使用指南

## 简单音频播放 API

SystemAudio 现在提供了简单易用的音频播放 API，支持播放任意音频文件。

### 基本用法

```typescript
import { systemAudio } from '@/core/api/systemAudio';

// 播放音频文件
const soundId = await systemAudio.playSound('一花一世界.mp3');

// 停止所有音频
systemAudio.stopSound();

// 停止指定音频
systemAudio.stopSound(soundId);
```

### API 详细说明

#### `playSound(filePath, options)` - 播放音频

播放指定的音频文件，返回音频ID用于后续控制。

**参数：**
- `filePath` (string): 音频文件路径
  - 相对路径：会自动添加 `/audio/` 前缀
  - 绝对路径：直接使用提供的路径
- `options` (object): 播放选项

**选项参数：**
```typescript
{
  loop?: boolean;          // 是否循环播放，默认 false
  duration?: number;       // 播放时长（秒），undefined 表示播放完整音频
  volume?: number;         // 音量 0-100，默认使用系统音量
  fade?: boolean;          // 是否淡入淡出效果，默认 false
  onEnd?: () => void;      // 播放结束回调
}
```

**返回值：**
- `Promise<string>`: 音频ID，用于后续控制

#### `stopSound(soundId?)` - 停止音频

停止指定音频或所有音频的播放。

**参数：**
- `soundId` (string, 可选): 音频ID，不提供则停止所有音频

#### 其他控制方法

```typescript
// 暂停指定音频
systemAudio.pauseSound(soundId);

// 恢复播放指定音频
systemAudio.resumeSound(soundId);

// 设置指定音频的音量
systemAudio.setSoundVolume(soundId, 75);

// 获取当前播放的音频列表
const activeSounds = systemAudio.getActiveSounds();

// 检查指定音频是否正在播放
const isPlaying = systemAudio.isSoundPlaying(soundId);
```

### 使用示例

#### 1. 基本播放

```typescript
// 播放背景音乐，循环播放
const bgMusicId = await systemAudio.playSound('background.mp3', {
  loop: true,
  volume: 30
});

// 播放点击音效
const clickSoundId = await systemAudio.playSound('click.wav', {
  volume: 80
});
```

#### 2. 定时播放

```typescript
// 播放音乐10秒钟
const musicId = await systemAudio.playSound('一花一世界.mp3', {
  duration: 10,
  fade: true, // 淡入淡出效果
  onEnd: () => {
    console.log('音乐播放结束');
  }
});
```

#### 3. 游戏音效

```typescript
class GameSounds {
  private bgMusicId: string | null = null;
  
  async playBackgroundMusic() {
    this.bgMusicId = await systemAudio.playSound('game_bg.mp3', {
      loop: true,
      volume: 25,
      fade: true
    });
  }
  
  async playClickSound() {
    await systemAudio.playSound('click.wav', {
      volume: 50
    });
  }
  
  async playWinSound() {
    await systemAudio.playSound('victory.mp3', {
      volume: 80,
      fade: true
    });
  }
  
  stopBackgroundMusic() {
    if (this.bgMusicId) {
      systemAudio.stopSound(this.bgMusicId);
      this.bgMusicId = null;
    }
  }
  
  stopAllSounds() {
    systemAudio.stopSound(); // 停止所有音频
  }
}
```

#### 4. 音频管理器

```typescript
class AudioManager {
  private sounds: Map<string, string> = new Map();
  
  async preloadSounds(soundList: { name: string, path: string }[]) {
    for (const sound of soundList) {
      try {
        const soundId = await systemAudio.playSound(sound.path, {
          volume: 0 // 静音预加载
        });
        systemAudio.pauseSound(soundId);
        this.sounds.set(sound.name, soundId);
      } catch (error) {
        console.error(`Failed to preload sound: ${sound.name}`);
      }
    }
  }
  
  playSound(name: string, volume: number = 100) {
    const soundId = this.sounds.get(name);
    if (soundId) {
      systemAudio.setSoundVolume(soundId, volume);
      systemAudio.resumeSound(soundId);
    }
  }
  
  stopAll() {
    systemAudio.stopSound();
    this.sounds.clear();
  }
}
```

### 文件路径说明

音频文件应放置在项目的 `public/audio/` 目录下：

```
public/
  audio/
    一花一世界.mp3
    background.mp3
    click.wav
    victory.mp3
    sfx/
      explosion.wav
      pickup.wav
```

### 错误处理

```typescript
try {
  const soundId = await systemAudio.playSound('nonexistent.mp3');
} catch (error) {
  console.error('播放音频失败:', error.message);
}
```

### 注意事项

1. **浏览器限制**: 现代浏览器需要用户交互后才能播放音频
2. **文件格式**: 支持浏览器原生支持的音频格式（MP3, WAV, OGG 等）
3. **性能考虑**: 避免同时播放过多音频，会影响性能
4. **音量控制**: 音频音量会受到系统主音量的影响
5. **内存管理**: API 会自动清理播放完成的音频元素

### 完整示例

```typescript
// 在应用中使用
export class MeowOSApp {
  private audioManager = new AudioManager();
  
  async init() {
    // 预加载音效
    await this.audioManager.preloadSounds([
      { name: 'click', path: 'click.wav' },
      { name: 'notification', path: 'notification.mp3' },
      { name: 'background', path: '一花一世界.mp3' }
    ]);
    
    // 播放背景音乐
    const bgMusic = await systemAudio.playSound('一花一世界.mp3', {
      loop: true,
      volume: 20,
      fade: true
    });
  }
  
  onButtonClick() {
    // 播放点击音效
    this.audioManager.playSound('click', 60);
  }
  
  onNotification() {
    // 播放通知音效
    this.audioManager.playSound('notification', 80);
  }
  
  onDestroy() {
    // 清理所有音频
    this.audioManager.stopAll();
  }
}
```
