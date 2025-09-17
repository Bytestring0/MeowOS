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
        
        // 确保DOM更新后再应用语法高亮和复制按钮
        await nextTick();
        
        // 手动应用语法高亮到新渲染的代码块
        const codeBlocks = document.querySelectorAll('.content-body pre code');
        codeBlocks.forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
        
        // 为代码块添加复制按钮
        addCopyButtonsToCodeBlocks();
        
        // 再次调用以防万一有延迟渲染的内容
        setTimeout(() => {
          addCopyButtonsToCodeBlocks();
        }, 200);
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

    // 切换目录显示
    const toggleToc = () => {
      showToc.value = !showToc.value;
      storage.setAppSetting('system-text-reader', 'showToc', showToc.value);
    };

    // 复制代码块内容
    const copyCodeBlock = async (codeElement: HTMLElement) => {
      try {
        const code = codeElement.textContent || '';
        await navigator.clipboard.writeText(code);
        
        // 显示复制成功反馈
        const btn = codeElement.parentElement?.querySelector('.copy-btn');
        if (btn) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          `;
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('copied');
          }, 2000);
        }
      } catch (err) {
        console.error('复制代码失败:', err);
        alert('复制失败');
      }
    };

    // 切换代码块展开状态
    const toggleCodeExpand = (pre: HTMLElement) => {
      const isExpanded = pre.classList.contains('expanded');
      if (isExpanded) {
        pre.classList.remove('expanded');
      } else {
        pre.classList.add('expanded');
      }
      
      // 更新按钮图标
      const expandBtn = pre.querySelector('.expand-btn');
      if (expandBtn) {
        if (isExpanded) {
          expandBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15,3 21,3 21,9"></polyline>
              <polyline points="9,21 3,21 3,15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          `;
          expandBtn.setAttribute('title', '展开');
        } else {
          expandBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4,14 10,14 10,20"></polyline>
              <polyline points="20,10 14,10 14,4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          `;
          expandBtn.setAttribute('title', '收起');
        }
      }
    };



    // 为代码块添加按钮组
    const addCopyButtonsToCodeBlocks = () => {
      // 使用 setTimeout 确保 DOM 已完全渲染
      setTimeout(() => {
        const codeBlocks = document.querySelectorAll('.content-body pre');
        codeBlocks.forEach((pre) => {
          // 如果已经有按钮组，跳过
          if (pre.querySelector('.code-actions')) return;
          
          // 创建按钮组容器
          const actionsContainer = document.createElement('div');
          actionsContainer.className = 'code-actions';
          
          // 展开按钮
          const expandBtn = document.createElement('button');
          expandBtn.className = 'expand-btn code-action-btn';
          expandBtn.setAttribute('title', '展开');
          expandBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15,3 21,3 21,9"></polyline>
              <polyline points="9,21 3,21 3,15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          `;
          expandBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCodeExpand(pre as HTMLElement);
          };
          
          // 复制按钮
          const copyBtn = document.createElement('button');
          copyBtn.className = 'copy-btn code-action-btn';
          copyBtn.setAttribute('title', '复制代码');
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5,15H4a2,2 0,0 1,-2-2V4A2,2 0,0 1,4 2H15a2,2 0,0 1,2 2V5"></path>
            </svg>
          `;
          copyBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const codeElement = pre.querySelector('code') as HTMLElement;
            if (codeElement) {
              copyCodeBlock(codeElement);
            }
          };
          
          // 放大按钮已移除
          
          // 组装按钮组（只包含展开和复制按钮）
          actionsContainer.appendChild(expandBtn);
          actionsContainer.appendChild(copyBtn);
          
          (pre as HTMLElement).style.position = 'relative'; // 确保父元素有相对定位
          pre.appendChild(actionsContainer);
        });
      }, 100);
    };

    onMounted(async () => {
      // 加载用户设置
      const savedShowToc = await storage.getAppSetting('system-text-reader', 'showToc');
      
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
      showToc,
      tocItems,
      readingProgress,
      estimatedReadTime,
      progressBarStyle,
      loadDocument,
      toggleToc,
      scrollToAnchor,
      updateReadingProgress,
      copyCodeBlock,
      toggleCodeExpand,
      addCopyButtonsToCodeBlocks
    };
  }
});
