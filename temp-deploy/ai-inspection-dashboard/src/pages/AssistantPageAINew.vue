<template>
  <div class="ai-assistant-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <h1>🤖 IQE AI 智能助手</h1>
      <div class="header-controls">
        <el-switch
          v-model="aiMode"
          active-text="AI增强模式"
          inactive-text="基础模式"
          size="large"
        />
        <el-button @click="clearMessages" type="primary" plain>清空对话</el-button>
        <el-button @click="exportChat" type="success" plain>导出对话</el-button>
      </div>
    </div>

    <!-- 三栏主体内容 -->
    <div class="three-column-layout">
      <!-- 左栏：工具展示区 -->
      <div class="left-column">
        <div class="column-header">
          <h3>🛠️ 可用工具</h3>
        </div>
        
        <div class="tools-section">
          <div class="tool-category">
            <h4>📊 数据分析工具</h4>
            <div class="tool-item">
              <span class="tool-icon">📊</span>
              <div class="tool-details">
                <div class="tool-name">数据分析</div>
                <div class="tool-desc">分析质量管理数据</div>
              </div>
            </div>
            <div class="tool-item">
              <span class="tool-icon">📈</span>
              <div class="tool-details">
                <div class="tool-name">统计分析</div>
                <div class="tool-desc">执行统计分析</div>
              </div>
            </div>
            <div class="tool-item">
              <span class="tool-icon">🧮</span>
              <div class="tool-details">
                <div class="tool-name">数值计算</div>
                <div class="tool-desc">执行数学计算</div>
              </div>
            </div>
          </div>

          <div class="tool-category">
            <h4>📈 可视化工具</h4>
            <div class="tool-item">
              <span class="tool-icon">📊</span>
              <div class="tool-details">
                <div class="tool-name">图表生成</div>
                <div class="tool-desc">生成数据可视化图表</div>
              </div>
            </div>
            <div class="tool-item">
              <span class="tool-icon">📄</span>
              <div class="tool-details">
                <div class="tool-name">报告生成</div>
                <div class="tool-desc">生成质量分析报告</div>
              </div>
            </div>
          </div>

          <div class="tool-category">
            <h4>🌐 联网工具</h4>
            <div class="tool-item">
              <span class="tool-icon">🔍</span>
              <div class="tool-details">
                <div class="tool-name">网络搜索</div>
                <div class="tool-desc">搜索相关信息</div>
              </div>
            </div>
          </div>

          <div class="tool-category">
            <h4>🎯 质量管理</h4>
            <div class="tool-item">
              <span class="tool-icon">📦</span>
              <div class="tool-details">
                <div class="tool-name">库存查询</div>
                <div class="tool-desc">查询库存信息</div>
              </div>
            </div>
            <div class="tool-item">
              <span class="tool-icon">🏭</span>
              <div class="tool-details">
                <div class="tool-name">生产查询</div>
                <div class="tool-desc">查询生产数据</div>
              </div>
            </div>
            <div class="tool-item">
              <span class="tool-icon">🧪</span>
              <div class="tool-details">
                <div class="tool-name">检测查询</div>
                <div class="tool-desc">查询检测结果</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中栏：问答对话区 -->
      <div class="middle-column">
        <div class="column-header">
          <h3>💬 智能问答</h3>
          <div class="quick-examples">
            <el-tag v-for="example in quickExamples" :key="example" 
                    @click="sendQuickQuestion(example)" 
                    class="example-tag">
              {{ example }}
            </el-tag>
          </div>
        </div>

        <!-- 对话消息区域 -->
        <div class="messages-area" ref="messagesArea">
          <div v-for="(message, index) in messages" :key="index" 
               :class="['chat-message', message.sender || message.type]">
            <div class="message-avatar">
              <span v-if="message.sender === 'user' || message.type === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-body">
              <div class="message-text">{{ message.content || message.text }}</div>
              <div class="message-timestamp">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="chat-message ai loading-message">
            <div class="message-avatar">🤖</div>
            <div class="message-body">
              <div class="typing-animation">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keydown.ctrl.enter="sendMessage"
            :disabled="isLoading"
          />
          <div class="input-controls">
            <el-button @click="sendMessage" type="primary" :loading="isLoading">
              发送 (Ctrl+Enter)
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右栏：AI思考过程展示区 -->
      <div class="right-column">
        <div class="column-header">
          <h3>🧠 AI思考过程</h3>
        </div>
        
        <div class="thinking-area">
          <div v-if="currentProcess.length === 0" class="empty-thinking">
            <div class="empty-icon">🤔</div>
            <div class="empty-text">AI正在等待您的问题...</div>
          </div>
          
          <div v-for="(step, index) in currentProcess" :key="index" 
               :class="['thinking-step', step.status]">
            <div class="step-header">
              <span class="step-icon">{{ getStepIcon(step.type) }}</span>
              <span class="step-title">{{ step.title }}</span>
              <span class="step-status">{{ getStatusText(step.status) }}</span>
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

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const inputMessage = ref('')
const messages = ref([
  {
    sender: 'assistant',
    text: '您好！我是AI智能问答助手。我已接入DeepSeek大语言模型，可以为您提供智能对话服务。',
    timestamp: new Date()
  }
])
const isLoading = ref(false)
const aiMode = ref(true)
const currentProcess = ref([])
const messagesArea = ref(null)

const quickExamples = ref([
  '查询工厂A的库存情况',
  '分析最近的质量趋势',
  '生成质量报告',
  '统计不合格品数量',
  '查看生产线状态'
])

// 辅助函数
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString()
}

const getStepIcon = (type) => {
  const icons = {
    thinking: '🤔',
    analysis: '🔍',
    tool_selection: '🛠️',
    data_query: '📊',
    response: '💬'
  }
  return icons[type] || '⚙️'
}

const getStatusText = (status) => {
  const texts = {
    processing: '处理中...',
    completed: '完成',
    error: '错误'
  }
  return texts[status] || status
}

const formatStepResult = (result) => {
  if (typeof result === 'object') {
    return JSON.stringify(result, null, 2)
  }
  return String(result)
}

const sendQuickQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

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
  }
}

const processAIResponse = async (question) => {
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
  
  // 模拟AI思考过程
  addProcessStep('thinking', '理解问题', 'processing', { question })
  await delay(1000)
  updateProcessStep(0, 'completed')
  
  addProcessStep('analysis', '分析问题类型', 'processing')
  await delay(800)
  updateProcessStep(1, 'completed')
  
  addProcessStep('tool_selection', '选择合适工具', 'processing')
  await delay(600)
  updateProcessStep(2, 'completed')
  
  addProcessStep('response', '生成回答', 'processing')
  await delay(500)
  updateProcessStep(3, 'completed')
  
  const response = `我收到了您的问题："${question}"。这是一个关于质量管理的问题，我正在为您分析相关数据...`
  
  messages.value.push({
    type: 'ai',
    content: response,
    timestamp: new Date()
  })
}

const clearMessages = () => {
  messages.value = [
    {
      sender: 'assistant',
      text: '对话已清空。您好！我是AI智能问答助手，已接入DeepSeek大语言模型。',
      timestamp: new Date()
    }
  ]
  currentProcess.value = []
  ElMessage.success('对话已清空')
}

const exportChat = () => {
  ElMessage.success('导出功能开发中...')
}
</script>

<style scoped>
/* 强制布局样式 - 确保不被覆盖 */
.ai-assistant-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  background: #f5f7fa !important;
  z-index: 9999 !important;
  overflow: hidden !important;
}

.top-header {
  background: white !important;
  padding: 16px 24px !important;
  border-bottom: 1px solid #e4e7ed !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  flex-shrink: 0 !important;
}

.top-header h1 {
  margin: 0 !important;
  color: #303133 !important;
  font-size: 24px !important;
}

.header-controls {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
}

.three-column-layout {
  flex: 1 !important;
  display: flex !important;
  gap: 16px !important;
  padding: 16px !important;
  overflow: hidden !important;
  min-height: 0 !important;
}

/* 左栏样式 */
.left-column {
  width: 300px !important;
  min-width: 300px !important;
  max-width: 300px !important;
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  overflow-y: auto !important;
  flex-shrink: 0 !important;
}

/* 中栏样式 */
.middle-column {
  flex: 1 1 auto !important;
  min-width: 400px !important;
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* 右栏样式 */
.right-column {
  width: 350px !important;
  min-width: 350px !important;
  max-width: 350px !important;
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
}

.column-header {
  padding: 16px !important;
  border-bottom: 1px solid #e4e7ed !important;
  background: #f8f9fa !important;
  border-radius: 8px 8px 0 0 !important;
  flex-shrink: 0 !important;
}

.column-header h3 {
  margin: 0 !important;
  color: #303133 !important;
  font-size: 16px !important;
}

.quick-examples {
  margin-top: 12px !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}

.example-tag {
  cursor: pointer !important;
  transition: all 0.3s !important;
}

.example-tag:hover {
  background: #409eff !important;
  color: white !important;
}

/* 工具区域样式 */
.tools-section {
  padding: 16px !important;
  overflow-y: auto !important;
}

.tool-category {
  margin-bottom: 20px !important;
}

.tool-category h4 {
  margin: 0 0 12px 0 !important;
  color: #606266 !important;
  font-size: 14px !important;
}

.tool-item {
  display: flex !important;
  align-items: center !important;
  padding: 8px 12px !important;
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin-bottom: 8px !important;
  cursor: pointer !important;
  transition: all 0.3s !important;
}

.tool-item:hover {
  background: #e3f2fd !important;
  transform: translateX(4px) !important;
}

.tool-icon {
  font-size: 20px !important;
  margin-right: 12px !important;
  flex-shrink: 0 !important;
}

.tool-details {
  flex: 1 !important;
}

.tool-name {
  font-weight: 500 !important;
  color: #303133 !important;
  font-size: 13px !important;
}

.tool-desc {
  color: #909399 !important;
  font-size: 12px !important;
  margin-top: 2px !important;
}

/* 消息区域样式 */
.messages-area {
  flex: 1 !important;
  padding: 16px !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}

.chat-message {
  display: flex !important;
  gap: 12px !important;
  max-width: 80% !important;
}

.chat-message.user {
  align-self: flex-end !important;
  flex-direction: row-reverse !important;
}

.message-avatar {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: #f0f0f0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 18px !important;
  flex-shrink: 0 !important;
}

.chat-message.user .message-avatar {
  background: #409eff !important;
  color: white !important;
}

.message-body {
  flex: 1 !important;
}

.message-text {
  background: #f8f9fa !important;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  line-height: 1.5 !important;
  word-wrap: break-word !important;
}

.chat-message.user .message-text {
  background: #409eff !important;
  color: white !important;
}

.message-timestamp {
  font-size: 12px !important;
  color: #909399 !important;
  margin-top: 4px !important;
  text-align: right !important;
}

.chat-message.user .message-timestamp {
  text-align: left !important;
}

/* 输入区域样式 */
.input-area {
  padding: 16px !important;
  border-top: 1px solid #e4e7ed !important;
  flex-shrink: 0 !important;
}

.input-controls {
  margin-top: 8px !important;
  text-align: right !important;
}

/* 思考区域样式 */
.thinking-area {
  flex: 1 !important;
  padding: 16px !important;
  overflow-y: auto !important;
}

.empty-thinking {
  text-align: center !important;
  padding: 40px 20px !important;
  color: #909399 !important;
}

.empty-icon {
  font-size: 48px !important;
  margin-bottom: 16px !important;
}

.thinking-step {
  margin-bottom: 16px !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  transition: all 0.3s !important;
}

.thinking-step.processing {
  border-color: #409eff !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2) !important;
}

.thinking-step.completed {
  border-color: #67c23a !important;
}

.step-header {
  padding: 12px 16px !important;
  background: #f8f9fa !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.step-title {
  flex: 1 !important;
  font-weight: 500 !important;
  color: #303133 !important;
  font-size: 14px !important;
}

.step-status {
  font-size: 12px !important;
  color: #909399 !important;
}

.thinking-step.processing .step-status {
  color: #409eff !important;
}

.thinking-step.completed .step-status {
  color: #67c23a !important;
}

/* 加载动画 */
.typing-animation {
  display: flex !important;
  gap: 4px !important;
  align-items: center !important;
}

.typing-animation span {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #909399 !important;
  animation: typing 1.4s infinite ease-in-out !important;
}

.typing-animation span:nth-child(1) { animation-delay: -0.32s !important; }
.typing-animation span:nth-child(2) { animation-delay: -0.16s !important; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
