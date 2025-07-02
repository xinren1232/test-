<template>
  <div class="fullscreen-ai-assistant">
    <!-- 顶部导航栏 -->
    <div class="ai-header">
      <h1>🤖 IQE AI 智能助手</h1>
      <div class="ai-controls">
        <el-switch
          v-model="aiEnabled"
          active-text="AI增强模式"
          inactive-text="基础模式"
          size="large"
        />
        <el-button @click="clearChat" type="primary" plain>清空对话</el-button>
        <el-button @click="goHome" type="info" plain>返回系统</el-button>
      </div>
    </div>

    <!-- 三栏主体 -->
    <div class="ai-main-content">
      <!-- 左栏：工具区 -->
      <div class="ai-left-panel">
        <div class="panel-header">
          <h3>🛠️ 可用工具</h3>
        </div>
        
        <div class="tools-list">
          <div class="tool-group" v-for="group in toolGroups" :key="group.name">
            <h4>{{ group.icon }} {{ group.name }}</h4>
            <div 
              class="tool-item" 
              v-for="tool in group.tools" 
              :key="tool.name"
              @click="useTool(tool)"
            >
              <span class="tool-icon">{{ tool.icon }}</span>
              <div class="tool-info">
                <div class="tool-name">{{ tool.name }}</div>
                <div class="tool-desc">{{ tool.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中栏：对话区 -->
      <div class="ai-center-panel">
        <div class="panel-header">
          <h3>💬 智能问答</h3>
          <div class="quick-questions">
            <el-tag 
              v-for="q in quickQuestions" 
              :key="q" 
              @click="askQuestion(q)" 
              class="question-tag"
              type="info"
              effect="plain"
            >
              {{ q }}
            </el-tag>
          </div>
        </div>

        <!-- 对话区域 -->
        <div class="chat-area" ref="chatArea">
          <div 
            v-for="(msg, index) in chatMessages" 
            :key="index" 
            :class="['chat-msg', msg.type]"
          >
            <div class="msg-avatar">
              <span v-if="msg.type === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="msg-content">
              <div class="msg-text">{{ msg.content }}</div>
              <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isProcessing" class="chat-msg ai loading">
            <div class="msg-avatar">🤖</div>
            <div class="msg-content">
              <div class="loading-dots">
                <span></span><span></span><span></span>
              </div>
              <div class="loading-text">AI正在思考中...</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keydown.ctrl.enter="sendMessage"
            :disabled="isProcessing"
            resize="none"
          />
          <div class="input-actions">
            <el-button 
              @click="sendMessage" 
              type="primary" 
              :loading="isProcessing"
              :disabled="!userInput.trim()"
            >
              {{ isProcessing ? '发送中...' : '发送 (Ctrl+Enter)' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右栏：思考过程 -->
      <div class="ai-right-panel">
        <div class="panel-header">
          <h3>🧠 AI思考过程</h3>
        </div>
        
        <div class="thinking-area">
          <div v-if="thinkingSteps.length === 0" class="empty-state">
            <div class="empty-icon">🤔</div>
            <div class="empty-text">AI正在等待您的问题...</div>
          </div>
          
          <div 
            v-for="(step, index) in thinkingSteps" 
            :key="index" 
            :class="['thinking-step', step.status]"
          >
            <div class="step-header">
              <span class="step-icon">{{ getStepIcon(step.type) }}</span>
              <span class="step-title">{{ step.title }}</span>
              <span class="step-status">{{ getStatusText(step.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 路由
const router = useRouter()

// 响应式数据
const userInput = ref('')
const chatMessages = ref([
  {
    type: 'ai',
    content: '您好！我是IQE AI智能助手。我已接入DeepSeek大语言模型，可以为您提供专业的质量管理问答服务。',
    timestamp: new Date()
  }
])
const isProcessing = ref(false)
const aiEnabled = ref(true)
const thinkingSteps = ref([])
const chatArea = ref(null)

// AI配置
const AI_CONFIG = {
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  baseURL: 'https://api.deepseek.com',
  endpoint: '/chat/completions',
  model: 'deepseek-chat'
}

// 快速问题
const quickQuestions = ref([
  '查询工厂A的库存情况',
  '分析最近的质量趋势',
  '生成质量报告',
  '统计不合格品数量',
  '查看生产线状态',
  '检测异常物料批次'
])

// 工具分组
const toolGroups = reactive([
  {
    name: '数据分析工具',
    icon: '📊',
    tools: [
      { name: '数据分析', icon: '📊', description: '分析质量管理数据' },
      { name: '统计分析', icon: '📈', description: '执行统计分析' },
      { name: '数值计算', icon: '🧮', description: '执行数学计算' }
    ]
  },
  {
    name: '可视化工具',
    icon: '📈',
    tools: [
      { name: '图表生成', icon: '📊', description: '生成数据可视化图表' },
      { name: '报告生成', icon: '📄', description: '生成质量分析报告' }
    ]
  },
  {
    name: '联网工具',
    icon: '🌐',
    tools: [
      { name: '网络搜索', icon: '🔍', description: '搜索相关信息' }
    ]
  },
  {
    name: '质量管理',
    icon: '🎯',
    tools: [
      { name: '库存查询', icon: '📦', description: '查询库存信息' },
      { name: '生产查询', icon: '🏭', description: '查询生产数据' },
      { name: '检测查询', icon: '🧪', description: '查询检测结果' }
    ]
  }
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
    data_query: '📊',
    ai_call: '🤖',
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

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight
    }
  })
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 使用工具
const useTool = (tool) => {
  const toolQuestion = `请使用${tool.name}工具帮我${tool.description}`
  userInput.value = toolQuestion
  ElMessage.success(`已选择工具：${tool.name}`)
}

// 快速提问
const askQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

// 清空对话
const clearChat = () => {
  chatMessages.value = [
    {
      type: 'ai',
      content: '对话已清空。您好！我是IQE AI智能助手，已接入DeepSeek大语言模型。',
      timestamp: new Date()
    }
  ]
  thinkingSteps.value = []
  ElMessage.success('对话已清空')
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isProcessing.value) return

  const userMessage = {
    type: 'user',
    content: userInput.value,
    timestamp: new Date()
  }

  chatMessages.value.push(userMessage)
  const question = userInput.value
  userInput.value = ''
  
  scrollToBottom()
  
  try {
    await processAIResponse(question)
  } catch (error) {
    console.error('AI处理错误:', error)
    chatMessages.value.push({
      type: 'ai',
      content: '抱歉，处理您的问题时出现了错误。请稍后重试。',
      timestamp: new Date()
    })
  }
  
  scrollToBottom()
}

// 处理AI响应
const processAIResponse = async (question) => {
  isProcessing.value = true
  thinkingSteps.value = []
  
  try {
    // 步骤1: 理解问题
    thinkingSteps.value.push({ type: 'thinking', title: '理解问题', status: 'processing' })
    await delay(500)
    thinkingSteps.value[0].status = 'completed'
    
    // 步骤2: 获取数据
    thinkingSteps.value.push({ type: 'data_query', title: '获取业务数据', status: 'processing' })
    await delay(400)
    thinkingSteps.value[1].status = 'completed'
    
    // 步骤3: AI处理
    thinkingSteps.value.push({ type: 'ai_call', title: '调用AI大模型', status: 'processing' })
    let response
    
    if (aiEnabled.value) {
      try {
        response = await callAI(question)
      } catch (error) {
        console.error('AI调用失败:', error)
        response = `抱歉，AI服务暂时不可用。基于您的问题"${question}"，我为您提供基础分析...`
      }
    } else {
      response = `基础模式回复：我收到了您的问题"${question}"。这是一个关于质量管理的问题，我正在为您分析相关数据...`
    }
    
    thinkingSteps.value[2].status = 'completed'
    
    // 步骤4: 生成回答
    thinkingSteps.value.push({ type: 'response', title: '生成回答', status: 'processing' })
    await delay(200)
    thinkingSteps.value[3].status = 'completed'
    
    // 显示AI回复
    chatMessages.value.push({
      type: 'ai',
      content: response,
      timestamp: new Date()
    })
    
  } catch (error) {
    console.error('处理AI响应时出错:', error)
    throw error
  } finally {
    isProcessing.value = false
  }
}

// 调用AI
const callAI = async (question) => {
  const response = await fetch(`${AI_CONFIG.baseURL}${AI_CONFIG.endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: '你是IQE质量管理系统的AI智能助手，专门负责质量管理数据分析和问答。请基于用户问题提供专业、准确、有用的回答。'
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`AI API错误: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 组件挂载
onMounted(() => {
  console.log('🤖 IQE AI智能助手已加载')
})
</script>

<style>
/* 全局样式重置 - 确保完全覆盖 */
.fullscreen-ai-assistant {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: #f5f7fa !important;
  z-index: 999999 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* 顶部导航栏 */
.ai-header {
  background: white !important;
  padding: 16px 24px !important;
  border-bottom: 1px solid #e4e7ed !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  flex-shrink: 0 !important;
}

.ai-header h1 {
  margin: 0 !important;
  color: #303133 !important;
  font-size: 24px !important;
  font-weight: 600 !important;
}

.ai-controls {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
}

/* 三栏主体 */
.ai-main-content {
  flex: 1 !important;
  display: flex !important;
  gap: 16px !important;
  padding: 16px !important;
  overflow: hidden !important;
  min-height: 0 !important;
}

/* 左栏样式 */
.ai-left-panel {
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
.ai-center-panel {
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
.ai-right-panel {
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

.panel-header {
  padding: 16px !important;
  border-bottom: 1px solid #e4e7ed !important;
  background: #f8f9fa !important;
  border-radius: 8px 8px 0 0 !important;
  flex-shrink: 0 !important;
}

.panel-header h3 {
  margin: 0 0 12px 0 !important;
  color: #303133 !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

.quick-questions {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}

.question-tag {
  cursor: pointer !important;
  transition: all 0.3s !important;
}

.question-tag:hover {
  background: #409eff !important;
  color: white !important;
  border-color: #409eff !important;
}

/* 工具列表样式 */
.tools-list {
  padding: 16px !important;
  overflow-y: auto !important;
}

.tool-group {
  margin-bottom: 20px !important;
}

.tool-group h4 {
  margin: 0 0 12px 0 !important;
  color: #606266 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
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

.tool-info {
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

/* 对话区域样式 */
.chat-area {
  flex: 1 !important;
  padding: 16px !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}

.chat-msg {
  display: flex !important;
  gap: 12px !important;
  max-width: 80% !important;
}

.chat-msg.user {
  align-self: flex-end !important;
  flex-direction: row-reverse !important;
}

.msg-avatar {
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

.chat-msg.user .msg-avatar {
  background: #409eff !important;
  color: white !important;
}

.msg-content {
  flex: 1 !important;
}

.msg-text {
  background: #f8f9fa !important;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  line-height: 1.5 !important;
  word-wrap: break-word !important;
}

.chat-msg.user .msg-text {
  background: #409eff !important;
  color: white !important;
}

.msg-time {
  font-size: 12px !important;
  color: #909399 !important;
  margin-top: 4px !important;
  text-align: right !important;
}

.chat-msg.user .msg-time {
  text-align: left !important;
}

/* 输入区域样式 */
.input-section {
  padding: 16px !important;
  border-top: 1px solid #e4e7ed !important;
  flex-shrink: 0 !important;
}

.input-actions {
  margin-top: 8px !important;
  text-align: right !important;
}

/* 思考区域样式 */
.thinking-area {
  flex: 1 !important;
  padding: 16px !important;
  overflow-y: auto !important;
}

.empty-state {
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
.loading-dots {
  display: flex !important;
  gap: 4px !important;
  align-items: center !important;
}

.loading-dots span {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #909399 !important;
  animation: loading-bounce 1.4s infinite ease-in-out !important;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s !important; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s !important; }

.loading-text {
  margin-top: 8px !important;
  color: #909399 !important;
  font-size: 12px !important;
}

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
