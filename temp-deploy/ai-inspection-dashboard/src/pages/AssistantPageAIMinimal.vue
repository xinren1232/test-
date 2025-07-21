<template>
  <div class="ai-assistant-minimal">
    <div class="header">
      <h1>🤖 AI助手 - 最小化版本</h1>
      <p>用于测试和调试的最小化版本</p>
    </div>
    
    <div class="main-content">
      <!-- 左侧工具面板 -->
      <div class="left-panel">
        <h3>🛠️ 工具面板</h3>
        <div class="tool-list">
          <div class="tool-item" @click="selectTool('analyze')">
            📊 数据分析
          </div>
          <div class="tool-item" @click="selectTool('query')">
            🔍 查询工具
          </div>
          <div class="tool-item" @click="selectTool('chart')">
            📈 图表生成
          </div>
        </div>
        
        <div v-if="selectedTool" class="selected-tool">
          <h4>已选择: {{ selectedTool }}</h4>
        </div>
      </div>
      
      <!-- 中间对话区域 -->
      <div class="center-panel">
        <h3>💬 对话区域</h3>
        
        <div class="chat-container">
          <div class="messages">
            <div 
              v-for="(message, index) in messages" 
              :key="index"
              class="message"
              :class="message.type"
            >
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <div class="input-area">
            <input 
              v-model="inputMessage"
              @keyup.enter="sendMessage"
              placeholder="输入您的问题..."
              class="message-input"
              :disabled="isLoading"
            />
            <button 
              @click="sendMessage" 
              class="send-button"
              :disabled="isLoading || !inputMessage.trim()"
            >
              {{ isLoading ? '处理中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 右侧思考过程 -->
      <div class="right-panel">
        <h3>🧠 AI思考过程</h3>
        
        <div class="thinking-container">
          <div v-if="isLoading" class="thinking-indicator">
            <div class="spinner"></div>
            <span>AI正在思考...</span>
          </div>
          
          <div class="thinking-steps">
            <div 
              v-for="(step, index) in thinkingSteps" 
              :key="index"
              class="thinking-step"
              :class="{ active: step.active, completed: step.completed }"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-description">{{ step.description }}</div>
                <div v-if="step.details" class="step-details">
                  {{ step.details }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式数据
const messages = ref([
  {
    type: 'assistant',
    content: '您好！我是IQE AI智能助手最小化版本，用于测试基本功能。',
    timestamp: new Date()
  }
])

const inputMessage = ref('')
const isLoading = ref(false)
const selectedTool = ref(null)
const thinkingSteps = ref([])

// 方法
const selectTool = (tool) => {
  selectedTool.value = tool
  console.log('选择工具:', tool)
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const userQuestion = inputMessage.value.trim()
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: userQuestion,
    timestamp: new Date()
  })
  
  inputMessage.value = ''
  isLoading.value = true
  thinkingSteps.value = []
  
  try {
    // 模拟AI处理过程
    await simulateAIProcess(userQuestion)
    
    // 添加AI回复
    messages.value.push({
      type: 'assistant',
      content: generateResponse(userQuestion),
      timestamp: new Date()
    })
    
  } catch (error) {
    console.error('处理消息失败:', error)
    messages.value.push({
      type: 'assistant',
      content: '抱歉，处理您的请求时出现了错误。',
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
  }
}

const simulateAIProcess = async (question) => {
  // 步骤1：问题分析
  addThinkingStep('问题分析', '正在分析用户问题的意图和类型...', true)
  await delay(800)
  updateThinkingStep(0, { completed: true, details: '识别为查询类问题' })
  
  // 步骤2：数据查询
  addThinkingStep('数据查询', '正在查询相关数据源...', true)
  await delay(1200)
  updateThinkingStep(1, { completed: true, details: '查询到相关数据' })
  
  // 步骤3：结果生成
  addThinkingStep('结果生成', '正在生成回答...', true)
  await delay(1000)
  updateThinkingStep(2, { completed: true, details: '回答生成完成' })
}

const addThinkingStep = (title, description, active = false) => {
  thinkingSteps.value.push({
    title,
    description,
    active,
    completed: false,
    details: null
  })
}

const updateThinkingStep = (index, updates) => {
  if (thinkingSteps.value[index]) {
    Object.assign(thinkingSteps.value[index], updates)
  }
}

const generateResponse = (question) => {
  const responses = [
    `我理解您的问题："${question}"。这是一个测试回复。`,
    `关于"${question}"，我已经为您分析了相关信息。`,
    `根据您的问题"${question}"，我建议您查看相关数据。`,
    `针对"${question}"这个问题，我可以为您提供以下建议...`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<style scoped>
.ai-assistant-minimal {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
}

.header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 1px;
  background: #e1e5e9;
  overflow: hidden;
}

.left-panel, .center-panel, .right-panel {
  background: white;
  display: flex;
  flex-direction: column;
}

.left-panel {
  width: 280px;
  padding: 20px;
}

.center-panel {
  flex: 1;
  padding: 20px;
}

.right-panel {
  width: 320px;
  padding: 20px;
}

.left-panel h3, .center-panel h3, .right-panel h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 16px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-item {
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e9ecef;
}

.tool-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-1px);
}

.selected-tool {
  margin-top: 20px;
  padding: 12px;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #e9ecef;
}

.message-content {
  margin-bottom: 6px;
  line-height: 1.4;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.input-area {
  display: flex;
  gap: 12px;
  padding: 20px 0 0 0;
  border-top: 1px solid #e1e5e9;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

.message-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.message-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

.send-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.send-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.thinking-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff3cd;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #ffc107;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.thinking-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.thinking-step {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e9ecef;
  transition: all 0.3s;
}

.thinking-step.active {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.thinking-step.completed {
  background: #d4edda;
  border-left-color: #28a745;
}

.step-number {
  width: 28px;
  height: 28px;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.thinking-step.active .step-number {
  background: #ffc107;
}

.thinking-step.completed .step-number {
  background: #28a745;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 14px;
}

.step-description {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 6px;
}

.step-details {
  font-size: 12px;
  color: #495057;
  background: rgba(255,255,255,0.7);
  padding: 6px 8px;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .left-panel, .right-panel {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .left-panel, .right-panel {
    height: 150px;
  }
  
  .header h1 {
    font-size: 20px;
  }
}
</style>
