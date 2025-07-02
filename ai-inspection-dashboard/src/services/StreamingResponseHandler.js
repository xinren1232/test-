/**
 * 流式回复处理器 - 实现打字机效果和Markdown渲染
 */

export class StreamingResponseHandler {
  constructor() {
    this.isStreaming = false
    this.currentStream = null
    this.streamingSpeed = 30 // 毫秒/字符
  }

  /**
   * 开始流式回复
   * @param {string} content - 完整内容
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @returns {Promise}
   */
  async startStreaming(content, onUpdate, onComplete) {
    if (this.isStreaming) {
      this.stopStreaming()
    }

    this.isStreaming = true
    let currentIndex = 0
    const totalLength = content.length

    return new Promise((resolve) => {
      const streamInterval = setInterval(() => {
        if (!this.isStreaming || currentIndex >= totalLength) {
          clearInterval(streamInterval)
          this.isStreaming = false
          if (onComplete) onComplete()
          resolve()
          return
        }

        // 智能分段 - 按句子或段落分割
        const nextChunk = this.getNextChunk(content, currentIndex)
        currentIndex += nextChunk.length

        const streamedContent = content.substring(0, currentIndex)
        const progress = (currentIndex / totalLength) * 100

        if (onUpdate) {
          onUpdate({
            content: streamedContent,
            progress: progress,
            isComplete: currentIndex >= totalLength
          })
        }

      }, this.streamingSpeed)

      this.currentStream = streamInterval
    })
  }

  /**
   * 获取下一个文本块 - 智能分割
   */
  getNextChunk(content, currentIndex) {
    const remainingContent = content.substring(currentIndex)
    
    // 如果剩余内容很少，直接返回
    if (remainingContent.length <= 3) {
      return remainingContent
    }

    // 寻找合适的断点
    const breakPoints = ['\n\n', '\n', '。', '！', '？', '；', '，', ' ']
    
    for (const breakPoint of breakPoints) {
      const breakIndex = remainingContent.indexOf(breakPoint)
      if (breakIndex > 0 && breakIndex <= 10) {
        return remainingContent.substring(0, breakIndex + breakPoint.length)
      }
    }

    // 如果没有找到合适的断点，返回单个字符
    return remainingContent.charAt(0)
  }

  /**
   * 停止流式回复
   */
  stopStreaming() {
    this.isStreaming = false
    if (this.currentStream) {
      clearInterval(this.currentStream)
      this.currentStream = null
    }
  }

  /**
   * 处理Markdown内容
   * @param {string} content - 原始内容
   * @returns {string} 处理后的HTML
   */
  processMarkdown(content) {
    if (!content) return ''

    // 简单的Markdown处理
    let processed = content
      // 标题
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // 粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // 代码块
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // 列表
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      
      // 换行
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')

    // 包装段落
    if (processed && !processed.startsWith('<')) {
      processed = '<p>' + processed + '</p>'
    }

    return processed
  }

  /**
   * 创建打字机效果的消息对象
   * @param {string} content - 消息内容
   * @param {string} type - 消息类型
   * @returns {Object} 消息对象
   */
  createStreamingMessage(content, type = 'ai') {
    return {
      type: type,
      content: '',
      fullContent: content,
      timestamp: new Date(),
      isStreaming: true,
      progress: 0,
      processedContent: ''
    }
  }

  /**
   * 更新流式消息
   * @param {Object} message - 消息对象
   * @param {Object} update - 更新数据
   */
  updateStreamingMessage(message, update) {
    message.content = update.content
    message.progress = update.progress
    message.isStreaming = !update.isComplete
    message.processedContent = this.processMarkdown(update.content)
    
    if (update.isComplete) {
      message.isStreaming = false
      message.progress = 100
    }
  }

  /**
   * 模拟AI流式回复
   * @param {string} content - AI回复内容
   * @param {Function} onChunk - 接收数据块的回调
   * @returns {Promise}
   */
  async simulateAIStreaming(content, onChunk) {
    const chunks = this.splitIntoChunks(content)
    
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
      
      const accumulatedContent = chunks.slice(0, i + 1).join('')
      const isComplete = i === chunks.length - 1
      
      if (onChunk) {
        onChunk({
          content: accumulatedContent,
          progress: ((i + 1) / chunks.length) * 100,
          isComplete: isComplete,
          chunkIndex: i,
          totalChunks: chunks.length
        })
      }
    }
  }

  /**
   * 将内容分割为合理的块
   */
  splitIntoChunks(content) {
    const chunks = []
    const sentences = content.split(/([。！？\n])/g)
    
    let currentChunk = ''
    for (const sentence of sentences) {
      currentChunk += sentence
      
      // 如果是句子结束符或换行，创建一个块
      if (['。', '！', '？', '\n'].includes(sentence) || currentChunk.length > 50) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk)
          currentChunk = ''
        }
      }
    }
    
    // 添加剩余内容
    if (currentChunk.trim()) {
      chunks.push(currentChunk)
    }
    
    return chunks
  }

  /**
   * 格式化数据表格
   * @param {Array} data - 数据数组
   * @param {Array} columns - 列定义
   * @returns {string} Markdown表格
   */
  formatDataTable(data, columns) {
    if (!data || data.length === 0) return ''

    let table = '| ' + columns.map(col => col.title || col.key).join(' | ') + ' |\n'
    table += '| ' + columns.map(() => '---').join(' | ') + ' |\n'
    
    data.slice(0, 10).forEach(row => { // 限制显示前10行
      const cells = columns.map(col => {
        const value = row[col.key]
        return value !== undefined ? String(value) : '-'
      })
      table += '| ' + cells.join(' | ') + ' |\n'
    })
    
    if (data.length > 10) {
      table += `\n*显示前10条记录，共${data.length}条*\n`
    }
    
    return table
  }

  /**
   * 创建进度指示器
   * @param {number} progress - 进度百分比
   * @returns {string} 进度条HTML
   */
  createProgressIndicator(progress) {
    const width = Math.min(Math.max(progress, 0), 100)
    return `
      <div class="streaming-progress">
        <div class="progress-bar" style="width: ${width}%"></div>
        <span class="progress-text">${width.toFixed(0)}%</span>
      </div>
    `
  }

  /**
   * 添加思考动画
   * @returns {string} 思考动画HTML
   */
  createThinkingAnimation() {
    return `
      <div class="thinking-animation">
        <span class="thinking-dot"></span>
        <span class="thinking-dot"></span>
        <span class="thinking-dot"></span>
        <span class="thinking-text">AI正在思考中...</span>
      </div>
    `
  }
}

// 创建单例实例
export const streamingHandler = new StreamingResponseHandler()
export default streamingHandler
