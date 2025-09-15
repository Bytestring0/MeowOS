import { defineComponent, ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { documentSystem } from '../../core/api/documents';
import { storage } from '../../core/api/storage';
import type { DocumentItem } from '../../core/api/documents';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
// @ts-ignore - 没有类型声明的插件
import markdownItFootnote from 'markdown-it-footnote';
// @ts-ignore
import markdownItMark from 'markdown-it-mark';
// @ts-ignore
import markdownItSub from 'markdown-it-sub';
// @ts-ignore
import markdownItSup from 'markdown-it-sup';
// @ts-ignore
import markdownItTaskLists from 'markdown-it-task-lists';
import markdownItTocDoneRight from 'markdown-it-toc-done-right';
import hljs from 'highlight.js';

export default defineComponent({
  name: 'TextReaderApp',
  setup() {
    const content = ref('');
    const htmlContent = ref('');
    const documentPath = ref('');
    const documentName = ref('');
    const loading = ref(false);
    const error = ref('');
    const fontSize = ref(16);
    const lineHeight = ref(1.6);
    const showToc = ref(true);
    const tocItems = ref<Array<{ level: number; title: string; anchor: string }>>([]);
    const readingProgress = ref(0);
    const estimatedReadTime = ref(0);
    
    // Markdown渲染器配置
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return '';
      }
    })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink(),
      permalinkBefore: true,
      permalinkSymbol: '#'
    });

    // 尝试加载其他插件，如果失败就跳过
    try {
      md.use(markdownItFootnote);
    } catch (e) {
      console.warn('Failed to load footnote plugin:', e);
    }

    try {
      md.use(markdownItMark);
    } catch (e) {
      console.warn('Failed to load mark plugin:', e);
    }

    try {
      md.use(markdownItSub);
    } catch (e) {
      console.warn('Failed to load sub plugin:', e);
    }

    try {
      md.use(markdownItSup);
    } catch (e) {
      console.warn('Failed to load sup plugin:', e);
    }

    try {
      md.use(markdownItTaskLists, { enabled: true });
    } catch (e) {
      console.warn('Failed to load task lists plugin:', e);
    }

    try {
      md.use(markdownItTocDoneRight, {
        containerClass: 'toc',
        listType: 'ul',
        level: [1, 2, 3, 4]
      });
    } catch (e) {
      console.warn('Failed to load toc plugin:', e);
    }

    // 计算属性
    const readerStyle = computed(() => ({
      fontSize: fontSize.value + 'px',
      lineHeight: lineHeight.value,
    }));

    const progressBarStyle = computed(() => ({
      width: readingProgress.value + '%'
    }));

    // 估算阅读时间（基于平均阅读速度 250字/分钟）
    const calculateReadTime = (text: string): number => {
      const wordCount = text.length;
      const wordsPerMinute = 250;
      return Math.ceil(wordCount / wordsPerMinute);
    };

    // 提取目录结构
    const extractToc = (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      tocItems.value = Array.from(headings).map(heading => ({
        level: parseInt(heading.tagName.substring(1)),
        title: heading.textContent || '',
        anchor: heading.id || ''
      }));
    };

    // 滚动到锚点
    const scrollToAnchor = (anchor: string) => {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // 更新阅读进度
    const updateReadingProgress = () => {
      const contentEl = document.querySelector('.content-body');
      if (contentEl) {
        const scrollTop = contentEl.scrollTop;
        const scrollHeight = contentEl.scrollHeight - contentEl.clientHeight;
        readingProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      }
    };

    // 渲染Markdown内容
    const renderMarkdown = async (markdown: string) => {
      try {
        const rendered = md.render(markdown);
        htmlContent.value = rendered;
        extractToc(rendered);
        estimatedReadTime.value = calculateReadTime(markdown);
        
        // 确保DOM更新后再应用语法高亮
        await nextTick();
        
        // 手动应用语法高亮到新渲染的代码块
        const codeBlocks = document.querySelectorAll('.content-body pre code');
        codeBlocks.forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      } catch (err) {
        console.error('Markdown rendering error:', err);
        error.value = '渲染Markdown时出错: ' + (err as Error).message;
      }
    };

    // 加载文档内容
    const loadDocument = async (path: string) => {
      if (!path) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        const markdown = await documentSystem.getDocumentContent(path);
        content.value = markdown;
        await renderMarkdown(markdown);
        
        // 保存阅读历史
        await storage.setAppSetting('system-text-reader', 'lastRead', {
          path,
          name: documentName.value,
          timestamp: Date.now()
        });
      } catch (err) {
        console.error('Failed to load document:', err);
        error.value = '加载文档失败: ' + (err as Error).message;
      } finally {
        loading.value = false;
      }
    };

    // 监听文档打开事件（向后兼容）
    const handleDocumentOpen = (event: CustomEvent) => {
      const { documentPath: path, documentName: name } = event.detail;
      console.log('Received document open event:', { path, name });
      documentPath.value = path;
      documentName.value = name;
      loadDocument(path);
    };

    // 监听文档更新事件
    const handleDocumentUpdate = async (event: CustomEvent) => {
      const { documentPath: path, documentName: name } = event.detail;
      console.log('Received document update event:', { path, name });
      
      // 检查localStorage中的待处理文档
      const pendingDocumentStr = localStorage.getItem('textReader_pendingDocument');
      if (pendingDocumentStr) {
        try {
          const pendingDocument = JSON.parse(pendingDocumentStr);
          if (Date.now() - pendingDocument.timestamp < 5000) {
            documentPath.value = pendingDocument.path;
            documentName.value = pendingDocument.name;
            await loadDocument(pendingDocument.path);
            console.log('Updated to new document:', pendingDocument);
          }
          localStorage.removeItem('textReader_pendingDocument');
        } catch (error) {
          console.error('Failed to parse pending document for update:', error);
          localStorage.removeItem('textReader_pendingDocument');
        }
      }
    };

    // 调整字体大小
    const adjustFontSize = (delta: number) => {
      fontSize.value = Math.max(12, Math.min(24, fontSize.value + delta));
      storage.setAppSetting('system-text-reader', 'fontSize', fontSize.value);
    };

    // 调整行高
    const adjustLineHeight = (delta: number) => {
      lineHeight.value = Math.max(1.2, Math.min(2.0, lineHeight.value + delta));
      storage.setAppSetting('system-text-reader', 'lineHeight', lineHeight.value);
    };

    // 切换目录显示
    const toggleToc = () => {
      showToc.value = !showToc.value;
      storage.setAppSetting('system-text-reader', 'showToc', showToc.value);
    };

    // 导出为PDF（模拟功能）
    const exportToPdf = () => {
      // 这里可以集成PDF导出功能
      alert('PDF导出功能正在开发中...');
    };

    // 打印文档
    const printDocument = () => {
      window.print();
    };

    // 复制内容
    const copyContent = async () => {
      try {
        await navigator.clipboard.writeText(content.value);
        alert('内容已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败');
      }
    };

    onMounted(async () => {
      // 加载用户设置
      const savedFontSize = await storage.getAppSetting('system-text-reader', 'fontSize');
      const savedLineHeight = await storage.getAppSetting('system-text-reader', 'lineHeight');
      const savedShowToc = await storage.getAppSetting('system-text-reader', 'showToc');
      
      if (savedFontSize) fontSize.value = savedFontSize;
      if (savedLineHeight) lineHeight.value = savedLineHeight;
      if (savedShowToc !== null) showToc.value = savedShowToc;

      // 监听文档打开和更新事件
      window.addEventListener('openDocument', handleDocumentOpen as unknown as EventListener);
      window.addEventListener('updateDocument', handleDocumentUpdate as unknown as EventListener);
      
      // 检查是否有待处理的文档
      const pendingDocumentStr = localStorage.getItem('textReader_pendingDocument');
      if (pendingDocumentStr) {
        try {
          const pendingDocument = JSON.parse(pendingDocumentStr);
          // 检查时间戳，只处理5秒内的请求
          if (Date.now() - pendingDocument.timestamp < 5000) {
            documentPath.value = pendingDocument.path;
            documentName.value = pendingDocument.name;
            await loadDocument(pendingDocument.path);
            console.log('Loaded pending document:', pendingDocument);
          }
          // 清除已处理的文档信息
          localStorage.removeItem('textReader_pendingDocument');
        } catch (error) {
          console.error('Failed to parse pending document:', error);
          localStorage.removeItem('textReader_pendingDocument');
        }
      } else {
        // 如果没有待处理文档，尝试加载上次阅读的文档
        const lastRead = await storage.getAppSetting('system-text-reader', 'lastRead');
        if (lastRead && !documentPath.value) {
          documentPath.value = lastRead.path;
          documentName.value = lastRead.name;
          loadDocument(lastRead.path);
        } else if (!documentPath.value) {
          // 加载默认欢迎文档
          documentPath.value = '/开始/欢迎.md';
          documentName.value = '欢迎';
          loadDocument('/开始/欢迎.md');
        }
      }
    });

    onUnmounted(() => {
      window.removeEventListener('openDocument', handleDocumentOpen as unknown as EventListener);
      window.removeEventListener('updateDocument', handleDocumentUpdate as unknown as EventListener);
    });

    return {
      content,
      htmlContent,
      documentPath,
      documentName,
      loading,
      error,
      fontSize,
      lineHeight,
      showToc,
      tocItems,
      readingProgress,
      estimatedReadTime,
      readerStyle,
      progressBarStyle,
      loadDocument,
      adjustFontSize,
      adjustLineHeight,
      toggleToc,
      scrollToAnchor,
      updateReadingProgress,
      exportToPdf,
      printDocument,
      copyContent
    };
  }
});
