<template>
  <div class="ai-assistant-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <h1>🤖 IQE AI 智能助手 (测试版)</h1>
      <div class="header-actions">
        <el-switch
          v-model="aiMode"
          active-text="AI增强模式"
          inactive-text="基础模式"
          size="large"
        />
        <el-button @click="clearMessages" type="primary" plain>清空对话</el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧工具展示区 -->
      <div class="tools-panel">
        <div class="panel-header">
          <h3>🛠️ 可用工具</h3>
        </div>
        
        <div class="tool-category">
          <h4>📊 数据分析工具</h4>
          <div class="tool-list">
            <div class="tool-item">
              <div class="tool-icon">📊</div>
              <div class="tool-info">
                <div class="tool-name">数据分析</div>
                <div class="tool-desc">分析质量管理数据</div>
              </div>
            </div>
            <div class="tool-item">
              <div class="tool-icon">📈</div>
              <div class="tool-info">
                <div class="tool-name">统计分析</div>
                <div class="tool-desc">执行统计分析</div>
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
               :class="['message', message.sender || message.type]">
            <div class="message-avatar">
              <span v-if="message.sender === 'user' || message.type === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content || message.text }}</div>
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
    text: '您好！我是AI智能问答助手测试版。',
    timestamp: new Date()
  }
])
const isLoading = ref(false)
const aiMode = ref(true)
const currentProcess = ref([])
const chatMessages = ref(null)

const quickExamples = ref([
  '查询工厂A的库存情况',
  '分析最近的质量趋势',
  '生成质量报告'
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
    response: '💬'
  }
  return icons[type] || '⚙️'
}

const getStatusText = (status) => {
  const texts = {
    processing: '处理中...',
    completed: '完成'
  }
  return texts[status] || status
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
  currentProcess.value = [
    { type: 'thinking', title: '理解问题', status: 'processing' }
  ]
  
  setTimeout(() => {
    currentProcess.value[0].status = 'completed'
    currentProcess.value.push({ type: 'response', title: '生成回答', status: 'completed' })
    
    messages.value.push({
      type: 'ai',
      content: `我收到了您的问题："${question}"。这是一个测试回复。`,
      timestamp: new Date()
    })
    
    isLoading.value = false
  }, 2000)
}

const clearMessages = () => {
  messages.value = [
    {
      sender: 'assistant',
      text: '对话已清空。您好！我是AI智能问答助手测试版。',
      timestamp: new Date()
    }
  ]
  currentProcess.value = []
  ElMessage.success('对话已清空')
}
</script>

<style scoped>
.ai-assistant-page {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.tools-panel, .chat-panel, .process-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tools-panel {
  width: 300px;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.process-panel {
  width: 350px;
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

.message-text {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
}

.message.user .message-text {
  background: #409eff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
}

.input-actions {
  margin-top: 8px;
  text-align: right;
}

.tool-category {
  padding: 16px;
}

.tool-category h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.tool-icon {
  font-size: 20px;
  margin-right: 12px;
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

.process-content {
  padding: 16px;
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

.process-step {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.process-step.processing {
  border-color: #409eff;
}

.process-step.completed {
  border-color: #67c23a;
}

.step-header {
  padding: 12px 16px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 8px;
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

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
