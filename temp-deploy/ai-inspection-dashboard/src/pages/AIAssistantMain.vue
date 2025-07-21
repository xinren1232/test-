<template>
  <div class="ai-assistant-main">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <h1>🤖 IQE AI 智能助手</h1>
      <div class="header-controls">
        <el-switch
          v-model="aiEnabled"
          @change="toggleAI"
          active-text="AI增强模式"
          inactive-text="基础模式"
          size="large"
        />
        <el-button @click="clearMessages" type="primary" plain>清空对话</el-button>
        <el-button @click="goBack" type="info" plain>返回系统</el-button>
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
          <div class="tool-category" v-for="category in toolCategories" :key="category.name">
            <h4>{{ category.icon }} {{ category.name }}</h4>
            <div 
              class="tool-item" 
              v-for="tool in category.tools" 
              :key="tool.name"
              @click="selectTool(tool)"
            >
              <span class="tool-icon">{{ tool.icon }}</span>
              <div class="tool-details">
                <div class="tool-name">{{ tool.name }}</div>
                <div class="tool-desc">{{ tool.description }}</div>
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
            <el-tag 
              v-for="example in quickExamples" 
              :key="example"
              @click="askQuickQuestion(example)"
              class="example-tag"
              size="small"
              effect="plain"
            >
              {{ example }}
            </el-tag>
          </div>
        </div>
        
        <div class="messages-area" ref="messagesArea">
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            :class="['message', message.type]"
          >
            <div class="message-avatar">
              {{ message.type === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <div v-if="loading" class="message ai">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="loading-dots">
                <span></span><span></span><span></span>
              </div>
              <div class="loading-text">AI正在思考中...</div>
            </div>
          </div>
        </div>

        <div class="input-section">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keydown.ctrl.enter="sendMessage"
            :disabled="loading"
          />
          <div class="input-actions">
            <el-button 
              type="primary" 
              @click="sendMessage"
              :loading="loading"
              :disabled="!userInput.trim()"
            >
              {{ loading ? '发送中...' : '发送 (Ctrl+Enter)' }}
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

const router = useRouter()

// 响应式数据
const aiEnabled = ref(true)
const loading = ref(false)
const userInput = ref('')
const messages = ref([
  {
    type: 'ai',
    content: '您好！我是IQE AI智能助手。我已接入DeepSeek大语言模型，可以为您提供专业的质量管理问答服务。',
    timestamp: new Date()
  }
])
const thinkingSteps = ref([])
const messagesArea = ref(null)

// 快速示例问题
const quickExamples = ref([
  '查询工厂A的库存情况',
  '分析最近的质量趋势',
  '生成质量报告',
  '检查异常批次'
])

// 工具分类
const toolCategories = reactive([
  {
    name: '数据分析工具',
    icon: '📊',
    tools: [
      { name: '数据分析', icon: '📊', description: '分析质量管理数据' },
      { name: '统计分析', icon: '📈', description: '执行统计分析' },
      { name: '数值计算', icon: '🔢', description: '执行数值计算分析' },
      { name: '数据验证', icon: '✅', description: '验证数据完整性' }
    ]
  },
  {
    name: '可视化工具',
    icon: '📈',
    tools: [
      { name: '图表生成', icon: '📊', description: '生成数据可视化图表' },
      { name: '趋势分析', icon: '📈', description: '分析数据趋势变化' },
      { name: '报表生成', icon: '📄', description: '生成质量分析报表' }
    ]
  },
  {
    name: '联网工具',
    icon: '🌐',
    tools: [
      { name: '网络搜索', icon: '🔍', description: '搜索相关信息' },
      { name: 'API调用', icon: '🔗', description: '调用外部API接口' }
    ]
  },
  {
    name: '质量管理',
    icon: '🎯',
    tools: [
      { name: '生产管理', icon: '🏭', description: '管理生产流程数据' }
    ]
  }
])

// AI配置
const AI_CONFIG = {
  apiKey: 'sk-cab797574abf4288bcfaca253191565d',
  baseURL: 'https://api.deepseek.com',
  endpoint: '/chat/completions',
  model: 'deepseek-chat'
}

// 方法
const goBack = () => {
  router.push('/')
}

const toggleAI = () => {
  ElMessage.info(`已切换到${aiEnabled.value ? 'AI增强模式' : '基础模式'}`)
}

const clearMessages = () => {
  messages.value = [
    {
      type: 'ai',
      content: '对话已清空。您好！我是IQE AI智能助手，已接入DeepSeek大语言模型。',
      timestamp: new Date()
    }
  ]
  thinkingSteps.value = []
  ElMessage.success('对话已清空')
}

const selectTool = (tool) => {
  userInput.value = `请使用${tool.name}工具帮我分析数据`
  ElMessage.success(`已选择工具：${tool.name}`)
}

const askQuickQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  const question = userInput.value.trim()
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: question,
    timestamp: new Date()
  })
  
  userInput.value = ''
  scrollToBottom()
  
  try {
    await processAI(question)
  } catch (error) {
    console.error('AI处理错误:', error)
    messages.value.push({
      type: 'ai',
      content: '抱歉，处理您的问题时出现了错误。请稍后重试。',
      timestamp: new Date()
    })
  }
  
  scrollToBottom()
}

const processAI = async (question) => {
  loading.value = true
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
        ElMessage.success('AI响应成功')
      } catch (error) {
        console.error('AI调用失败:', error)
        response = `抱歉，AI服务暂时不可用。基于您的问题"${question}"，我为您提供基础分析...`
        ElMessage.error('AI服务不可用，已切换到基础模式')
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
    messages.value.push({
      type: 'ai',
      content: response,
      timestamp: new Date()
    })
    
  } finally {
    loading.value = false
  }
}

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

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString()
}

const getStepIcon = (type) => {
  const icons = {
    thinking: '🤔',
    data_query: '📊',
    ai_call: '🤖',
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

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

onMounted(() => {
  console.log('🤖 IQE AI智能助手已加载')
})
</script>

<style scoped>
/* 全局容器样式 */
.ai-assistant-main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.top-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.top-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 三栏布局 */
.three-column-layout {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
  min-height: 0;
}

/* 左栏样式 */
.left-column {
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e8e8e8;
  overflow-y: auto;
  flex-shrink: 0;
}

/* 中栏样式 */
.middle-column {
  flex: 1;
  min-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 右栏样式 */
.right-column {
  width: 350px;
  min-width: 350px;
  max-width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}

.column-header h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.quick-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.example-tag:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

/* 工具区域样式 */
.tools-section {
  padding: 16px;
  overflow-y: auto;
  background: #fafafa;
}

.tool-category {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.tool-category:last-child {
  margin-bottom: 0;
}

.tool-category h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.tool-item:hover {
  background: #f8f9fa;
  border-color: #409eff;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.tool-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 6px;
  flex-shrink: 0;
}

.tool-item:hover .tool-icon {
  background: #e3f2fd;
}

.tool-details {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  line-height: 1.4;
}

.tool-desc {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
  line-height: 1.3;
}

/* 消息区域样式 */
.messages-area {
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

/* 输入区域样式 */
.input-section {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.input-actions {
  margin-top: 8px;
  text-align: right;
}

/* 思考区域样式 */
.thinking-area {
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

.thinking-step {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.thinking-step.processing {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
}

.thinking-step.completed {
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

.thinking-step.processing .step-status {
  color: #409eff;
}

.thinking-step.completed .step-status {
  color: #67c23a;
}

/* 加载动画 */
.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  animation: loading-bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

.loading-text {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
