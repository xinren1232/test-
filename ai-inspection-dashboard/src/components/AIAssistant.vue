<template>
  <div class="ai-assistant">
    <!-- 顶部导航栏 -->
    <div class="header">
      <h1>🤖 IQE AI 智能助手</h1>
      <div class="header-actions">
        <el-button @click="clearChat" type="primary" plain>清空对话</el-button>
        <el-button @click="exportChat" type="success" plain>导出对话</el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧工具展示区 -->
      <div class="tools-panel">
        <div class="panel-header">
          <h3>🛠️ 可用工具</h3>
        </div>
        
        <!-- 基础工具 -->
        <div class="tool-category">
          <h4>📊 数据分析工具</h4>
          <div class="tool-list">
            <div class="tool-item" v-for="tool in dataAnalysisTools" :key="tool.name">
              <div class="tool-icon">{{ tool.icon }}</div>
              <div class="tool-info">
                <div class="tool-name">{{ tool.displayName }}</div>
                <div class="tool-desc">{{ tool.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图表工具 -->
        <div class="tool-category">
          <h4>📈 可视化工具</h4>
          <div class="tool-list">
            <div class="tool-item" v-for="tool in visualizationTools" :key="tool.name">
              <div class="tool-icon">{{ tool.icon }}</div>
              <div class="tool-info">
                <div class="tool-name">{{ tool.displayName }}</div>
                <div class="tool-desc">{{ tool.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 联网工具 -->
        <div class="tool-category">
          <h4>🌐 联网工具</h4>
          <div class="tool-list">
            <div class="tool-item" v-for="tool in networkTools" :key="tool.name">
              <div class="tool-icon">{{ tool.icon }}</div>
              <div class="tool-info">
                <div class="tool-name">{{ tool.displayName }}</div>
                <div class="tool-desc">{{ tool.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 质量管理工具 -->
        <div class="tool-category">
          <h4>🎯 质量管理</h4>
          <div class="tool-list">
            <div class="tool-item" v-for="tool in qualityTools" :key="tool.name">
              <div class="tool-icon">{{ tool.icon }}</div>
              <div class="tool-info">
                <div class="tool-name">{{ tool.displayName }}</div>
                <div class="tool-desc">{{ tool.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间问答区域 -->
      <div class="chat-panel">
        <div class="panel-header">
          <h3>💬 智能问答</h3>
          <div class="quick-actions">
            <el-tag v-for="example in quickExamples" :key="example" 
                    @click="sendQuickQuestion(example)" 
                    class="quick-tag">
              {{ example }}
            </el-tag>
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="chatMessages">
          <div v-for="(message, index) in messages" :key="index" 
               :class="['message', message.type]">
            <div class="message-avatar">
              <span v-if="message.type === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="message ai loading">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keydown.ctrl.enter="sendMessage"
            :disabled="isLoading"
          />
          <div class="input-actions">
            <el-button @click="sendMessage" type="primary" :loading="isLoading">
              发送 (Ctrl+Enter)
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧思考执行过程展示区 -->
      <div class="process-panel">
        <div class="panel-header">
          <h3>🧠 AI思考过程</h3>
        </div>
        
        <div class="process-content">
          <div v-if="currentProcess.length === 0" class="empty-state">
            <div class="empty-icon">🤔</div>
            <div class="empty-text">AI正在等待您的问题...</div>
          </div>
          
          <div v-for="(step, index) in currentProcess" :key="index" 
               :class="['process-step', step.status]">
            <div class="step-header">
              <div class="step-icon">{{ getStepIcon(step.type) }}</div>
              <div class="step-title">{{ step.title }}</div>
              <div class="step-status">{{ getStatusText(step.status) }}</div>
            </div>
            
            <div v-if="step.details" class="step-details">
              <pre>{{ JSON.stringify(step.details, null, 2) }}</pre>
            </div>
            
            <div v-if="step.result" class="step-result">
              <div class="result-label">执行结果:</div>
              <div class="result-content">{{ formatStepResult(step.result) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AIAssistant',
  setup() {
    const inputMessage = ref('')
    const messages = ref([])
    const isLoading = ref(false)
    const currentProcess = ref([])
    const chatMessages = ref(null)

    // 工具分类
    const dataAnalysisTools = ref([
      { name: 'analyze_data', icon: '📊', displayName: '数据分析', description: '分析质量管理数据' },
      { name: 'statistical_analysis', icon: '📈', displayName: '统计分析', description: '执行统计分析' },
      { name: 'calculate', icon: '🧮', displayName: '数值计算', description: '执行数学计算' },
      { name: 'format_data', icon: '📋', displayName: '数据格式化', description: '格式化数据输出' }
    ])

    const visualizationTools = ref([
      { name: 'create_chart', icon: '📊', displayName: '图表生成', description: '生成数据可视化图表' },
      { name: 'trend_analysis', icon: '📈', displayName: '趋势分析', description: '分析数据趋势' },
      { name: 'generate_report', icon: '📄', displayName: '报告生成', description: '生成质量分析报告' }
    ])

    const networkTools = ref([
      { name: 'web_search', icon: '🔍', displayName: '网络搜索', description: '搜索相关信息' },
      { name: 'api_call', icon: '🌐', displayName: 'API调用', description: '调用外部API' }
    ])

    const qualityTools = ref([
      { name: 'query_inventory', icon: '📦', displayName: '库存查询', description: '查询库存信息' },
      { name: 'query_production', icon: '🏭', displayName: '生产查询', description: '查询生产数据' },
      { name: 'query_testing', icon: '🧪', displayName: '检测查询', description: '查询检测结果' },
      { name: 'export_data', icon: '💾', displayName: '数据导出', description: '导出数据为各种格式' }
    ])

    // 快速示例问题
    const quickExamples = ref([
      '查询工厂A的库存情况',
      '分析最近的质量趋势',
      '生成质量报告',
      '统计不合格品数量',
      '查看生产线状态'
    ])

    // 发送消息
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return

      const userMessage = {
        type: 'user',
        content: inputMessage.value,
        timestamp: new Date()
      }

      messages.value.push(userMessage)
      const question = inputMessage.value
      inputMessage.value = ''
      
      await scrollToBottom()
      
      // 开始AI处理
      isLoading.value = true
      currentProcess.value = []
      
      try {
        await processAIResponse(question)
      } catch (error) {
        console.error('AI处理错误:', error)
        messages.value.push({
          type: 'ai',
          content: '抱歉，处理您的问题时出现了错误。请稍后重试。',
          timestamp: new Date()
        })
      } finally {
        isLoading.value = false
        await scrollToBottom()
      }
    }

    // 辅助函数
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const addProcessStep = (type, title, status, details = null) => {
      currentProcess.value.push({ type, title, status, details })
    }

    const updateProcessStep = (index, status, result = null) => {
      if (currentProcess.value[index]) {
        currentProcess.value[index].status = status
        if (result) {
          currentProcess.value[index].result = result
        }
      }
    }

    const analyzeQuestion = (question) => {
      const q = question.toLowerCase()

      if (q.includes('库存') || q.includes('inventory')) {
        return {
          needsData: true,
          tool: 'query_inventory',
          parameters: { data_type: 'inventory' },
          category: 'inventory'
        }
      } else if (q.includes('生产') || q.includes('production')) {
        return {
          needsData: true,
          tool: 'query_production',
          parameters: { data_type: 'production' },
          category: 'production'
        }
      } else if (q.includes('检测') || q.includes('测试') || q.includes('testing')) {
        return {
          needsData: true,
          tool: 'query_testing',
          parameters: { data_type: 'testing' },
          category: 'testing'
        }
      } else if (q.includes('计算') || q.includes('算')) {
        return {
          needsData: true,
          tool: 'calculate',
          parameters: { expression: extractMathExpression(question) },
          category: 'calculation'
        }
      } else if (q.includes('分析') || q.includes('统计')) {
        return {
          needsData: true,
          tool: 'analyze_data',
          parameters: { data_type: 'inventory' },
          category: 'analysis'
        }
      } else {
        return {
          needsData: false,
          tool: 'general',
          parameters: {},
          category: 'general'
        }
      }
    }

    const extractMathExpression = (question) => {
      const match = question.match(/[\d+\-*/().\s]+/)
      return match ? match[0].trim() : '1+1'
    }

    const formatToolResponse = (toolResult) => {
      if (!toolResult || !toolResult.success) {
        return '抱歉，查询数据时出现问题。'
      }

      const data = toolResult.data
      if (Array.isArray(data)) {
        return `查询到 ${data.length} 条记录。\n\n${toolResult.summary || '数据查询完成。'}`
      } else if (typeof data === 'object') {
        return `查询结果：\n${JSON.stringify(data, null, 2)}`
      } else {
        return `查询结果：${data}`
      }
    }

    const generateDirectResponse = (question) => {
      const responses = [
        '我是IQE AI智能助手，专门帮助您处理质量管理相关问题。',
        '您可以询问库存、生产、检测等相关数据。',
        '我可以帮您分析数据、生成报告、执行计算等。',
        '如需具体帮助，请告诉我您想查询什么数据。'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    }

    // 处理AI响应
    const processAIResponse = async (question) => {
      // 模拟AI思考过程
      addProcessStep('thinking', '理解问题', 'processing', { question })
      await delay(1000)

      // 分析问题类型
      const analysis = analyzeQuestion(question)
      updateProcessStep(0, 'completed', { analysis })

      addProcessStep('analysis', '分析问题类型', 'processing', analysis)
      await delay(800)
      updateProcessStep(1, 'completed')

      // 选择工具
      addProcessStep('tool_selection', '选择合适工具', 'processing')
      await delay(600)

      let response = ''

      if (analysis.needsData) {
        // 执行数据查询
        addProcessStep('data_query', '查询数据', 'processing')
        // 模拟工具执行结果
        const toolResult = {
          success: true,
          data: [{ id: 1, name: '示例数据', value: 100 }],
          summary: '查询完成，找到1条记录'
        }
        updateProcessStep(3, 'completed', { result: toolResult })

        response = formatToolResponse(toolResult)
      } else {
        response = generateDirectResponse(question)
      }

      updateProcessStep(2, 'completed', { selectedTool: analysis.tool })

      // 生成最终回答
      addProcessStep('response', '生成回答', 'processing')
      await delay(500)
      updateProcessStep(4, 'completed')

      messages.value.push({
        type: 'ai',
        content: response,
        timestamp: new Date()
      })
    }

    return {
      inputMessage,
      messages,
      isLoading,
      currentProcess,
      chatMessages,
      dataAnalysisTools,
      visualizationTools,
      networkTools,
      qualityTools,
      quickExamples,
      sendMessage,
      sendQuickQuestion: (question) => {
        inputMessage.value = question
        sendMessage()
      },
      clearChat: () => {
        messages.value = []
        currentProcess.value = []
      },
      exportChat: () => {
        ElMessage.success('导出功能开发中...')
      },
      formatMessage: (content) => {
        return content.replace(/\n/g, '<br>')
      },
      formatTime: (timestamp) => {
        return timestamp.toLocaleTimeString()
      },
      getStepIcon: (type) => {
        const icons = {
          thinking: '🤔',
          analysis: '🔍',
          tool_selection: '🛠️',
          data_query: '📊',
          response: '💬'
        }
        return icons[type] || '⚙️'
      },
      getStatusText: (status) => {
        const texts = {
          processing: '处理中...',
          completed: '完成',
          error: '错误'
        }
        return texts[status] || status
      },
      formatStepResult: (result) => {
        if (typeof result === 'object') {
          return JSON.stringify(result, null, 2)
        }
        return String(result)
      }
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

/* 左侧工具面板 */
.tools-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-y: auto;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.tool-category {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tool-category h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-item:hover {
  background: #e3f2fd;
  transform: translateX(4px);
}

.tool-icon {
  font-size: 20px;
  margin-right: 12px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: #303133;
  font-size: 13px;
}

.tool-desc {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
}

/* 中间聊天面板 */
.chat-panel {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.quick-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.quick-tag:hover {
  background: #409eff;
  color: white;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.ai {
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #409eff;
  color: white;
}

.message.ai .message-avatar {
  background: #67c23a;
  color: white;
}

.message-content {
  flex: 1;
}

.message-text {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-text {
  background: #409eff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.message.user .message-time {
  text-align: left;
}

/* 加载动画 */
.loading .message-text {
  background: #f0f0f0;
  padding: 16px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
}

.input-actions {
  margin-top: 8px;
  text-align: right;
}

/* 右侧思考过程面板 */
.process-panel {
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.process-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
}

.process-step {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.process-step.processing {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
}

.process-step.completed {
  border-color: #67c23a;
}

.process-step.error {
  border-color: #f56c6c;
}

.step-header {
  padding: 12px 16px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-icon {
  font-size: 16px;
}

.step-title {
  flex: 1;
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.step-status {
  font-size: 12px;
  color: #909399;
}

.process-step.processing .step-status {
  color: #409eff;
}

.process-step.completed .step-status {
  color: #67c23a;
}

.process-step.error .step-status {
  color: #f56c6c;
}

.step-details {
  padding: 12px 16px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

.step-details pre {
  margin: 0;
  font-size: 12px;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.step-result {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
}

.result-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.result-content {
  font-size: 13px;
  color: #303133;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tools-panel {
    width: 250px;
  }

  .process-panel {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    gap: 8px;
  }

  .tools-panel,
  .process-panel {
    width: 100%;
    height: 200px;
  }

  .chat-panel {
    flex: 1;
    min-height: 400px;
  }
}

/* 滚动条样式 */
.tools-panel::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar,
.process-content::-webkit-scrollbar {
  width: 6px;
}

.tools-panel::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track,
.process-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tools-panel::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb,
.process-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tools-panel::-webkit-scrollbar-thumb:hover,
.chat-messages::-webkit-scrollbar-thumb:hover,
.process-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
