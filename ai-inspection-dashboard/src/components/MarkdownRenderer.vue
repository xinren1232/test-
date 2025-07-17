<template>
  <div class="markdown-renderer" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// 简单的markdown渲染器
const renderedContent = computed(() => {
  let html = props.content

  // 转义HTML特殊字符（除了我们要处理的markdown）
  html = html.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')

  // 处理代码块 ```
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'text'
    return `<div class="code-block">
      <div class="code-header">
        <span class="code-lang">${language}</span>
        <button class="copy-btn" onclick="copyCode(this)">复制</button>
      </div>
      <pre><code class="language-${language}">${code.trim()}</code></pre>
    </div>`
  })

  // 处理行内代码 `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // 处理标题
  html = html.replace(/^### (.*$)/gm, '<h3 class="md-h3">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 class="md-h2">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1 class="md-h1">$1</h1>')

  // 处理粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>')

  // 处理斜体
  html = html.replace(/\*(.*?)\*/g, '<em class="md-italic">$1</em>')

  // 处理列表
  html = html.replace(/^(\d+)\. (.*$)/gm, '<li class="md-ol-item">$2</li>')
  html = html.replace(/^- (.*$)/gm, '<li class="md-ul-item">$2</li>')
  html = html.replace(/^• (.*$)/gm, '<li class="md-ul-item">$2</li>')

  // 包装列表项
  html = html.replace(/(<li class="md-ol-item">.*<\/li>)/gs, '<ol class="md-ol">$1</ol>')
  html = html.replace(/(<li class="md-ul-item">.*<\/li>)/gs, '<ul class="md-ul">$1</ul>')

  // 处理换行
  html = html.replace(/\n\n/g, '</p><p class="md-paragraph">')
  html = html.replace(/\n/g, '<br>')

  // 包装段落
  if (!html.startsWith('<')) {
    html = '<p class="md-paragraph">' + html + '</p>'
  }

  // 处理引用
  html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="md-quote">$1</blockquote>')

  // 处理分割线
  html = html.replace(/^---$/gm, '<hr class="md-divider">')

  // 处理表格（简单版本）
  html = html.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map(cell => cell.trim())
    const cellsHtml = cells.map(cell => `<td class="md-td">${cell}</td>`).join('')
    return `<tr class="md-tr">${cellsHtml}</tr>`
  })

  return html
})

// 全局复制函数
if (typeof window !== 'undefined') {
  window.copyCode = function(button) {
    const codeBlock = button.closest('.code-block')
    const code = codeBlock.querySelector('code').textContent
    
    navigator.clipboard.writeText(code).then(() => {
      button.textContent = '已复制'
      setTimeout(() => {
        button.textContent = '复制'
      }, 2000)
    }).catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      button.textContent = '已复制'
      setTimeout(() => {
        button.textContent = '复制'
      }, 2000)
    })
  }
}
</script>

<style scoped>
.markdown-renderer {
  line-height: 1.6;
  color: #2c3e50;
}

/* 标题样式 */
.markdown-renderer :deep(.md-h1) {
  font-size: 1.5em;
  font-weight: bold;
  color: #2c3e50;
  margin: 16px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
}

.markdown-renderer :deep(.md-h2) {
  font-size: 1.3em;
  font-weight: bold;
  color: #34495e;
  margin: 14px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #bdc3c7;
}

.markdown-renderer :deep(.md-h3) {
  font-size: 1.1em;
  font-weight: bold;
  color: #34495e;
  margin: 12px 0 8px 0;
}

/* 段落样式 */
.markdown-renderer :deep(.md-paragraph) {
  margin: 8px 0;
  line-height: 1.6;
}

/* 粗体和斜体 */
.markdown-renderer :deep(.md-bold) {
  font-weight: bold;
  color: #2c3e50;
}

.markdown-renderer :deep(.md-italic) {
  font-style: italic;
  color: #7f8c8d;
}

/* 列表样式 */
.markdown-renderer :deep(.md-ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-renderer :deep(.md-ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-renderer :deep(.md-ul-item) {
  margin: 4px 0;
  list-style-type: disc;
}

.markdown-renderer :deep(.md-ol-item) {
  margin: 4px 0;
  list-style-type: decimal;
}

/* 代码样式 */
.markdown-renderer :deep(.inline-code) {
  background: #f8f9fa;
  color: #e83e8c;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  border: 1px solid #e9ecef;
}

.markdown-renderer :deep(.code-block) {
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e5e9;
  background: #f8f9fa;
}

.markdown-renderer :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}

.markdown-renderer :deep(.code-lang) {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  text-transform: uppercase;
}

.markdown-renderer :deep(.copy-btn) {
  padding: 4px 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.markdown-renderer :deep(.copy-btn:hover) {
  background: #0056b3;
}

.markdown-renderer :deep(.code-block pre) {
  margin: 0;
  padding: 12px;
  background: #2d3748;
  color: #e2e8f0;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.markdown-renderer :deep(.code-block code) {
  background: none;
  color: inherit;
  padding: 0;
  border: none;
}

/* 引用样式 */
.markdown-renderer :deep(.md-quote) {
  margin: 12px 0;
  padding: 8px 16px;
  background: #f8f9fa;
  border-left: 4px solid #3498db;
  color: #6c757d;
  font-style: italic;
}

/* 分割线 */
.markdown-renderer :deep(.md-divider) {
  margin: 16px 0;
  border: none;
  border-top: 2px solid #e9ecef;
}

/* 表格样式 */
.markdown-renderer :deep(.md-tr) {
  border-bottom: 1px solid #dee2e6;
}

.markdown-renderer :deep(.md-td) {
  padding: 8px 12px;
  border-right: 1px solid #dee2e6;
}
</style>
