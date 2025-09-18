/**
 * 用户配置文件 - 用户只需要修改这个文件来自定义主题和系统设置
 * 这些配置会与系统默认配置合并
 */
import type { UserConfig, AnimationPreset } from '../core/types/system';

export const userConfig: UserConfig = {
  // 默认主题设置
  defaultTheme: 'light',
  // 自定义主题 - 用户可以在这里添加自己的主题
  themes: [
    // 自定义蓝色主题
    {
      id: 'custom-blue',
      name: '深蓝主题',
      variables: {
        '--primary-color': '#1e3a8a',
        '--secondary-color': '#3b82f6',
        '--success-color': '#10b981',
        '--warning-color': '#f59e0b',
        '--danger-color': '#ef4444',
        '--info-color': '#6b7280',
        '--accent-color': '#1e3a8a',
        '--accent-color-rgb': '30, 58, 138',

        '--bg-color': '#f8fafc',
        '--bg-color-light': '#f1f5f9',
        '--bg-color-darker': '#e2e8f0',
        '--bg-primary': '#f8fafc',
        '--bg-secondary': '#f1f5f9',
        '--bg-tertiary': '#e2e8f0',

        '--text-color': '#0f172a',
        '--text-color-light': '#334155',
        '--text-color-lighter': '#64748b',
        '--text-primary': '#0f172a',
        '--text-secondary': '#334155',

        '--border-color': '#cbd5e1',
        '--border-color-light': '#e2e8f0',
        '--border-color-lighter': '#f1f5f9',

        '--box-shadow': '0 2px 12px 0 rgba(30, 58, 138, 0.1)',
        '--box-shadow-light': '0 2px 4px rgba(30, 58, 138, .12), 0 0 6px rgba(30, 58, 138, .04)',
        '--box-shadow-dark': '0 2px 4px rgba(30, 58, 138, .12), 0 0 6px rgba(30, 58, 138, .12)',

        '--window-header-height': '32px',
        '--window-min-width': '200px',
        '--window-min-height': '120px',
        '--window-bg-rgb': '248, 250, 252',
        '--window-bg-alpha': '0.92',
        '--window-backdrop-filter': 'none',

        '--taskbar-bg-rgb': '248, 250, 252',
        '--taskbar-bg-alpha': '0.85',
        '--taskbar-backdrop-filter': 'blur(20px) saturate(150%)',

        '--animation-duration': '0.3s',
        '--animation-easing': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
    },

    // Cyberpunk 主题
    {
      id: 'cyberpunk',
      name: 'Cyberpunk 2077',
      variables: {
        '--primary-color': '#00ffff',
        '--secondary-color': '#ff00ff',
        '--success-color': '#00ff00',
        '--warning-color': '#ffff00',
        '--danger-color': '#ff0066',
        '--info-color': '#6666ff',
        '--accent-color': '#00ffff',
        '--accent-color-rgb': '0, 255, 255',

        '--bg-color': '#0a0a0a',
        '--bg-color-light': '#1a1a1a',
        '--bg-color-darker': '#050505',
        '--bg-primary': '#0a0a0a',
        '--bg-secondary': '#1a1a1a',
        '--bg-tertiary': '#050505',

        '--text-color': '#00ffff',
        '--text-color-light': '#00cccc',
        '--text-color-lighter': '#009999',
        '--text-primary': '#00ffff',
        '--text-secondary': '#00cccc',

        '--border-color': '#003333',
        '--border-color-light': '#004444',
        '--border-color-lighter': '#005555',

        '--box-shadow': '0 0 20px rgba(0, 255, 255, 0.3)',
        '--box-shadow-light': '0 0 10px rgba(0, 255, 255, 0.2)',
        '--box-shadow-dark': '0 0 30px rgba(0, 255, 255, 0.4)',

        '--window-header-height': '32px',
        '--window-min-width': '200px',
        '--window-min-height': '120px',
        '--window-bg-rgb': '10, 10, 10',
        '--window-bg-alpha': '0.9',
        '--window-backdrop-filter': 'blur(10px) saturate(200%)',

        '--taskbar-bg-rgb': '10, 10, 10',
        '--taskbar-bg-alpha': '0.9',
        '--taskbar-backdrop-filter': 'blur(10px) saturate(200%)',

        '--animation-duration': '0.2s',
        '--animation-easing': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      effects: {
        windowBlur: true,
        translucency: 0.9,
      },
    },

    // 粉色主题
    {
      id: 'pink',
      name: '樱花粉',
      variables: {
        '--primary-color': '#ff69b4',
        '--secondary-color': '#ffc0cb',
        '--success-color': '#90ee90',
        '--warning-color': '#ffa500',
        '--danger-color': '#ff1493',
        '--info-color': '#dda0dd',
        '--accent-color': '#ff69b4',
        '--accent-color-rgb': '255, 105, 180',

        '--bg-color': '#fff5f8',
        '--bg-color-light': '#ffe4e6',
        '--bg-color-darker': '#ffb6c1',
        '--bg-primary': '#fff5f8',
        '--bg-secondary': '#ffe4e6',
        '--bg-tertiary': '#ffb6c1',

        '--text-color': '#8b0040',
        '--text-color-light': '#cd5c5c',
        '--text-color-lighter': '#dda0dd',
        '--text-primary': '#8b0040',
        '--text-secondary': '#cd5c5c',

        '--border-color': '#ffb6c1',
        '--border-color-light': '#ffc0cb',
        '--border-color-lighter': '#ffe4e6',

        '--box-shadow': '0 2px 12px 0 rgba(255, 105, 180, 0.2)',
        '--box-shadow-light': '0 2px 4px rgba(255, 105, 180, 0.15)',
        '--box-shadow-dark': '0 2px 4px rgba(255, 105, 180, 0.25)',

        '--window-header-height': '32px',
        '--window-min-width': '200px',
        '--window-min-height': '120px',
        '--window-bg-rgb': '255, 245, 248',
        '--window-bg-alpha': '0.92',
        '--window-backdrop-filter': 'none',

        '--taskbar-bg-rgb': '255, 245, 248',
        '--taskbar-bg-alpha': '0.85',
        '--taskbar-backdrop-filter': 'blur(20px) saturate(150%)',

        '--animation-duration': '0.4s',
        '--animation-easing': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  ],

  // 自定义壁纸
  wallpapers: [
    // 用户可以在这里添加自定义壁纸
    {
      id: 'my-wallpaper',
      type: 'url',
      value: 'https://example.com/my-wallpaper.jpg',
      name: '我的壁纸',
    },
  ],
};
export const userAnimationConfig: Partial<AnimationPreset>[] = [
  {
    id: 'bouncy',
    name: '弹性',
    description: '带有弹性效果的动画',
    windowOpen: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
    windowClose: {
      duration: 400,
      easing: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
      enabled: true,
      customAnimation: (element: HTMLElement): Animation => {

        // 获取窗口的初始位置和尺寸
        const rect = element.getBoundingClientRect();

        // 1. 创建一个用于动画的 Canvas
        const animCanvas = document.createElement('canvas');
        const ctx = animCanvas.getContext('2d');

        if (!ctx) {
          console.error('无法获取 Canvas 2D 上下文');
          // 直接隐藏元素作为后备方案
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
          return new Animation();
        }

        // 设置 Canvas 尺寸和初始位置
        animCanvas.width = rect.width;
        animCanvas.height = rect.height;
        animCanvas.style.position = 'fixed';
        animCanvas.style.top = `${rect.top}px`;
        animCanvas.style.left = `${rect.left}px`;
        animCanvas.style.pointerEvents = 'none';
        animCanvas.style.zIndex = '10000'; // 确保在顶层
        document.body.appendChild(animCanvas);

        // 2. 模拟元素外观
        // 创建一个离屏的 Canvas 作为绘制源，避免在动画循环中重复读取和写入同一个 Canvas
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = rect.width;
        sourceCanvas.height = rect.height;
        const sourceCtx = sourceCanvas.getContext('2d')!;

        // 获取背景色
        let backgroundColor = '#f0f0f0'; // 提供一个默认的背景色
        try {
          const computedStyle = window.getComputedStyle(element);
          if (
            computedStyle.backgroundColor &&
            computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)'
          ) {
            backgroundColor = computedStyle.backgroundColor;
          }
        } catch (e) {
          console.warn('无法获取元素背景色，使用默认值。', e);
        }

        // 在源 Canvas 上绘制矩形
        sourceCtx.fillStyle = backgroundColor;
        sourceCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);

        // 3. 隐藏原始元素
        element.style.opacity = '0';
        element.style.pointerEvents = 'none'; // 确保在隐藏后不可交互

        // 动画参数
        const duration = 800; // 动画持续时间 (毫秒)
        const waveFrequency = 25; // 波浪的频率 (数值越大，波浪越宽)
        const waveAmplitude = 15; // 波浪的振幅 (初始扭曲程度)
        let startTime: number | null = null;

        // 目标位置固定为屏幕底部中心
        const targetX = document.documentElement.clientWidth / 2;
        const targetY = document.documentElement.clientHeight;

        // 缓动函数，使动画曲线更自然
        const easeInOutCubic = (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        function animate(currentTime: number) {
          if (!startTime) {
            startTime = currentTime;
          }
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easedProgress = easeInOutCubic(progress);

          // 4a. 更新整个 Canvas 的全局变换 (位置, 缩放, 透明度)
          const currentX = rect.left + (targetX - rect.left) * easedProgress;
          const currentY = rect.top + (targetY - rect.top) * easedProgress;
          const scale = 1 - 0.95 * easedProgress; // 缩小到 5%
          const opacity = 1 - easedProgress;

          animCanvas.style.left = `${currentX}px`;
          animCanvas.style.top = `${currentY}px`;
          animCanvas.style.transform = `scale(${scale})`;
          animCanvas.style.opacity = String(opacity);

          // 4b. 在 Canvas 内部绘制扭曲的图像
          ctx!.clearRect(0, 0, animCanvas.width, animCanvas.height);
          const currentAmplitude = waveAmplitude * (1 - progress); // 振幅随动画减小

          // 逐行切片绘制，实现扭曲效果
          for (let y = 0; y < animCanvas.height; y++) {
            // 使用 sin 函数计算每一行的水平偏移，形成波浪
            const waveOffset = Math.sin(y / waveFrequency + elapsedTime / 100) * currentAmplitude;

            // 图像的每一行也随着动画进度向中心收缩
            const sliceWidth = animCanvas.width * (1 - progress * 0.5); // 收缩效果可以慢一点

            // 从源 Canvas (我们的替身) 绘制一行到目标 Canvas (动画)
            ctx!.drawImage(
              sourceCanvas,
              0,
              y,
              sourceCanvas.width,
              1, // 源: (x, y, width, height) - 取 1px 高的切片
              waveOffset + (animCanvas.width - sliceWidth) / 2,
              y,
              sliceWidth,
              1 // 目标: (x, y, width, height) - 应用偏移和收缩
            );
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // 5. 动画结束，清理 Canvas
            animCanvas.remove();
          }
        }

          // 启动动画
          requestAnimationFrame(animate);

          // 返回一个空的 Animation 对象
          return new Animation();
        }
      },
    windowMinimize: {
      duration: 700,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    windowMaximize: {
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    windowMove: { duration: 200, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
    windowResize: {
      duration: 200,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    desktopIconHover: {
      duration: 400,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    taskbarTransition: {
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
  },
  {
    id: 'custom-smooth',
    name: '自定义动画',
    description: '带有自定义样式的流畅动画',
    windowOpen: {
      duration: 100,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    windowClose: {
      duration: 100,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
      customAnimation: (element: HTMLElement) => {

        // 获取窗口区域
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 创建 Canvas 元素
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed'; // 使用 fixed 定位，覆盖整个视口或指定区域
        canvas.style.top = rect.top + 'px';
        canvas.style.left = rect.left + 'px';
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.pointerEvents = 'none'; // 确保不影响鼠标事件
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error('无法获取 Canvas 2D 上下文');
          canvas.remove();
          element.style.opacity = '0'; // 隐藏原始元素
          return new Animation(); // 返回空动画对象
        }

        // 隐藏原始元素
        element.style.opacity = '0';

        // 尝试获取原始元素的背景色，如果获取不到则使用默认颜色
        let dominantColor = '#444';
        try {
          const computedStyle = window.getComputedStyle(element);
          const bgColor = computedStyle.backgroundColor;
          // 简单判断是否是有效的颜色值
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            dominantColor = bgColor;
          }
        } catch (e) {
          console.warn('无法获取原始元素的背景色，使用默认颜色。', e);
        }

        // 粒子配置
        const particleCount = 300; // 更多粒子
        const particles: Particle[] = [];
        const gravity = 0.05; // 模拟重力
        const initialBurstSpeed = 10; // 更强的初始爆发力
        const fadeOutDuration = 1000; // 粒子拖尾的淡出时间
        const particleBaseColor = dominantColor; // 粒子基色

        interface Particle {
          x: number;
          y: number;
          size: number;
          speedX: number;
          speedY: number;
          alpha: number;
          rotation: number;
          rotationSpeed: number;
          color: string;
          shape: 'circle' | 'square' | 'triangle' | 'star'; // 粒子形状
          life: number; // 粒子生命周期，用于拖尾
          trail: { x: number; y: number; alpha: number; size: number }[]; // 拖尾数据
          trailMaxLen: number;
        }

        // 绘制不同形状的粒子
        function drawParticleShape(ctx: CanvasRenderingContext2D, p: Particle) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();

          switch (p.shape) {
            case 'circle':
              ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
              break;
            case 'square':
              ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
              break;
            case 'triangle':
              ctx.moveTo(0, -p.size / 2);
              ctx.lineTo(p.size / 2, p.size / 2);
              ctx.lineTo(-p.size / 2, p.size / 2);
              ctx.closePath();
              break;
            case 'star':
              const outerRadius = p.size / 2;
              const innerRadius = outerRadius / 2.5;
              const points = 5;
              for (let i = 0; i < points; i++) {
                let outerX = outerRadius * Math.sin((i * Math.PI * 2) / points);
                let outerY = outerRadius * Math.cos((i * Math.PI * 2) / points);
                let innerX = innerRadius * Math.sin(((i + 0.5) * Math.PI * 2) / points);
                let innerY = innerRadius * Math.cos(((i + 0.5) * Math.PI * 2) / points);
                if (i === 0) {
                  ctx.moveTo(outerX, outerY);
                } else {
                  ctx.lineTo(outerX, outerY);
                }
                ctx.lineTo(innerX, innerY);
              }
              ctx.closePath();
              break;
          }
          ctx.fill();
        }

        // 创建粒子
        const shapes: ('circle' | 'square' | 'triangle' | 'star')[] = [
          'circle',
          'square',
          'triangle',
          'star',
        ];
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const initialSpeed = Math.random() * initialBurstSpeed + initialBurstSpeed / 2; // 更大的初始速度范围

          // 颜色随机微调，基于基色
          const baseHSL = hexToHsl(particleBaseColor);
          const hueShift = (Math.random() - 0.5) * 60; // 色相偏移
          const lightnessShift = (Math.random() - 0.5) * 30; // 亮度偏移
          const saturationShift = (Math.random() - 0.5) * 20; // 饱和度偏移

          const particleColorHSL = `hsl(${baseHSL.h + hueShift}, ${Math.min(100, Math.max(0, baseHSL.s + saturationShift))}%, ${Math.min(100, Math.max(0, baseHSL.l + lightnessShift))}%)`;

          particles.push({
            x: centerX - rect.left, // 粒子初始位置在 Canvas 中心，转换为 Canvas 坐标
            y: centerY - rect.top,
            size: Math.random() * 4 + 2, // 粒子大小范围
            speedX: Math.cos(angle) * initialSpeed,
            speedY: Math.sin(angle) * initialSpeed,
            alpha: 1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 20 + 5, // 更快的旋转速度
            color: particleColorHSL,
            shape: shapes[Math.floor(Math.random() * shapes.length)], // 随机形状
            life: 1, // 粒子初始生命值
            trail: [],
            trailMaxLen: Math.floor(Math.random() * 10) + 5, // 随机拖尾长度
          });
        }

        // 动画循环
        let animationFrameId: number;
        const duration = 1500; // 动画持续时间稍微长一点
        let startTime: number | null = null;

        function animateParticles(currentTime: number) {
          if (!startTime) {
            startTime = currentTime;
          }

          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);

          ctx!.clearRect(0, 0, canvas.width, canvas.height); // 清除画布

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // 更新粒子位置和速度
            p.speedY += gravity; // 施加重力
            p.x += p.speedX;
            p.y += p.speedY;

            p.speedX *= 0.98; // 摩擦力效果稍微减弱，让粒子飞得更远
            p.speedY *= 0.98;

            // 粒子整体淡出和缩小
            p.alpha = 1 - progress;
            p.size *= 1 - progress * 0.5; // 粒子缩小得更快

            // 更新旋转
            p.rotation += p.rotationSpeed;

            // 添加拖尾点
            p.trail.push({ x: p.x, y: p.y, alpha: p.alpha, size: p.size });
            if (p.trail.length > p.trailMaxLen) {
              p.trail.shift(); // 移除最老的拖尾点
            }

            // 绘制拖尾
            for (let j = 0; j < p.trail.length; j++) {
              const trailPoint = p.trail[j];
              const trailAlpha = trailPoint.alpha * (j / p.trail.length); // 拖尾越靠后越透明
              const trailSize = trailPoint.size * (j / p.trail.length); // 拖尾越靠后越小

              if (trailAlpha > 0.05 && trailSize > 0.1) {
                ctx!.save();
                ctx!.translate(trailPoint.x, trailPoint.y);
                ctx!.rotate((p.rotation * Math.PI) / 180); // 拖尾也随粒子旋转
                ctx!.fillStyle = p.color;
                ctx!.globalAlpha = trailAlpha * 0.5; // 拖尾比粒子本身更透明
                ctx!.beginPath();
                // 拖尾可以用小一点的圆形
                ctx!.arc(0, 0, trailSize / 3, 0, Math.PI * 2);
                ctx!.fill();
                ctx!.restore();
              }
            }

            // 绘制粒子本体
            if (p.alpha > 0.05 && p.size > 0.1) {
              // 设定最小可见阈值
              ctx!.save();
              ctx!.translate(p.x, p.y);
              ctx!.rotate((p.rotation * Math.PI) / 180);
              drawParticleShape(ctx!, p);
              ctx!.restore();
            }
          }

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateParticles);
          } else {
            canvas.remove(); // 动画结束后移除 Canvas 元素
          }
        }

        // 启动动画
        animationFrameId = requestAnimationFrame(animateParticles);

        // 辅助函数：将十六进制颜色转换为 HSL
        function hexToHsl(hex: string): { h: number; s: number; l: number } {
          let r = 0,
            g = 0,
            b = 0;
          // 3 digits
          if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
          }
          // 6 digits
          else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
          }

          r /= 255;
          g /= 255;
          b /= 255;

          let max = Math.max(r, g, b),
            min = Math.min(r, g, b);
          let h = 0,
            s = 0,
            l = (max + min) / 2;

          if (max === min) {
            h = s = 0; // achromatic
          } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
          }

          return { h: h * 360, s: s * 100, l: l * 100 };
        }

        // 返回一个空的 Animation 对象
        return new Animation();
      },
    },
    wallpaperChange: {
      duration: 1000,
      easing: 'ease-in-out',
      enabled: true,
      customAnimation: (oldEl: HTMLElement, newEl: HTMLElement) => {
        console.log('执行自定义壁纸更换动画');
        // 自定义翻转动画
        const duration = 1000;

        if (oldEl) {
          oldEl.animate(
            [
              {
                transform: 'scale(1) translate3d(0,0,0) rotate3d(0,0,0,0deg)',
                filter: 'blur(0px) contrast(1) saturate(1)',
                opacity: 1,
              },
              {
                transform: 'scale(1.1) translate3d(-20px,10px,-60px) rotate3d(0.2,0.5,0.1,15deg)',
                filter: 'blur(4px) contrast(0.95) saturate(0.9)',
                opacity: 0.85,
              },
              {
                transform: 'scale(1.3) translate3d(80px,-60px,-180px) rotate3d(0.5,0.9,0.3,45deg)',
                filter: 'blur(12px) contrast(0.85) saturate(0.8)',
                opacity: 0.45,
              },
              {
                transform: 'scale(1.5) translate3d(-180px,140px,-400px) rotate3d(1,1,0,90deg)',
                filter: 'blur(24px) contrast(0.7) saturate(0.6) brightness(0.8)',
                opacity: 0,
              },
            ],
            { duration, easing: 'cubic-bezier(0.6,-0.28,0.735,0.045)', fill: 'forwards' }
          );
        }

        if (newEl) {
          newEl.animate(
            [
              {
                transform: 'scale(0.7) translate3d(120px,-80px,400px) rotate3d(0.6,0.8,0.2,-60deg)',
                filter: 'blur(24px) contrast(0.6) saturate(0.5) brightness(0.5)',
                opacity: 0,
              },
              {
                transform: 'scale(0.85) translate3d(30px,-20px,180px) rotate3d(0.3,0.6,0.1,-25deg)',
                filter: 'blur(12px) contrast(0.8) saturate(0.8) brightness(0.8)',
                opacity: 0.45,
              },
              {
                transform: 'scale(0.95) translate3d(10px,5px,60px) rotate3d(0.1,0.2,0,5deg)',
                filter: 'blur(4px) contrast(0.95) saturate(0.95) brightness(1.05)',
                opacity: 0.85,
              },
              {
                transform: 'scale(1) translate3d(0,0,0) rotate3d(0,0,0,0deg)',
                filter: 'blur(0px) contrast(1) saturate(1) brightness(1)',
                opacity: 1,
              },
            ],
            { duration, easing: 'cubic-bezier(0.25,1,0.5,1)', fill: 'forwards' }
          );
        }

        return new Animation();
      },
    },
  },
];
